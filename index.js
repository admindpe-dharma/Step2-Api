import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
import { getScales4Kg ,getScales50Kg} from "./controllers/Scales.js";

const app = express();
const server = http.createServer(app);

const port = 5000;

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

export { Server, io };

app.use(ScalesRoute);

/* io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
}); */

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
getScales4Kg(io);
getScales50Kg(io);