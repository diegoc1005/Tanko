import { Router } from 'express';
import { fundsController } from '../controllers/funds.controller.js';

const router = Router();

router.get('/config/escrow', (req, res) => fundsController.getEscrowConfig(req, res));

router.put('/config/escrow', (req, res) => fundsController.updateEscrowConfig(req, res));

export default router;
