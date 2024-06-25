import express from 'express';
import { TransactionStep1 } from '../controllers/Employee.js';

const routes = express.Router();

routes.post('/Step1',TransactionStep1);
export default routes;