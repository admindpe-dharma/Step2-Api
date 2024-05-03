import {SerialPort} from 'serialport';


export const getScales4Kg = async (res) => {
    try {
        let response;

        const Timbangan = new SerialPort({
            path: '/dev/ttyUSB0',
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            });

        Timbangan.on('data', (data) => {
            const match = data.toString().match(/WT:(\d+\.\d+)g/);
            if (match) {
                const weight = match[1];
                /* console.log('Berat Timbangan:', weight, 'gram'); */
                // Kirim data yang diterima sebagai respons ke client
                response = { weight: parseFloat(weight) }; // Mengubah string berat menjadi angka float
                // Pastikan Anda masih memiliki akses ke objek res di sini
                if (res && typeof res.status === 'function') {
                    res.status(200).json(response);
                }
            }
        });

        // Menggunakan promise untuk memberikan waktu
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Kirim pesan respons awal ke client
        // Hanya kirim jika ada respons yang sudah diatur sebelumnya
        if (response && res && typeof res.status === 'function') {
            res.status(200).json(response);
        }
    } catch (error) {
        if (res && typeof res.status === 'function') {
            res.status(500).json({ msg: error.message });
        }
    }
};

export const getScales50Kg = async (res) => {
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

        // Menggunakan promise untuk memberikan waktu
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Kirim pesan respons awal ke client
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
