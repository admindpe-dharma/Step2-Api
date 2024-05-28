import { clientList, io } from "../index.js";
import Bin from "../models/BinModel.js";


export const getWeightBin =  (socket) => {
    try {
        socket.on('getWeightBin',async (hostname)=>{
            console.log('Register ' + hostname);
            if (!clientList.find(x=>x.hostname==hostname))
                clientList.push({id:socket.id,hostname:hostname});
            console.log(clientList);
            await updateBinWeightData(hostname);
        });
    } catch (error) {
        console.error(error);
        socket.emit("getWeight",{ payload: {error:'Terjadi kesalahan server'} });
    }
};

export const updateBinWeightData = async (hostname)=>{
    console.log('Update Client '+ hostname );
    console.log(clientList);
    const _id = clientList.find(x=>x.hostname==hostname);
    if (!_id)
        return;
    console.log("Update " +hostname);
    console.log(clientList);
    console.log(_id);
    const bin = await Bin.findOne({ where: { name_hostname: hostname } });
    console.log({hostname:hostname,bin:bin});
    let payload = {};
    if (bin) {
        payload = { weight: bin.weight };
    } else {
        payload = { error: 'Bin not found' };
    }
    io.to(_id.id).emit('getweight', payload);
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