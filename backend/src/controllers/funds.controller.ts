import { Request, Response } from 'express';
import { fundsService } from '../services/funds.service.js';
import { stellarService } from '../services/stellar.service.js';
import { z } from 'zod';

const createRequestSchema = z.object({
  conductorPublicKey: z.string().min(1),
  amount: z.string().min(1),
  description: z.string().min(1),
});

const approveRequestSchema = z.object({
  requestId: z.string().uuid(),
  jefeSecret: z.string().min(1),
  createNewEscrow: z.boolean().optional().default(true),
});

const rejectRequestSchema = z.object({
  requestId: z.string().uuid(),
  reason: z.string().optional(),
});

export class FundsController {
  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const { jefePublicKey } = req.body;

      if (!jefePublicKey || typeof jefePublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'jefePublicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(jefePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid jefe public key' });
        return;
      }

      const validation = createRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const result = await fundsService.createRequest(
        validation.data.conductorPublicKey,
        {
          amount: validation.data.amount,
          description: validation.data.description,
        },
        jefePublicKey
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { jefePublicKey } = req.body;

      if (!jefePublicKey || typeof jefePublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'jefePublicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(jefePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid jefe public key' });
        return;
      }

      const validation = approveRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const result = await fundsService.approveRequest(
        {
          requestId: validation.data.requestId,
          jefeSecret: validation.data.jefeSecret,
          createNewEscrow: validation.data.createNewEscrow,
        },
        jefePublicKey
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async releaseFunds(req: Request, res: Response): Promise<void> {
    try {
      const { requestId, jefeSecret, jefePublicKey } = req.body;

      if (!requestId || !jefeSecret || !jefePublicKey) {
        res.status(400).json({ success: false, error: 'requestId, jefeSecret, and jefePublicKey are required' });
        return;
      }

      if (!stellarService.validatePublicKey(jefePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid jefe public key' });
        return;
      }

      const result = await fundsService.releaseFunds(requestId, jefeSecret, jefePublicKey);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: { txHash: result.txHash },
          message: 'Funds released successfully',
        });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async rejectRequest(req: Request, res: Response): Promise<void> {
    try {
      const { jefePublicKey } = req.body;

      if (!jefePublicKey || typeof jefePublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'jefePublicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(jefePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid jefe public key' });
        return;
      }

      const validation = rejectRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const result = fundsService.rejectRequest(
        {
          requestId: validation.data.requestId,
          reason: validation.data.reason,
        },
        jefePublicKey
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, error: 'Request ID is required' });
        return;
      }

      const result = fundsService.getRequest(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const { jefePublicKey } = req.query;

      if (typeof jefePublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'jefePublicKey query parameter is required' });
        return;
      }

      if (!stellarService.validatePublicKey(jefePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid jefe public key' });
        return;
      }

      const result = fundsService.getPendingRequests(jefePublicKey);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getRequestsByConductor(req: Request, res: Response): Promise<void> {
    try {
      const { publicKey } = req.params;

      if (!publicKey) {
        res.status(400).json({ success: false, error: 'Public key is required' });
        return;
      }

      if (!stellarService.validatePublicKey(publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = fundsService.getRequestsByConductor(publicKey);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async createTestnetAccount(req: Request, res: Response): Promise<void> {
    try {
      const result = await fundsService.createTestnetAccount();

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Testnet account created. Fund with Friendbot.',
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async fundTestnetAccount(req: Request, res: Response): Promise<void> {
    try {
      const { publicKey } = req.body;

      if (!publicKey || typeof publicKey !== 'string') {
        res.status(400).json({ success: false, error: 'publicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await fundsService.fundTestnetAccount(publicKey);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Account funded with 10,000 XLM (testnet)',
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getEscrowStatus(req: Request, res: Response): Promise<void> {
    try {
      const { contractId } = req.params;

      if (!contractId) {
        res.status(400).json({ success: false, error: 'Contract ID is required' });
        return;
      }

      const result = await fundsService.getEscrowStatus(contractId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export const fundsController = new FundsController();
