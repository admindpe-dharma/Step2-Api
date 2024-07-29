import { SerialPort } from 'serialport';





let _4kgOutput = '';
let _50kgOutput = '';
export const getScales4Kg = (io) => {
    try {
        
        const Timbangan = new SerialPort({
            path: '/dev/ttyUSB1',
            baudRate: 9600,
            dataBits: 8,
            lock:false,
            rtscts:true,
            stopBits: 1,
            parity: 'none',
        });
        Timbangan.on('error', (error) => {
            console.log({kg4Error: error});
        });
        let response;
        io.on('connectScale', () => {
            Timbangan.open(() => {
            });
        });
       Timbangan.on('data', (data) => {
            let temp = data.toString();
            if (temp != '\n')
            {
                _4kgOutput += temp;
                console.log({d2:_4kgOutput});
                return;
            }
            _4kgOutput = _4kgOutput.replace("\n","").replace("\r","");
            const match = _4kgOutput.toString().match(/WT:(\d+\.\d+)g/);
            if (match) {
                const weight = match[1];
                response = { weight: parseFloat(weight) };
                io.emit('data', response);
                
            }
            else
            {
                console.log({d2:_4kgOutput});
                Timbangan.close();
                getScales4Kg(io);
                return;
            }
            _4kgOutput = '';
        });  
    } catch (error) {
        //        res.status(500).json({ msg: error.message });
    } 
};

export const getScales50Kg = (io) => {
    try {
        const Timbangan_1 = new SerialPort({
            path: '/dev/ttyUSB0',
            lock:false,
            rtscts:true,
            
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        }); 
        
        let response;
        Timbangan_1.on('data', (data) => {
            /*if (data.toString()!='\n')
            {
                _50kgOutput = _50kgOutput+ data.toString();
                return;
            }*/
            _50kgOutput = data.toString().replace("\r","").replace("\n","");
            const match = _50kgOutput.toString().match(/[\d]+\.\d{2}(?=Kg)/);

            if (match) {
                const weight = match[0];
                response = { weight: parseFloat(weight) };
                response = { weight50Kg: weight };
                io.emit('data1', response);
            }
            else
            {
                Timbangan_1.close();
                getScales50Kg(io);
                return;
            }
            _50kgOutput = '';
        });

       Timbangan_1.on('error', (error) => {
            console.log({kg50Error: error});
        }); 
        if (response != undefined && response != null) {
            res.status(200).json(response);
        }
    } catch (error) {
        //    res.status(500).json({ msg: error.message });
    }
};
