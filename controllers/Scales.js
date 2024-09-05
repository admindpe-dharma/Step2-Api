import { SerialPort } from 'serialport';





let _4kgOutput = '';
let _50kgOutput = '';
export const getScales4Kg = (io) => {
    try {
        console.log(process.env.TIMBANGAN4KG);
        if (process.env.TIMBANGAN4KG != "1")
            return;
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
            Timbangan.close();
            getScales4Kg(io);
            return;
        });
        let response;
        io.on('connectScale', () => {
            Timbangan.open(() => {
            });
        });
       Timbangan.on('data', (data) => {
            let temp = data.toString();
            if (temp != '\n'  && temp != ' ' && temp != '\t' && temp != '\0')
            {
                _4kgOutput += temp;
                return;
            }
            _4kgOutput = _4kgOutput.replace("\n","").replace("\r","");
            const match = _4kgOutput.toString().match(/WT:(\d+\.\d+)g/);
            if (match ) {
                const weight =  match[1] ;
                response = { weight: parseFloat(weight) };
                io.emit('data', response);
                
            }
            else
            {
                Timbangan.close();
                getScales4Kg(io);
            }
            _4kgOutput = '';
        });  
    } catch (error) {
        console.log(error);
        getScales4Kg(io);
        return;
        //        res.status(500).json({ msg: error.message });
    } 
};

export const getScales50Kg = (io) => {
    try {
        console.log(process.env.TIMBANGAN50KG);
        if (process.env.TIMBANGAN50KG != "1")
            return;
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
            }
            _50kgOutput = '';
        });

       Timbangan_1.on('error', (error) => {
            console.log({kg50Error: error});
            Timbangan_1.close();
            getScales50Kg(io);
            return;
        }); 
        if (response != undefined && response != null) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.log(error);
        getScales50Kg(io);
        return;
        //    res.status(500).json({ msg: error.message });
    }
};
