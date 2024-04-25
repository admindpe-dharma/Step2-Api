import ModbusRTU from 'modbus-serial';

const client = new ModbusRTU();
client.connectRTU("/dev/ttyUSB1", { baudRate: 9600 })
  .then(() => {
    console.log("Connected to PLC via Modbus RTU over USB.");
    // Mulai komunikasi dengan PLC di sini
  })
  .catch((err) => {
    console.error("Error connecting to PLC:", err);
  });
