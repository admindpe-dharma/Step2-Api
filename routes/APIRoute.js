import express from 'express';
import { ResetNetworkInterface, SyncAll, syncEmployeePIDSGAPI, syncPendingTransaction, syncPendingTransactionAPI, syncPIDSGBinAPI, syncPIDSGBinContainerAPI, syncTransaction, TransactionStep1 } from '../controllers/Employee.js';
import { getIp } from '../controllers/Bin.js';
import { ResetUsb } from '../controllers/Scales.js';
import { clientList } from '../index.js';

const routes = express.Router();

routes.post('/Step1',TransactionStep1);
routes.get("/Sync",syncTransaction);
routes.get('/ip',getIp);
routes.get('/Pending-List',syncPendingTransactionAPI);
routes.get('/employee-sync',syncEmployeePIDSGAPI);
routes.get('/employee',syncEmployeePIDSGAPI);
routes.get('/bin-sync',syncPIDSGBinAPI);
routes.get('/container-sync',syncPIDSGBinContainerAPI);
routes.get('/sync-all',SyncAll)
routes.get('/reset',(req,res)=>{
    return res.json(ResetUsb());
});
routes.get('/client-bin',(req,res)=>res.json({connected_bin:clientList}));
routes.get('/reset-network',(req,res)=>res.json({netowrk_reset:ResetNetworkInterface()}));
export default routes;