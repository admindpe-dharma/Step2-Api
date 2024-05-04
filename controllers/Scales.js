import { SerialPort } from 'serialport';
import { Server } from 'socket.io';
import http from 'http';


const Timbangan = new SerialPort({
    path: 'COM8',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    });

Timbangan.on('error', (error) => {
    console.log(error);
});

export const getScales4Kg = /*async*/ (io/*req, res, next*/) => {
    try {
        let response;

    /*     setInterval(function(){
            let rnd = Math.floor(Math.random() * 100);
            console.log(rnd);
            io.emit('data',{weight: parseFloat(rnd.toString())});
        },1000); */

        Timbangan.on('data', (data) => {
            const match = data.toString().match(/WT:(\d+\.\d+)g/);
           /*  console.log(data.toString()); */
            if (match) {
                const weight = match[1];
                /* console.log('Berat Timbangan:', weight, 'gram'); */
                // Kirim data yang diterima sebagai respons ke client
                response = { weight: parseFloat(weight) }; // Mengubah string berat menjadi angka float
                io.emit('data', parseFloat(weight));
            }
        });
      

        // Kirim pesan respons awal ke client
        // Hanya kirim jika ada respons yang sudah diatur sebelumnya
        if (response != undefined && response != null) {
            res.status(200).json(response);
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getScales50Kg = async (req, res) => {
    try {
        let response;

        const Timbangan_1 = new SerialPort('/dev/ttyUSB1', {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        });

        Timbangan_1.on('data', (data) => {
            console.log('Data Timbangan:', data.toString());
            // Kirim data yang diterima sebagai respons ke client
            response = { data: data.toString() };
            res.status(200).json(response);
        });

        Timbangan_1.on('error', (error) => {
            console.log(error);
        });

        // Menggunakan promise untuk memberikan waktu
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Kirim pesan respons awal ke client
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
