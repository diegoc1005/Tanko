import { Router } from 'express';
import { escrowController } from '../controllers/escrow.controller.js';
import { walletController } from '../controllers/wallet.controller.js';

const router = Router();

router.post('/wallet/generate', (req, res) => walletController.generateWallet(req, res));

router.get('/wallet/:publicKey/info', (req, res) => walletController.getAccountInfo(req, res));

router.get('/wallet/:publicKey/balances', (req, res) => walletController.getBalances(req, res));

router.get('/wallet/validate', (req, res) => walletController.validateAddress(req, res));

router.post('/transaction/sign', (req, res) => escrowController.signAndSubmitTransaction(req, res));

export default router;
