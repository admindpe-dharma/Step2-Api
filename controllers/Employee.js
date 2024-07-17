import Users from "../models/EmployeeModel.js"
import Container from "../models/ContainerModel.js";
import Waste from "../models/WasteModel.js";
import Bin from "../models/BinModel.js";
import transaction from "../models/TransactionModel.js"
import moment from 'moment';
import { updateBinWeightData } from "./Bin.js";
import employee from "../models/EmployeeModel.js";
import axios from 'axios';
import os from  'os';
import { Op } from "sequelize";

export const ScanBadgeid = async (req, res) => {
    const { badgeId } = req.body;
    try {
        const user = await Users.findOne({ attributes: ['badgeId',"username"], where: { badgeId } });
        if (user) {
            res.json({ user: user });
        } else {
            res.json({ error: 'Badge ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server'  });
    }
};
export const TransactionStep1 = async (req,res) =>{
    const { idscraplog,waste,container,badgeId,toBin } = req.body;
    const _waste = await Waste.findOne({
        where:{
            name: waste
        }
    });
    const _container = await Container.findOne({
        where:{
            name: container
        }
    });
    const _badge = await employee.findOne({
        attributes: ["badgeId"],
        where:{
        badgeId : badgeId 
        }
    });
    console.log("start");
    if (!_waste)
        return res.json({msg: "Waste Not Found"},404);
    if (!_container)
        return res.json({msg:" Container Not Found"},404);
    if (!_badge)
        return res.json({msg: "Badge not found"},404);
    console.log(_waste);
    const transactionData = {
        idscraplog: idscraplog,
        IdWaste: _waste.getDataValue("Id"),
        idContainer : _container.getDataValue("containerId"),
        badgeId: badgeId,
        status: "Step-1",
        weight: 0,
        type: '',
        toBin: toBin,
        fromContainer: container,
    };
    const state = await transaction.create(transactionData);
    state.save();
    return res.status(200).json({msg:"OK"});
    
}
export const ScanContainer = async (req, res) => {
    const { containerId } = req.body;
    try {
        const container = await Container.findOne({
            attributes: [ 'containerId','name', 'station', 'weightbin', 'IdWaste','type'],
            include: [
                {
                    model: Waste,
                    as: 'waste',
                    required: true,
                    duplicating: true,
                    foreignKey: 'IdWaste',
                    attributes: ['name','scales','handletype','step1'],
                    include: [
                {
                    model: Bin,
                    as: 'bin',
                    required: false,
                    duplicating:true,
                    foreignKey: 'IdWaste',
                    attributes: ['name', 'id', 'IdWaste','name_hostname','weight']
                }
                    ]
                }
            ],
            where: { name: containerId }
        });

        if (container) {
            res.json({ container:container });
        } else {
            res.json({ error: 'Container ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const VerificationScan = async (req, res) => {
    const { binName } = req.body;
    try {
        const bin = await Bin.findOne({
            attributes: ['name'],where: { name: binName }
        });

        if (bin) {
            res.json({ bin:bin });
        } else {
            res.json({ error: 'Container ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const CheckBinCapacity = async (req, res) => {
    const { IdWaste, neto } = req.body;
console.log(IdWaste);
    try {
        // Mengambil semua tempat sampah yang sesuai dengan type_waste dari database
        const bins = await Bin.findAll({
            where: {
                IdWaste: IdWaste
            }
        });

        // Jika tidak ada tempat sampah yang ditemukan untuk type_waste yang diberikan
        if (!bins || bins.length === 0) {
            return res.status(404).json({ success: false, message: 'No bins found for the given waste type' });
        }

        // Menyaring tempat sampah yang memiliki kapasitas cukup untuk neto
        let eligibleBins = bins.filter(bin => (parseFloat(bin.weight) + parseFloat(neto)) <= parseFloat(bin.max_weight));

        // Jika tidak ada tempat sampah yang memenuhi kapasitas
        if (eligibleBins.length === 0) {
            return res.status(200).json({ success: false, message: 'No bins with enough capacity found' });
        }

        // Mengurutkan tempat sampah berdasarkan kapasitas yang paling kosong terlebih dahulu
        eligibleBins = eligibleBins.sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));
        
        // Memilih tempat sampah yang paling kosong
        let selectedBin = eligibleBins[0];

        res.status(200).json({ success: true, bin: selectedBin });
    } catch (error) {
        console.error('Error checking bin capacity:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const SaveTransaksi = async (req,res) => {
    const {payload} = req.body;
    payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(payload);
    (await transaction.create(payload)).save();
    res.status(200).json({msg:'ok'});
};
export const getTransaction = async (req,res)=>{
    const { containerName } = req.params;
    const tr = await transaction.findOne({
        where:{
            fromContainer: containerName,
            status: "Step-1",
            idscraplog: {
                [Op.ne]: 'Fail'
            }
        }
    });
    return res.status(!tr ? 404 : 200).json(!tr? {msg:"not found"} : tr);
}
export const syncTransaction = async (req,res)=>{
    let _data=null;
    try
    {
        const res = await axios.get(`http://${process.env.STEP1}/sync/`+os.hostname());
        const trData = res.data;
        if (!trData.length)
            return res.status(200).json({msg:"Empty Transaction",tr:tr});
        _data = res.data;
        for (let i=0;i<trData.length;i++)
        {
            const _container = await Container.findOne({
                where:{
                    name: tr.container.name
                }
            });
            if (!_container)
                continue;
            _data = {i:i,data:trData[i]};
            const tr = trData[i];
            const _waste = await Waste.findOne({
                where:{
                    name: tr.waste.name
                }
            });
            const data = await transaction.findOne({
                where:{
                    fromContainer: _container.name,
                    toBin: tr.bin,
                    idscraplog : tr.idscraplog,
                    status: 'Step-1'
                }
            }) ;
            if (!data || data == undefined)
            {
                const state = await transaction.create({
                    idscraplog: tr.idscraplog,
                    IdWaste: _waste.getDataValue("Id"),
                    idContainer : _container.getDataValue("containerId"),
                    badgeId: badgeId,
                    status: "Step-1",
                    weight: 0,
                    type: '',
                    toBin: tr.bin,
                    fromContainer: _container.name,
                });
                state.save();
            }
        }
        return res.status(200).json({msg:"Sync Success"});
    }
    catch(err)
    {
        return res.status(500).json({err:err,data:_data});
    }
}
export const UpdateTransaksi = async (req,res) =>{
    const {idscraplog} = req.params;
    const {status,type,weight} = req.body;
    const _transaction = await transaction.findOne({
        where:{
            idscraplog: idscraplog
        },
        order:[
            ['recordDate','DESC']
        ]
    });
    if (!_transaction)
        return res.json({msg:"Transaction Not Found"},404);
    try
    {
        console.log({url:`http://${process.env.STEP1}/step1/`+idscraplog});
        const _res =await  axios.put(`http://${process.env.STEP1}/step1/`+idscraplog,{status:"Done"});
        _transaction.setDataValue("status",status);
        _transaction.setDataValue("type",type);
        _transaction.setDataValue("weight",weight);
        await _transaction.save();
        
        return res.json({msg:"Ok"},200);
    }
    catch(err)
    {
        console.log(err.response  ? err.response.data : err);
        return res.json({msg: err.response ? err.response.data : err},500);
    }
}

export const SaveTransaksiCollection = async (req,res) => {
    const {payload} = req.body;
    payload.recordDate = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(payload);
    (await transaction.create(payload)).save();
    res.status(200).json({msg:'ok'});
};

export const UpdateBinWeight = async (req,res) =>{
    const {binId,neto} = req.body;
    const data = await Bin.findOne({where: {id:binId}});
    
    const binData = await Bin.findAll({where: {name: data.dataValues.name}});
    for (let i=0;i<binData.length;i++)
    {
        binData[i].weight = parseFloat(neto) + parseFloat(data.weight);
        await binData[i].save();
    }
    await updateBinWeightData(data.name_hostname);
   // await switchLamp(data.id,"RED",data.weight >= parseFloat(data.max_weight))
    res.status(200).json({msg:'ok'});
};

export const UpdateBinWeightCollection = async (req, res) => {
    const { binId } = req.body; // neto is not needed as weight will be set to 0
    const data = await Bin.findOne({ where: { id: binId } });

    if (data) {
        const binData = await Bin.findAll({where: {name: data.dataValues.name}});
        for (let i=0;i<binData.length;i++)
        {
            binData[i].weight =0;
            await binData[i].save();
        }
        await updateBinWeightData(data.name_hostname);
        res.status(200).json({ msg: 'ok' });
    } else {
        res.status(404).json({ msg: 'Bin not found' });
    }
};

export const UpdateContainerStatus = async (req,res) =>{
    const {containerName,status} = req.body;
    const data = await Bin.findOne({where: {name:containerName}});
    data.status = status;
    await data.save();
    
//    await updateBinWeightData(data.name_hostname);
   // await switchLamp(data.id,"RED",data.weight >= parseFloat(data.max_weight))
    res.status(200).json({msg:'ok'});
};

/* export const Hostname = async (res) => {
    const hostname = os.hostname();
    res.status(200).json({ hostname });
} */

