import express from 'express';
import { syncEmployeePIDSGAPI, syncPendingTransaction, syncPendingTransactionAPI, syncPIDSGBinAPI, syncPIDSGBinContainerAPI, syncTransaction, TransactionStep1 } from '../controllers/Employee.js';
import { getIp } from '../controllers/Bin.js';
import router from './ScannerRoute.js';

const routes = express.Router();

routes.post('/Step1',TransactionStep1);
routes.get("/Sync",syncTransaction);
routes.get('/ip',getIp);
routes.get('/Pending-List',syncPendingTransactionAPI);
routes.get('/employee-sync',syncEmployeePIDSGAPI);
routes.get('/employee',syncEmployeePIDSGAPI);
routes.get('/bin-sync',syncPIDSGBinAPI);
routes.get('/container-sync',syncPIDSGBinContainerAPI);

export default routes;