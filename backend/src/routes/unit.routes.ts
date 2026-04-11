import { Router } from 'express';
import { unitController } from '../controllers/unit.controller.js';

const router = Router();

router.get('/units', (req, res) => unitController.getAll(req, res));

router.get('/units/:id', (req, res) => unitController.getById(req, res));

router.get('/units/user/:userId', (req, res) => unitController.getByUserId(req, res));

router.post('/units', (req, res) => unitController.create(req, res));

router.put('/units/:id', (req, res) => unitController.update(req, res));

router.delete('/units/:id', (req, res) => unitController.delete(req, res));

export default router;
