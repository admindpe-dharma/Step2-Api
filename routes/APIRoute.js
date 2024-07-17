import express from 'express';
import { syncTransaction, TransactionStep1 } from '../controllers/Employee.js';

const routes = express.Router();

routes.post('/Step1',TransactionStep1);
routes.get("/Sync",syncTransaction);
export default routes;