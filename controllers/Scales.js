import { SerialPort } from 'serialport';
import { io, scale4Queue, scale50Queue } from '../index.js';




let _4kgOutput = '';
let _50kgOutput = '';
export const getScales4Kg = () => {
    try {
//        console.log(process.env.TIMBANGAN4KG);
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
            Timbangan.close(()=>{
                scale4Queue.add({id:4},{
                    delay: 3000
                })
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
            const match = processWeight(_4kgOutput);
            
            _4kgOutput = '';
            if (!match ) {
                Timbangan.close(()=>{
                    scale4Queue.add({id:4},{
                        delay: 3000
                    })
                });
            }
        });  
    } catch (error) {
        console.log(error);
        scale4Queue.add({id:4},{
            delay: 3000
        });
        //        res.status(500).json({ msg: error.message });
    } 
};
const processWeight = async (payload) =>{
    const match = payload.toString().match(/[\d]+\.\d{2}(?=Kg)/);
    const match4 = payload.toString().match(/WT:(\d+\.\d+)g/);
    if (match4 && match4.length && match4.length > 0 ) {
        const weight =  match4[1] ;
        const response = { weight: parseFloat(weight) };
        io.emit('data', response);
        return true;
    }
    else if (match && match.length && match.length > 0) {
        const weight = match[1];
        //response = { weight: parseFloat(weight) };
        const response = { weight50Kg: weight };
        io.emit('data1', response);
        return true;
    }
    else
        return false;
    
}
export const getScales50Kg = () => {
    try {
  //      console.log(process.env.TIMBANGAN50KG);
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
        Timbangan_1.on('data', (data) => {
            /*if (data.toString()!='\n')
            {
                _50kgOutput = _50kgOutput+ data.toString();
                return;
            }*/
            _50kgOutput = data.toString().replace("\r","").replace("\n","");
            const match = processWeight(_50kgOutput);
            _50kgOutput = '';
            if (!match) {
                Timbangan_1.close(()=>{
                    scale50Queue.add({id:50},{
                        delay: 3000
                    })
                });
            }
        });

       Timbangan_1.on('error', (error) => {
            console.log({kg50Error: error});
            Timbangan_1.close(()=>{
                scale50Queue.add({id:50},{
                    delay: 3000
                })
            });
            return;
        }); 

    } catch (error) {
        console.log(error);
        scale50Queue.add({id:50},{
                delay: 3000
            });
        return;
        //    res.status(500).json({ msg: error.message });
    }
};
