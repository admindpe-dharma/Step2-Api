import ModbusRTU from 'modbus-serial';
import {SerialPort} from 'serialport'

const client = new ModbusRTU();
client.connectRTU("/dev/ttyUSB0", { baudRate: 9600 })
  .then(() => {
    console.log("Connected to PLC via Modbus RTU over USB.");
    
  })
  .catch((err) => {
    console.error("Error connecting to PLC:", err);
  });
 
const Timbangan = new SerialPort({
    path: '/dev/ttyUSB1',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    });

Timbangan.on('open', () => {
  console.log('Serial port terhubung');
});

Timbangan.on('data', (data) => {
  console.log('Data Timbangan:', data.toString());

});

Timbangan.on('error', (err) => {
  console.error('Error:', err.message);
});

const Timbangan_1 = new SerialPort({
  path: '/dev/ttyUSB2',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  });

Timbangan_1.on('open', () => {
console.log('Serial port terhubung');
});

Timbangan_1.on('data', (data) => {
console.log('Data Timbangan 2 :', data.toString());

});

Timbangan_1.on('error', (err) => {
console.error('Error:', err.message);
});
