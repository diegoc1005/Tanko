import { Request, Response } from 'express';
import { stellarService } from '../services/stellar.service.js';

export class WalletController {
  async generateWallet(req: Request, res: Response): Promise<void> {
    try {
      const keypair = stellarService.generateKeypair();
      res.status(200).json({
        success: true,
        data: keypair,
        message: 'Store the secret securely. It will not be shown again.',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate wallet',
      });
    }
  }

  async getAccountInfo(req: Request, res: Response): Promise<void> {
    try {
      const { publicKey } = req.params;
      
      if (!stellarService.validatePublicKey(publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const info = await stellarService.getAccountInfo(publicKey);
      res.status(200).json({ success: true, data: info });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get account info',
      });
    }
  }

  async getBalances(req: Request, res: Response): Promise<void> {
    try {
      const { publicKey } = req.params;
      
      if (!stellarService.validatePublicKey(publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const balances = await stellarService.getAccountBalance(publicKey);
      res.status(200).json({ success: true, data: balances });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get balances',
      });
    }
  }

  async validateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.query;
      
      if (typeof address !== 'string') {
        res.status(400).json({ success: false, error: 'Address is required' });
        return;
      }

      const isValid = stellarService.validatePublicKey(address);
      res.status(200).json({ success: true, data: { isValid, address } });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      });
    }
  }
}

export const walletController = new WalletController();
