import express from "express";
//import ScalesRoute from "./routes/ScalesRoute.js";
import ScannerRoute from "./routes/ScannerRoute.js";
import APIRoute from './routes/APIRoute.js';
import db from "./config/db.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
import { getScales4Kg ,getScales50Kg} from "./controllers/Scales.js";
import bodyParser from "body-parser";
import {BroadcastBinWeight, getWeightBin} from "./controllers/Bin.js"
import { config } from "dotenv";
import { syncEmployeePIDSG, syncPendingTransaction, syncPIDSGBin, syncPIDSGContainer, syncTransaction, syncTransactionStep1 } from "./controllers/Employee.js";
import Queue from 'bull';
import { ExpressAdapter } from '@bull-board/express';
import {createBullBoard} from '@bull-board/api';
import {BullAdapter} from '@bull-board/api/bullAdapter.js';
import axios from "axios";
config();
const app = express();
const server = http.createServer(app);
const clientList= [];
const port = 5000;

 app.use(cors({
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
/*  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers*/
  credentials:false 
}));
/* app.use(cors({
  credentials:false,
  origin: '*'
})); */

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(bodyParser.json());

try {
  await db.authenticate();
  console.log('Database terhubung..');
  
} catch (error) {
  console.log(error);
  
}


//app.use(ScalesRoute);
app.use(ScannerRoute);
app.use(APIRoute);
io.on('connection',(socket)=>{
//  console.log("listening socket.io");
getWeightBin(socket);

//checkMaxWeight(socket);
socket.on('disconnect',()=>{
    const index = clientList.findIndex(v=>v.id==socket.id);
    if (index < 0)
      return;
    clientList.splice(index,1);
    console.log(clientList);
});

});

setInterval(()=>{
  BroadcastBinWeight();
},1000);

const [scale4Queue,scale50Queue,pendingQueue,employeeQueue,weightbinQueue,RackSyncQueue]
 = [Queue('scale4Queue',{limiter:{max:3,duration:1000}}),Queue('scale50Queue',{limiter:{max:3,duration:1000}}),Queue('pending'),Queue('employee'),Queue('weightbin'),Queue('Rack Sync Queue')];
scale4Queue.process((job,done)=>{
console.log('scale 2 loading');
getScales4Kg();
done();
});
scale50Queue.process((job,done)=>{
  getScales50Kg();
  done();
});
pendingQueue.process(async (job,done)=>{
const res = [await syncPendingTransaction(),await syncTransactionStep1()];

done(null,res);
});
employeeQueue.process(async(job,done)=>{
const res = await syncEmployeePIDSG();

if (Array.isArray(res))
  RackSyncQueue.add({type: 'employee',payload:{syncEmp: res} });
done(null,res);
});
weightbinQueue.process(async(job,done)=>{
const res1= await syncPIDSGContainer();
const res2= await syncPIDSGBin();
if (Array.isArray(res1))
  RackSyncQueue.add({type: 'weightbin',payload:{syncBin: res1} });
done(null,[res1,res2]);
});
RackSyncQueue.process(async (job,done)=>{
  const url = `http://${process.env.RACK_API}/${( job.data.type=='weightbin' ? "weightbin" :"employee")}-sync`; 
  const payload  = {...job.data.payload};
  try
  {
    const res = await axios.post(url,payload,{
      withCredentials:false,
      timeout: 5000,
    });
    done(null,res.data);
  }
  catch (err)
  {
    done(err.toJSON() || err,null);
  }
})
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');
const bullBoard = createBullBoard({
  queues: [new BullAdapter(scale4Queue),new BullAdapter(scale50Queue),new BullAdapter(pendingQueue),new BullAdapter(employeeQueue),new BullAdapter(weightbinQueue),new BullAdapter(RackSyncQueue)],
  serverAdapter: serverAdapter,
  options:{
    uiConfig:{
      boardTitle:process.env.NAME
    }
  }
});
app.use('/queues',serverAdapter.getRouter());
server.listen(port, () => {
  scale4Queue.add({id:4});
  scale50Queue.add({id:50});
  pendingQueue.add({id:1});
  weightbinQueue.add({id:2});
  employeeQueue.add({id:3});
  console.log(`Server up and running on port ${port}`);
}); 
export { clientList,Server, io,scale50Queue,scale4Queue,employeeQueue,weightbinQueue,pendingQueue };



// const syncWork = async ()=>{
  
//   const data = await syncPendingTransaction();
//   await syncTransactionStep1();
//   };
// const loopWork = async()=>{
//   await syncWork();
//   setImmediate(loopWork);
// }
// const syncEmp = async ()=>{
//   await syncEmployeePIDSG();
//   await syncPIDSGBin();
//   await syncPIDSGContainer();
// }
// setInterval(syncEmp,60*1000);
// loopWork();
//getWeightBin(io); 

