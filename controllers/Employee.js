import Users from "../models/EmployeeModel.js";
import Container from "../models/ContainerModel.js";
import Waste from "../models/WasteModel.js";
import Bin from "../models/BinModel.js";
import transaction from "../models/TransactionModel.js";
import moment from "moment";
import { updateBinWeightData } from "./Bin.js";
import employee from "../models/EmployeeModel.js";
import axios from "axios";
import os from "os";
import { Op, QueryTypes } from "sequelize";
import db from "../config/db.js";
import { employeeQueue, pendingQueue, weightbinQueue } from "../index.js";
export const ScanBadgeid = async (req, res) => {
  const { badgeId } = req.body;
  try {
    const user = await Users.findOne({
      attributes: ["badgeId", "username", "IN", "OUT"],
      where: { badgeId:badgeId,isactive:1 },
    });
    employeeQueue.add({id:1});
    if (user) {
      res.json({ user: user });
    } else {
      res.json({ error: "Badge ID not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};
export const TransactionStep1 = async (req, res) => {
  const { idscraplog, waste, container, badgeId, toBin } = req.body;
  const _waste = await Waste.findOne({
    where: {
      name: waste,
    },
  });
  const _container = await Container.findOne({
    where: {
      name: container,
    },
  });
  const _badge = await employee.findOne({
    attributes: ["badgeId"],
    where: {
      badgeId: badgeId,
    },
  });
  if (!_waste) return res.json({ msg: "Waste Not Found" }, 404);
  if (!_container) return res.json({ msg: " Container Not Found" }, 404);
  if (!_badge) return res.json({ msg: "Badge not found" }, 404);
  const transactionData = {
    idscraplog: idscraplog,
    IdWaste: _waste.getDataValue("Id"),
    idContainer: _container.getDataValue("containerId"),
    badgeId: badgeId,
    status: "Step-1",
    weight: 0,
    type: "",
    toBin: toBin,
    fromContainer: container,
  };
  const state = await transaction.create(transactionData);
  state.save();
  pendingQueue.add({id:2});
  return res.status(200).json({ msg: "OK" });
};
export const ScanContainer = async (req, res) => {
  const { containerId } = req.body;
  try {
    weightbinQueue.add({id:3});
    const container = await Container.findOne({
      attributes: [
        "containerId",
        "name",
        "station",
        "weightbin",
        "IdWaste",
        "type",
      ],
      include: [
        {
          model: Waste,
          as: "waste",
          required: true,
          duplicating: true,
          foreignKey: "IdWaste",
          attributes: ["name", "scales", "handletype", "step1"],
          include: [
            {
              model: Bin,
              as: "bin",
              required: false,
              duplicating: true,
              foreignKey: "IdWaste",
              attributes: ["name", "id", "IdWaste", "name_hostname", "weight"],
            },
          ],
        },
      ],
      where: { name: containerId },
    });

    if (container) {
      res.json({ container: container });
    } else {
      res.json({ error: "Container ID not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const VerificationScan = async (req, res) => {
  const { binName } = req.body;
  try {
    const bin = await Bin.findOne({
      attributes: ["name"],
      where: { name: binName },
    });

    if (bin) {
      res.json({ bin: bin });
    } else {
      res.json({ error: "Container ID not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const CheckBinCapacity = async (req, res) => {
  const { IdWaste, neto } = req.body;
  try {
    // Mengambil semua tempat sampah yang sesuai dengan type_waste dari database
    const bins = await Bin.findAll({
      where: {
        IdWaste: IdWaste,
      },
    });

    // Jika tidak ada tempat sampah yang ditemukan untuk type_waste yang diberikan
    if (!bins || bins.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No bins found for the given waste type",
        });
    }

    // Menyaring tempat sampah yang memiliki kapasitas cukup untuk neto
    let eligibleBins = bins.filter(
      (bin) =>
        parseFloat(bin.weight) + parseFloat(neto) <= parseFloat(bin.max_weight)
    );

    // Jika tidak ada tempat sampah yang memenuhi kapasitas
    if (eligibleBins.length === 0) {
      return res
        .status(200)
        .json({
          success: false,
          message: "No bins with enough capacity found",
        });
    }

    // Mengurutkan tempat sampah berdasarkan kapasitas yang paling kosong terlebih dahulu
    eligibleBins = eligibleBins.sort(
      (a, b) => parseFloat(a.weight) - parseFloat(b.weight)
    );

    // Memilih tempat sampah yang paling kosong
    let selectedBin = eligibleBins[0];

    res.status(200).json({ success: true, bin: selectedBin });
  } catch (error) {
    console.log("Error checking bin capacity:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const SaveTransaksi = async (req, res) => {
  const { payload } = req.body;
  payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
  (await transaction.create(payload)).save();
  //    const data = await syncPendingTransaction();
  pendingQueue.add({id:0});
  res.status(200).json({ msg: "ok" });
};
export const getTransaction = async (req, res) => {
  const { containerName } = req.params;
  const tr = await transaction.findOne({
    where: {
      fromContainer: containerName,
      status: "Step-1",
      idscraplog: {
        [Op.ne]: "Fail",
      },
    },
    order: [["recordDate", "DESC"]],
  });
  return res.status(!tr ? 404 : 200).json(!tr ? { msg: "not found" } : tr);
};
export const syncTransactionStep1 = async () => {
  let _data;
  try {
    const _res = await axios.get(
      `http://${process.env.STEP1}/sync/` + os.hostname(),
      { timeout: 1500 }
    );
    const trData = _res.data;
    if (!trData.length) return null;
    _data = _res.data;
    for (let i = 0; i < trData.length; i++) {
      const tr = trData[i];
      const _container = await Container.findOne({
        where: {
          name: tr.container.name,
        },
      });
      if (!_container) continue;
      _data = { i: i, data: trData[i] };
      const _waste = await Waste.findOne({
        where: {
          name: tr.waste.name,
        },
      });
      const data = await transaction.findOne({
        where: {
          fromContainer: _container.name,
          toBin: tr.bin,
          idscraplog: tr.idscraplog,
          status: "Step-1",
        },
      });
      _data = data;
      if (data) continue;
      const state = await transaction.create({
        idscraplog: tr.idscraplog,
        IdWaste: _waste.getDataValue("Id"),
        idContainer: _container.getDataValue("containerId"),
        badgeId: tr.badgeId,
        status: "Step-1",
        weight: 0,
        type: "",
        toBin: tr.bin,
        fromContainer: _container.name,
      });
      state.save();
      return _data;
    }
  } catch (er) {
    console.log(er);
    return null;
  }
};
export const syncTransaction = async (req, res) => {
  try {
    await syncTransactionStep1();
    return res.status(200).json({ msg: "Sync Success" });
  } catch (err) {
    return res.status(500).json({ err: err.message, data: _data });
  }
};
export const UpdateTransaksi = async (req, res) => {
  const { idscraplog } = req.params;
  const { status, type, weight, logindate } = req.body;
  const _transaction = await transaction.findOne({
    where: {
      idscraplog: idscraplog,
    },
    order: [["recordDate", "DESC"]],
  });
  if (!_transaction) return res.json({ msg: "Transaction Not Found" }, 404);
  let count = 0;
  while (count < 100) {
    try {
      const _res = await axios.put(
        `http://${process.env.STEP1}/step1/` + idscraplog,
        { status: "Done", logindate: logindate },
        {
          validateStatus: (status) => {
            return (status >= 200 && status < 300) || status == 404;
          },
        }
      );
      if (status == 404) {
        console.log(`${idscraplog} - ${_transaction.dataValues.id} NOT FOUND`);
        _transaction.setDataValue("status", "PENDING|STEP1");
        _transaction.setDataValue("success", false);
      }
      _transaction.setDataValue("status", status);
      _transaction.setDataValue("type", type);
      _transaction.setDataValue("weight", weight);
      await _transaction.save();

      return res.json({ msg: "Ok" }, 200);
    } catch (err) {
      if (count < 100) {
        count = count + 1;
        continue;
      }
      _transaction.setDataValue("status", "PENDING|STEP1");
      _transaction.setDataValue("success", false);
      return res.json({ msg: err.response ? err.response.data : err }, 500);
    }
  }
};
export const SyncAll = async (req,res)=>{
  await syncPendingTransaction();
  await syncTransactionStep1();
 
 await syncEmployeePIDSG();
  await syncPIDSGBin();
  await syncPIDSGContainer();
  return res.json({msg:"ok"},200);
}

export const SaveTransaksiCollection = async (req, res) => {
  const { payload } = req.body;
  payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
  (await transaction.create(payload)).save();
  queue.create("sync-pending",{id:1}).save();
  res.status(200).json({ msg: "ok" });
};

export const UpdateBinWeight = async (req, res) => {
  const { binId, neto } = req.body;
  const data = await Bin.findOne({ where: { id: binId } });
  if (
    parseFloat(neto) + parseInt(data.dataValues.weight) >=
    data.dataValues.max_weight
  )
    return res
      .status(500)
      .json({ error: "Berat Melampaui Kapasitas maksimum bin" });
  const binData = await Bin.findAll({ where: { name: data.dataValues.name } });
  for (let i = 0; i < binData.length; i++) {
    binData[i].weight = parseFloat(neto) + parseFloat(data.weight);
    await binData[i].save();
  }
  await updateBinWeightData(data.name_hostname);
  //   await switchLamp(data.id,"RED",data.weight >= parseFloat(data.max_weight))
  res.status(200).json({ msg: "ok" });
};
export const UpdateStep3Value = async (containerName, isRack, weight) => {
  try {
    const _containerName = isRack
      ? process.env.RACK_TARGET_CONTAINER
      : containerName;
    const res = await axios.put(
      `http://${process.env.STEP3}/step2value/` + _containerName,
      { value: weight, fromRack: isRack },
      { timeout: 3000 }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
export const UpdateBinWeightCollection = async (req, res) => {
  const { binId } = req.body; // neto is not needed as weight will be set to 0
  const data = await Bin.findOne({
    where: { id: binId },
    include: [
      {
        model: Waste,
        as: "waste",
        required: true,
        duplicating: true,
        foreignKey: "IdWaste",
        attributes: ["name", "scales", "handletype", "step1"],
      },
    ],
  });

  let sendWeight = data.dataValues.weight;
  const isRack = data.dataValues.waste.handletype == "Rack";
  console.log({ handleType: isRack });
  // if (isRack)
  // {
  //     const allRacks = await db.query("Select sum(b.weight) as totalWeight from bin b inner join waste w on b.IdWaste=w.Id where w.handletype='Rack';",
  //     {
  //         type: QueryTypes.SELECT
  //     });
  //     sendWeight = parseFloat(allRacks[0].totalWeight);
  // }
  const step3 = await UpdateStep3Value(
    data.dataValues.name,
    data.dataValues.waste.handletype == "Rack",
    sendWeight
  );
  if (data) {
    const binData = await Bin.findAll({
      where: { name: data.dataValues.name },
    });
    /*try
        {
            await axios.post(`http://${binData.name_hostname}/Start`,{bin: {...binData,type:"Collection"}},{
                timeout:1000,
                withCredentials:false
            });
        }
        catch (er){
            return res.status(500).json(er);
        }*/
    for (let i = 0; i < binData.length; i++) {
      binData[i].weight = 0;
      await binData[i].save();
    }
    await updateBinWeightData(data.name_hostname);
    res.status(200).json({ msg: "ok", step3: step3 });
  } else {
    res.status(404).json({ msg: "Bin not found" });
  }
};
export const syncPendingTransaction = async () => {
  const transactionPendingRecords = await db.query(
    "Select t.id,c.station,t.toBin,t.fromContainer,t.weight,t.type,t.badgeId,t.status from transaction t left join container c on t.idContainer=c.containerId where t.status like '%PENDING%' "
  );
  if (!transactionPendingRecords || transactionPendingRecords.length < 1)
    return transactionPendingRecords;
  const transactionPending = transactionPendingRecords[0];
  if (!transactionPending || transactionPending.length < 1)
    return transactionPending;
  let cancel = false;
  for (let i = 0; i < transactionPending.length; i++) {
    console.log(transactionPending[i]);
    const statuses = transactionPending[i].status.split("|");
    let index = statuses.indexOf("PENDING");
    if (index > -1) statuses.splice(index, 1);
    index = statuses.indexOf("Pending");
    if (index > -1) statuses.splice(index, 1);

    if (statuses.includes("PIDSG")) {
      try {
        await axios.post(`http://${process.env.PIDSG}/api/pid/sendWeight`, {
          binname: transactionPending[i].fromContainer,
          weight: transactionPending[i].weight,
        });
      } catch {}
      try {
        await axios.get(
          `http://${process.env.PIDSG}/api/pid/pibadgeverify?f1=${transactionPending[i].station}&f2=${transactionPending[i].badgeId}`,
          { validateStatus: (s) => true }
        );
        const res = await axios.post(
          `http://${process.env.PIDSG}/api/pid/pidatalog`,
          {
            badgeno: transactionPending[i].badgeId,
            logindate: "",
            stationname: transactionPending[i].station,
            frombinname: transactionPending[i].fromContainer,
            tobinname: transactionPending[i].toBin,
            weight: transactionPending[i].weight,
            activity: transactionPending[i].type,
          },
          {
            validateStatus: (s) => true,
            timeout: 1000,
          }
        );
        console.log({ pidsg_res: res });
        if (res.status >= 200 && res.status < 300) {
          const index = statuses.indexOf("PIDSG");
          statuses.splice(index, 1);
        }
      } catch(e) {
        console.log(e);
      }
    }
    if (statuses.includes("STEP1")) {
      try {
        await axios.put(
          `http://${process.env.STEP1}/step1/` + idscraplog,
          { status: "Done", logindate: formatDate(new Date().toISOString()) },
          {
            timeout: 1000,
            validateStatus: (status) => {
              return true;
            },
          }
        );
        if (res.status >= 200 && res.status < 300) {
          const index = statuses.indexOf("STEP1");
          statuses.splice(index, 1);
        }
      } catch (e) {
        console.log(e);
      }
    }
    if (statuses.includes("STEP3")) {
      try {
        const res = await axios.post(
          `http://${process.env.STEP3}/Step2Value/` + transactionPending[i].fromContainer,
          { value: transactionPending[i].weight },
          { timeout: 3000, validateStatus: (s) => true }
        );
        if (res.status >= 200 && res.status < 300) {
          const index = statuses.indexOf("STEP3");
          statuses.splice(index, 1);
        }
      } catch (er) {
        console.log(er);
      }
    }
    if (statuses.length < 1) {
      transactionPending[i].status = "Done";
      transactionPending[i].success = true;
    } else {
      transactionPending[i].status = `PENDING|${statuses.join("|")}`;
      transactionPending[i].success = false;
    }

    const query = `Update transaction set status='${
      transactionPending[i].status
    }',success=${transactionPending[i].success ? 1 : 0}  where Id='${
      transactionPending[i].id
    }'`;
    console.log([query, statuses, transactionPending[i]]);
    await db.query(query, {
      type: QueryTypes.BULKUPDATE,
    });
  }
  return transactionPending;
};
export const syncPendingTransactionAPI = async (req, res) => {
  const data = await syncPendingTransaction();
  return res.status(200).json({ msg: data });
};
const formatDate = (date) => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
export const UpdateContainerStatus = async (req, res) => {
  const { containerName, status } = req.body;
  const data = await Bin.findOne({ where: { name: containerName } });
  data.status = status;
  await data.save();

  //    await updateBinWeightData(data.name_hostname);
  // await switchLamp(data.id,"RED",data.weight >= parseFloat(data.max_weight))
  res.status(200).json({ msg: "ok" });
};

/* export const Hostname = async (res) => {
    const hostname = os.hostname();
    res.status(200).json({ hostname });
} */
export const syncEmployeePIDSGAPI = async (req,res)=>{
    return res.json(await syncEmployeePIDSG());
}
export const getEmpData = async (req,res)=>{
  const data = await db.query("Select badgeid,username from employee",{
    type: QueryTypes.SELECT
  });
  return res.json({data:data});
}
export const syncEmployeePIDSG = async ()=>{
    try
    {
        const apiRes = await axios.get(
            `http://${process.env.PIDSG}/api/pid/employee-sync?f1=${process.env.STATION}`);
        const syncEmp = apiRes.data.result[0];
        const apiEmpBadgeNo= [];
        for (let i=0;i<syncEmp.length;i++)
        {
            const empRes = await db.query("Select badgeId,username,`IN` as in_1,`OUT` as out_1 from employee where badgeId=?",{type:QueryTypes.SELECT,replacements:[syncEmp[i].badgeno]});
            apiEmpBadgeNo.push(`'${syncEmp[i].badgeno}'`);
            if (empRes.length < 1)
            {
                await db.query("Insert Into employee(username,isactive,badgeId,`IN`,`OUT`) values(?,1,?,?,?)",
                {
                    type:QueryTypes.INSERT,
                    replacements: [syncEmp[i].employeename,syncEmp[i].badgeno,syncEmp[i].IN>=1,syncEmp[i].OUT>=1]
                });
            }
            else
            {
                await db.query("Update employee set username=?,`IN`=?,`OUT`=?,isactive=1 where badgeId=?",{
                    type: QueryTypes.UPDATE,
                    replacements: [syncEmp[i].employeename,syncEmp[i].IN>=1,syncEmp[i].OUT>=1,syncEmp[i].badgeno]
                })
            }
        }

        await db.query("Update employee set `IN`=0,`OUT`=0,isactive=0 where badgeId not in (" + apiEmpBadgeNo.join(",") + ")",{
          type: QueryTypes.UPDATE
        });
    }
    catch (er)
    {
        console.log(er);
        return  er.message || er;
    }
}
export const syncPIDSGBinAPI = async (req,res)=>{
  return res.json(await syncPIDSGBin());
}
export const syncPIDSGBin = async()=>{
  try
    {
        const dataBin = await db.query(" select b.id,b.name,c.station from bin b left join container c on b.name=c.name",{
        type: QueryTypes.SELECT
        });
        const binNames = dataBin.map(x=>x.name); 
        console.log(
          `http://${process.env.PIDSG}/api/pid/bin-sync?f1=${JSON.stringify(binNames)}`);
        const apiRes = await axios.get(
            `http://${process.env.PIDSG}/api/pid/bin-sync?f1=${JSON.stringify(binNames)}`);
        const syncBin = apiRes.data.result[0];
        for (let i=0;i<syncBin.length;i++)
        {
            await db.query("update bin b left join container c on b.name=c.name  set max_weight=? where b.name=? ",{
                    type: QueryTypes.UPDATE,
                    replacements: [syncBin[i].capacity,syncBin[i].name]
                })
        }
        return syncBin;
    }
    catch (er)
    {
        console.log(er);
        return  er.message || er;
    }
}

export const syncPIDSGContainer = async()=>{
  try
    {
        const dataBin = await db.query(" select containerid,name,station,weightbin from container",{
        type: QueryTypes.SELECT
        });
        const binNames = dataBin.map(x=>x.name); 
        console.log(
          `http://${process.env.PIDSG}/api/pid/bin-sync?f1=${JSON.stringify(binNames)}`);
        const apiRes = await axios.get(
            `http://${process.env.PIDSG}/api/pid/bin-sync?f1=${JSON.stringify(binNames)}`);
        const syncBin = apiRes.data.result[0];
        for (let i=0;i<syncBin.length;i++)
        {
            await db.query("update   container set weightbin=? where name=? ",{
                    type: QueryTypes.UPDATE,
                    replacements: [syncBin[i].weight,syncBin[i].name]
                })
        }
        return syncBin;
    }
    catch (er)
    {
        console.log(er);
        return  er.message || er;
    }
}

export const syncPIDSGBinContainerAPI = async (req,res)=>{
  return res.json(await syncPIDSGContainer());
}