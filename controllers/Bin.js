import Bin from "../models/BinModel.js";

export const getWeightBin = async (io) => {
    //console.log(req);
    try {
        io.on('getWeightBin',async (hostname)=>{
            const bin = await Bin.findOne({ where: { name_hostname: hostname } });
            console.log({bin:bin,hostname:hostname});
            let payload = {};
            if (bin) {
                payload = { weight: bin.weight };
            } else {
                payload = { error: 'Bin not found' };
            }
            io.emit('getweight', payload);
        });
    } catch (error) {
        console.error(error);
        io.emit("getWeight",{ payload: {error:'Terjadi kesalahan server'} });
    }
};
