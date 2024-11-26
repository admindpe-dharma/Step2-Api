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
import { syncEmployeePIDSG, syncPendingTransaction, syncPIDSGBin, syncTransaction, syncTransactionStep1 } from "./controllers/Employee.js";
import { setTimeout } from "timers/promises";
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
server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
export {clientList,io,Server};
getScales4Kg(io);
getScales50Kg(io);
setInterval(()=>{
  BroadcastBinWeight();
},1000);
const syncWork = async ()=>{
  
  const data = await syncPendingTransaction();
  await syncTransactionStep1();
  };
const loopWork = async()=>{
  await syncWork();
  setImmediate(loopWork);
}
const syncEmp = async ()=>{
  await syncEmployeePIDSG();
  await syncPIDSGBin();
  console.log('Sync Employee');
  setTimeout(syncEmp,10*10*1000);
}
syncEmp();
loopWork();
//getWeightBin(io); 