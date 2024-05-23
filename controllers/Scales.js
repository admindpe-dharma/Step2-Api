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

export const getScales4Kg = (io) => {
    try {
        let response;
        console.log("start reading scale4kg");
        io.on('connectScale', () => {
            console.log("reconnect scale");
            Timbangan.open(() => {
                console.log("opening port");
            });
        });
        Timbangan.on('data', (data) => {
            const match = data.toString().match(/WT:(\d+\.\d+)g/);
            console.log({ "4kg": data.toString() });
            if (match) {
                const weight = match[1];
                console.log(['Berat Timbangan 4kg :', weight, 'gram']);
                response = { weight: parseFloat(weight) };
                io.emit('data', response);
            }
        });
    } catch (error) {
        console.log(error);
        //        res.status(500).json({ msg: error.message });
    }
};

export const getScales50Kg = (io) => {
    try {
        let response;
        console.log("start reading scale50kg");
        /* console.log("TEt");
         setInterval(function(){
             response = { weight50Kg: 20 };
             io.emit('data', response);
         },5000); */
        io.on('connectScale', () => {
            console.log("reconnect scale");
            Timbangan_1.open(() => {
                console.log("opening port");
            });
        });
        Timbangan_1.on('data', (rawData) => {

            const match = data.toString().match(/[\d]+\.\d{2}(?=Kg)/);
            console.log({ "4kg": data.toString() });

            if (match) {
                const weight = match[0];
                console.log(['Berat Timbangan 50kg :', weight, 'kg']);
                response = { weight: parseFloat(weight) };

                // io.emit('data', response);
            }


            //console.log('timbangan 50kg', rawData.toString());
            //const data = parseFloat(rawData.toString().replace("+", "")).toString();
            // console.log(data);
            /*let res = '';
            const point = data.indexOf(".");
            for (let i = data.length - 1; i >= 0; i--) {
                if (((data.length - 1) - i) == point)
                    res += ".";
                if (parseInt(data[i]))
                    res += data[i];
            }*/
            //            const parsed = parseFloat(data);
            //            if ( Math.abs(currentWeight - parsed) < 0.5)
            //		return;
            /*if (holdDelay && (currentWeight > parsed))
            return;
            if (!holdDelay)
            {
            holdDelay=  true;
            setTimeout(()=>{
                holdDelay=false;
                },500);
            }*/
            response = { weight50Kg: weight };
            io.emit('data1', response);
        });

        Timbangan.on('error', (error) => {
            console.log(error);
        });
        if (response != undefined && response != null) {
            res.status(200).json(response);
        }
    } catch (error) {
        console.log(error);
        //    res.status(500).json({ msg: error.message });
    }
};
