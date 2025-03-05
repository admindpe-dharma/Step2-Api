import { createHmac } from "crypto";
import { clientList, io } from "../index.js";
import Bin from "../models/BinModel.js";
import os,{networkInterfaces} from 'os';
import { createClient } from "redis";

export const getWeightBin =  (socket) => {
    try {
        socket.on('getWeightBin',async (hostname)=>{
            if (!clientList.find(x=>x.hostname==hostname))
                clientList.push({id:socket.id,hostname:hostname});
            await updateBinWeightData(hostname);
        });
    } catch (error) {
        console.log(error);
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
//    console.log(clientList);
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
        console.log(error);
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
        console.log(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
;}

export const getTimbanganData = async (req, res) => {
   // const { instruksimsg } = req.body;
    try {
    const instruksimsg = req.body.pesan;
    res.status(200).json({ instruksimsg });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Terjadi kesalahan server' });
    }
};

export const getIp = (req,res)=>{
    const nets = networkInterfaces();
    const results = Object.create({});

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    let result = results;
    if (process.env.ETH_INTERFACE)
        result = results[process.env.ETH_INTERFACE];
    return res.status(200).json(result);
}
export const GetAddress = ()=>{
    const nets = networkInterfaces();
    const results = Object.create({});

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}
const HashString = (text)=>{
    return createHmac('sha512','Abcd1234').update(text).digest('base64');
}
export const SavePasswordTimbangan = async (req,res) =>{
    const {old,_new} = req.body;
    const redisClient = createClient();  
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    const passDb = await redisClient.get('passTimbangan');
    const _res = {status:400,msg: "Password Mismatch"};
    if (passDb == null || passDb == HashString(old))
    {
        await redisClient.set('passTimbangan',HashString(_new));
        _res.status = 200;
        _res.msg = "Password Modified";
    }
    
    await redisClient.disconnect();
    return res.status(_res.status).json(_res);
}
export const VerifyPassword = async (req,res)=>{
    const {password} = req.body;
    const redisClient = createClient();  
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    const passDb = await redisClient.get('passTimbangan');
    await redisClient.disconnect();
    return res.json({isValid: passDb==HashString(password) ? 1 : 0});
}