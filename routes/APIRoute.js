import express from 'express';
import { syncPendingTransaction, syncTransaction, TransactionStep1 } from '../controllers/Employee.js';
import { getIp } from '../controllers/Bin.js';

const routes = express.Router();

routes.post('/Step1',TransactionStep1);
routes.get("/Sync",syncTransaction);
routes.get('/ip',getIp);
routes.get('/Pending-List',syncPendingTransaction);
export default routes;