import { clientList, io } from "../index.js";
import Bin from "../models/BinModel.js";


export const getWeightBin =  (socket) => {
    try {
        socket.on('getWeightBin',async (hostname)=>{
            if (!clientList.find(x=>x.hostname==hostname))
                clientList.push({id:socket.id,hostname:hostname});
            await updateBinWeightData(hostname);
        });
    } catch (error) {
        console.error(error);
        socket.emit("getWeight",{ payload: {error:'Terjadi kesalahan server'} });
    }
};

export const updateBinWeightData = async (hostname)=>{
    const _id = clientList.find(x=>x.hostname==hostname);
    if (!_id)
    {
        return;
    }
    const payload = await getBinByHostname(hostname);
    io.to(_id.id).emit('getweight', payload);
}
const getBinByHostname = async (hostname)=>{
    const bin = await Bin.findOne({ where: { name_hostname: hostname } });
    let payload = {};
    if (bin) {
        payload = { weight: bin.weight,max_weight: bin.max_weight };
    } else {
        payload = { error: 'Bin not found' };
    }
    return payload;
}
export const BroadcastBinWeight = async ()=>{
    if (!clientList || clientList == null )
        return;
    if (clientList.length < 0)
        return;
    for (let i=0;i<clientList.length;i++)
    {
        try
        {
            const payload = await getBinByHostname(clientList[i].hostname);
            io.to(clientList[i].id).emit('getweight', payload);
        }
        catch (err)
        {
        }
    }
}
export const getbinData = async (req, res) => {
    const { hostname } = req.query;
    try {
        const bin = await Bin.findOne({
            where: { name_hostname: hostname }
        });

        if (bin) {
            res.json({ bin });
        } else {
            res.json({ error: 'bin ID not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};
export const getBin = async (req,res) =>{
    const {binName} = req.params;
    try {
        const bin = await Bin.findOne({
            where: { name:binName }
        });

        if (bin) {
            res.json({ bin },200);
        } else {
            res.json({ error: 'bin ID not found' },500);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
;}

export const getTimbanganData = async (req, res) => {
   // const { instruksimsg } = req.body;
    try {
    const instruksimsg = req.body.pesan;
    res.status(200).json({ instruksimsg });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};