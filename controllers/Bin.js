import { clientList, io } from "../index.js";
import Bin from "../models/BinModel.js";

export const getWeightBin =  (socket) => {
    try {
        socket.on('getWeightBin',async (hostname)=>{
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
    const _id = clientList.find(x=>x.hostname==hostname);
    console.log("Update " +hostname);
    console.log(clientList);
    console.log(_id);
    const bin = await Bin.findOne({ where: { name_hostname: hostname } });
    console.log({hostname:hostname});
    let payload = {};
    if (bin) {
        payload = { weight: bin.weight };
    } else {
        payload = { error: 'Bin not found' };
    }
    io.to(_id.id).emit('getweight', payload);
}

export const checkMaxWeight = async () => {
    while (true) {
        const dataBin = await Bin.findAll();
        for (let i = 0; i < dataBin.length; i++) {
            console.log({ id: dataBin[i].id });
            const latest = await Bin.findOne({
                where: { name_hostname: dataBin[i].name_hostname }
            });
            
            if (latest) {
                //console.log(`Weight for ${latest.name_hostname}: ${latest.weight}`);
                io.to(latest.id).emit('checkMaxweight', latest.weight);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

