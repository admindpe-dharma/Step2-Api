import ModbusRTU from 'modbus-serial';
import {SerialPort} from 'serialport'

/* const client = new ModbusRTU();
client.connectRTU("/dev/ttyUSB0", { baudRate: 9600 })
  .then(() => {
    console.log("Connected to PLC via Modbus RTU over USB.");
    
  })
  .catch((err) => {
    console.error("Error connecting to PLC:", err);
  });
 */
 
  const port = new SerialPort({
    path: '/dev/tty-usbserial0',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    });

port.on('open', () => {
  console.log('Serial port terhubung');
});

port.on('data', (data) => {
  console.log('Data Timbangan:', data.toString());
});

port.on('error', (err) => {
  console.error('Error:', err.message);
});
