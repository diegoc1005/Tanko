import { Router } from 'express';
import { escrowController } from '../controllers/escrow.controller.js';

const router = Router();

router.post('/escrow/single/create', (req, res) => escrowController.createSingleReleaseEscrow(req, res));

router.post('/escrow/multi/create', (req, res) => escrowController.createMultiReleaseEscrow(req, res));

router.post('/escrow/single/fund', (req, res) => escrowController.fundEscrow(req, res));

router.post('/escrow/multi/fund', (req, res) => escrowController.fundMultiReleaseEscrow(req, res));

router.post('/escrow/single/approve', (req, res) => escrowController.approveMilestone(req, res));

router.post('/escrow/multi/approve', (req, res) => escrowController.approveMultiReleaseMilestone(req, res));

router.post('/escrow/single/release', (req, res) => escrowController.releaseFunds(req, res));

router.post('/escrow/multi/release', (req, res) => escrowController.releaseMultiReleaseFunds(req, res));

router.get('/escrow', (req, res) => escrowController.getEscrow(req, res));

router.post('/escrow/dispute', (req, res) => escrowController.disputeEscrow(req, res));

router.post('/escrow/resolve-dispute', (req, res) => escrowController.resolveDispute(req, res));

export default router;
