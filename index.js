import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import ScannerRoute from "./routes/ScannerRoute.js";
import db from "./config/db.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
import { getScales4Kg ,getScales50Kg} from "./controllers/Scales.js";
import bodyParser from "body-parser";
import {getWeightBin} from "./controllers/Bin.js"
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
  console.error(error);
  
}


app.use(ScalesRoute);
app.use(ScannerRoute);

io.on('connection',(socket)=>{
//  console.log("listening socket.io");
getWeightBin(socket);

//checkMaxWeight(socket);
socket.on('disconnect',()=>{
    clientList.splice(clientList.findIndex(v=>v.id==socket.id),1);
    console.log(clientList);
});

});
server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
export {clientList,io,Server};
//getScales4Kg(io);
getScales50Kg(io);
//getWeightBin(io);