import express from "express";
import ModbusRTU from 'modbus-serial';
import {SerialPort} from 'serialport'
import ScalesRoute from "./routes/ScalesRoute.js";


const app = express();

app.use(ScalesRoute);

/* const client = new ModbusRTU();
client.connectRTU("/dev/ttyUSB0", { baudRate: 9600 })
  .then(() => {
    console.log("Connected to PLC via Modbus RTU over USB.");
    
  })
  .catch((err) => {
    console.error("Error connecting to PLC:", err);
  });
  */
const Timbangan = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    });

  Timbangan.on('open', () => {
    console.log('Timbangan Terhubung');
  });

Timbangan.on('error', (err) => {
  console.error('Error:', err.message);
});

const Timbangan_1 = new SerialPort({
  path: '/dev/ttyUSB1',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  });

Timbangan_1.on('open', () => {
console.log('Timbangan 1 terhubung');
});

Timbangan_1.on('error', (err) => {
console.error('Error:', err.message);
});

