import { Router } from 'express';
import { escrowController } from '../controllers/escrow.controller.js';

const router = Router();

router.post('/trustline', (req, res) => escrowController.setTrustline(req, res));

router.get('/escrows-by-role', (req, res) => escrowController.getEscrowsByRole(req, res));

router.post('/multiple-balances', (req, res) => escrowController.getMultipleBalances(req, res));

export default router;
