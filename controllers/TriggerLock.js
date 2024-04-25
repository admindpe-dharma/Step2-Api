import { Controller } from 'ethernet-ip';

export const TriggerLock = async (res) => {
    const plc = new Controller();
    const ip = '192.168.1.100'; // Ganti dengan alamat IP PLC Anda
    const slot = 0;
    const path = '1,0'; // Path ini bisa berbeda-beda tergantung pada PLC yang digunakan
    const port = 23000;
    const value = "RD CM8830";

    try {
        // Buka koneksi ke PLC
        await plc.connect(ip, slot, path, port);

        // Kirim perintah ke PLC
        await plc.write('path.to.tag', value);

        // Tutup koneksi
        await plc.disconnect();

        res.status(200).send('Command sent to PLC');
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to send command to PLC');
    }
};
