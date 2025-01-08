
import express from "express";
import {ScanBadgeid,ScanContainer,CheckBinCapacity,SaveTransaksi,UpdateBinWeight,UpdateBinWeightCollection, SaveTransaksiCollection,VerificationScan,UpdateContainerStatus, UpdateTransaksi, getTransaction} from "../controllers/Employee.js"
import {getBin, getbinData} from "../controllers/Bin.js"
import routes from "./APIRoute.js";

const router = express.Router();

router.post('/ScanBadgeid', ScanBadgeid);
router.post('/ScanContainer', ScanContainer);
router.post('/VerificationScan', VerificationScan);
router.post("/SaveTransaksi",SaveTransaksi);
router.post('/SaveTransaksiCollection', SaveTransaksiCollection)
router.post('/UpdateBinWeight',UpdateBinWeight)
router.post('/UpdateBinWeightCollection',UpdateBinWeightCollection)
router.post('/CheckBinCapacity',CheckBinCapacity)
router.post('/UpdateContainerStatus',UpdateContainerStatus)
router.get('/getbinData',getbinData);
routes.put("/Transaksi/:idscraplog",UpdateTransaksi);
router.get("/Transaksi/:containerName",getTransaction);
router.get("/Bin/:binName",getBin);
router.get('/ping',(req,res)=>res.json({msg:"ok"}));
//router.get('/Hostname',Hostname)
export default router;
