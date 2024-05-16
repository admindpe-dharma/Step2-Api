import { SerialPort } from 'serialport';

const Timbangan = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    }); 

const Timbangan_1 = new SerialPort({
        path: '/dev/ttyUSB1',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        }); 

Timbangan.on('error', (error) => {
    console.log(error);
});

export const getScales4Kg =(io) => {
    try {
        let response;
        Timbangan.on('data', (data) => {
            const match = data.toString().match(/WT:(\d+\.\d+)g/);
           /*  console.log(data.toString()); */
            if (match) {
                const weight = match[1];
                /* console.log('Berat Timbangan:', weight, 'gram'); */
                response = { weight: parseFloat(weight) };
                io.emit('data', response);
            }
        });
      
        if (response != undefined && response != null) {
            res.status(200).json(response);
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getScales50Kg =(io) => {
    try {
        let response;
        Timbangan_1.on('data', (weight50Kg) => {
  /*           console.log('Data Timbangan:', weight50Kg.toString()); */
            // Kirim data yang diterima sebagai respons ke client
            response = { weight50Kg: weight50Kg.toString() };
            io.emit('data1', response);
        });

        Timbangan_1.on('error', (error) => {
            console.log(error);
        });


        if (response != undefined && response != null) {
            res.status(200).json(response);
        }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
};
