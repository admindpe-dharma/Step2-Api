import { ReadlineParser, SerialPort } from 'serialport';
import { io, scale4Queue, scale50Queue } from '../index.js';
import { fileURLToPath } from "url";
import { dirname, parse, resolve } from "path";
import fs from 'fs';
import moment from 'moment';
const __dirname = dirname( fileURLToPath(import.meta.url));


const fileNames = {usb0: __dirname+"/"+'USB0',usb1:__dirname+"/"+'USB1'};
let _4kgOutput = '';
let _50kgOutput = '';
let scaleTimeout = [null,null];
let checkSerial = true;
const reloadTimbangan = (index,Timbangan)=>{
    if (scaleTimeout[index] != null)
            clearTimeout(scaleTimeout[index]);
    scaleTimeout[index] = setTimeout(()=>{
        if (checkSerial)
        {
            const name = index==0 ? fileNames.usb1 : fileNames.usb0;
            const filename = name+"_2_Serial_status_" + moment(new Date()).format('YYYY_MM_DD') + ".txt";
            fs.writeFileSync(filename, "Sebelum Disconnect: "+ (Timbangan.isOpen ? "Terkoneksi" : "Tidak Terkoneksi") +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
//            checkSerial = false;
        }
        try
        {
            Timbangan.flush();
            Timbangan.destroy();
        }  
        catch (er)
        {
            fs.writeFileSync(filename, "Error Disconnect: "+ er?.message || er +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
            console.log(er);
        }
        finally
        {
            fs.writeFileSync(filename, "Sesudah Disconnect: "+ (Timbangan.isOpen ? "Terkoneksi" : "Tidak Terkoneksi") +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
            console.log(`Reconnect /dev/ttyUSB${index==0 ? 1: 0}...`);
            if (index==0)
            {
                
                scale4Queue.add({id:4},{
                    delay: 3000
                });
            }
            else
            {
                scale50Queue.add({id:50},{
                    delay: 3000
                });
            }
        }
    }, 10000);
}
export const getScales4Kg = () => {
    try {
//        console.log(process.env.TIMBANGAN4KG);
        if (process.env.TIMBANGAN4KG != "1")
            return;
        console.log('Connect /dev/ttyUSB1...');
        const _name = fileNames.usb1+"_2_Serial_status_" + moment(new Date()).format('YYYY_MM_DD') + ".txt";
        
        fs.writeFileSync(_name, "Sebelum Connect "+" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
        const Timbangan = new SerialPort({
            path: '/dev/ttyUSB1',
            baudRate: 9600,
            dataBits: 8,
            lock:false,
            rtscts:true,
            stopBits: 1,
            parity: 'none',
        });
        
        fs.writeFileSync(_name, "Sesudah Connect: "+ (Timbangan.isOpen ? "Terkoneksi" : "Tidak Terkoneksi") +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
        reloadTimbangan(0,Timbangan);
        const parser = Timbangan.pipe(new ReadlineParser({delimiter:"\r\n"}));
        Timbangan.on('error', (error) => {
            console.log({kg4Error: error});
            
            Timbangan.destroy((err)=>{
                console.log(err);
            });
            scale4Queue.add({id:4},{
                delay: 3000
            });
        });
       parser.on('data', (data) => {
            let temp = data.toString();
            if (process.env.RECORD_SCALE==1)
            {
                const filename = fileNames.usb1 + moment(new Date()).format('YYYY_MM_DD') + ".txt";
                fs.writeFileSync(filename,temp+" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
            }
            if (temp.length < 5)
            {
                if (temp != '\n'  && temp != ' ' && temp != '\t' && temp != '\0')
                {
                    _4kgOutput += temp;
                    return;
                }
            }
            else 
                _4kgOutput = temp;
            
            if (process.env.RECORD_SCALE==1)
            {
                const filename = fileNames.usb1 + moment(new Date()).format('YYYY_MM_DD') + "_2.txt";
                fs.writeFileSync(filename,_4kgOutput+" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
            }
            _4kgOutput = _4kgOutput.replace("\n","").replace("\r","");
            const match = processWeight(_4kgOutput);
            
            _4kgOutput = '';
            if (!match ) {
                Timbangan.close(()=>{    
                });
                scale4Queue.add({id:4},{
                    delay: 3000
                });
            }
            reloadTimbangan(0,Timbangan);
        });  
    } catch (error) {
        const _name = fileNames.usb1+"_2_Serial_status_" + moment(new Date()).format('YYYY_MM_DD') + ".txt";
        
        fs.writeFileSync(_name, "Error Connect:  " + error?.message || error +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
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
        const weight = match[0];
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
        
        console.log('Connect /dev/ttyUSB0...');
        const _name = fileNames.usb0+"_2_Serial_status_" + moment(new Date()).format('YYYY_MM_DD') + ".txt";
        
        fs.writeFileSync(_name, "Sebelum Connect "+" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
        const Timbangan_1 = new SerialPort({
            path: '/dev/ttyUSB0',
            lock:false,
            rtscts:true,
            
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        }); 
        
        fs.writeFileSync(_name, "Sesudah Connect: "+ (Timbangan_1.isOpen ? "Terkoneksi" : "Tidak Terkoneksi") +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
        reloadTimbangan(1,Timbangan_1);
        const parser = Timbangan_1.pipe(new ReadlineParser({delimiter:"\r\n"}));
        parser.on('data', (data) => {
            /*let temp = data.toString();
            if (temp.length < 5)
            {
                _50kgOutput = _50kgOutput+ data.toString();
                return;
            }*/
            let temp = data.toString();
            if (process.env.RECORD_SCALE==1)
            {
                const filename = fileNames.usb0 + moment(new Date()).format('YYYY_MM_DD') + ".txt";
                fs.writeFileSync(filename,temp +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
            }
            if (temp.length < 5)
            {
                if (temp != '\n'  && temp != ' ' && temp != '\t' && temp != '\0')
                {
                    _50kgOutput += temp;
                    return;
                }
            }
            else
                _50kgOutput = temp;
            if (process.env.RECORD_SCALE==1)
            {
                const filename = fileNames.usb0 + moment(new Date()).format('YYYY_MM_DD') + "_2.txt";
                fs.writeFileSync(filename,_50kgOutput +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
            }
            _50kgOutput = _50kgOutput.replace("\r","").replace("\n","");
            const match = processWeight(_50kgOutput);
            _50kgOutput = '';
            if (!match) {
                Timbangan_1.destroy((err)=>{
                    console.log(err);
                });
                scale50Queue.add({id:50},{
                    delay: 3000
                })
            }
            reloadTimbangan(1,Timbangan_1);
        });

       Timbangan_1.on('error', (error) => {
            console.log({kg50Error: error});
            Timbangan_1.close(()=>{
                
            });
            scale50Queue.add({id:50},{
                delay: 3000
            });
            return;
        }); 

    } catch (error) {
        const _name = fileNames.usb0+"_2_Serial_status_" + moment(new Date()).format('YYYY_MM_DD') + ".txt";
        
        fs.writeFileSync(_name, "Error Connect:  " + error?.message || error +" - " + new Date().toLocaleString()+"\n",{flag:'a+'});
        console.log(error);
        scale50Queue.add({id:50},{
                delay: 3000
            });
        return;
        //    res.status(500).json({ msg: error.message });
    }
};
