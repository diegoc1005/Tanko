import { Router } from 'express';
import { fuelLogController } from '../controllers/fuelLog.controller.js';

const router = Router();

router.get('/fuel-logs', (req, res) => fuelLogController.getAll(req, res));

router.get('/fuel-logs/:id', (req, res) => fuelLogController.getById(req, res));

router.get('/fuel-logs/unit/:unitId', (req, res) => fuelLogController.getByUnitId(req, res));

router.get('/fuel-logs/user/:userId', (req, res) => fuelLogController.getByUserId(req, res));

router.get('/fuel-logs/range', (req, res) => fuelLogController.getByDateRange(req, res));

router.post('/fuel-logs', (req, res) => fuelLogController.create(req, res));

router.put('/fuel-logs/:id', (req, res) => fuelLogController.update(req, res));

router.delete('/fuel-logs/:id', (req, res) => fuelLogController.delete(req, res));

export default router;
