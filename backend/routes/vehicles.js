import express from 'express';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getDistinctPpls, generateCrm } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/ppls', getDistinctPpls);
router.post('/', createVehicle);
router.post('/generate-crm', generateCrm);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
