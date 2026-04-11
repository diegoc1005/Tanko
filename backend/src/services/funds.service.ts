import {
  CreateEscrowPayload,
  EscrowResponse,
  TestnetAccount,
} from '../types/index.js';
import { trustlessWorkService } from './trustlessWork.service.js';
import { stellarService } from './stellar.service.js';
import { fundRequestRepository } from '../repositories/fundRequest.repository.js';
import { escrowConfigRepository } from '../repositories/escrowConfig.repository.js';
import { escrowMilestoneRepository } from '../repositories/escrowMilestone.repository.js';
import axios from 'axios';

export interface CreateFundRequestInput {
  driverPubKey: string;
  managerPubKey: string;
  liters: number;
  amount: number;
  description?: string;
}

export interface ApproveFundRequestInput {
  requestId: string;
  managerSecret: string;
}

export interface ReleaseFundsInput {
  requestId: string;
  managerSecret: string;
  managerPubKey: string;
}

export interface RejectFundRequestInput {
  requestId: string;
}

export class FundsService {
  async createRequest(input: CreateFundRequestInput) {
    if (!stellarService.validatePublicKey(input.driverPubKey)) {
      return { success: false, error: 'Invalid driver public key' };
    }

    if (!stellarService.validatePublicKey(input.managerPubKey)) {
      return { success: false, error: 'Invalid manager public key' };
    }

    if (input.amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const request = await fundRequestRepository.create({
      driverPubKey: input.driverPubKey,
      managerPubKey: input.managerPubKey,
      liters: input.liters,
      amount: input.amount,
      description: input.description,
    });

    return { success: true, data: request };
  }

  async approveRequest(input: ApproveFundRequestInput, managerPubKey: string) {
    if (!stellarService.validateSecretKey(input.managerSecret)) {
      return { success: false, error: 'Invalid secret key' };
    }

    const request = await fundRequestRepository.findById(input.requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: `Request is already ${request.status}` };
    }

    if (request.managerPubKey !== managerPubKey) {
      return { success: false, error: 'Only the assigned manager can approve this request' };
    }

    const escrowConfig = await escrowConfigRepository.getDefault();
    const trustline = {
      address: escrowConfig.usdcAddress,
      decimals: escrowConfig.decimals,
    };

    const escrowPayload: CreateEscrowPayload = {
      signer: managerPubKey,
      engagementId: `FUND-${request.id.substring(0, 8).toUpperCase()}`,
      title: `Fuel Request - ${request.liters}L`,
      description: request.description || `Fuel request for ${request.liters} liters`,
      roles: {
        sender: managerPubKey,
        serviceProvider: managerPubKey,
        platformAddress: managerPubKey,
        releaseSigner: managerPubKey,
        disputeResolver: managerPubKey,
        approver: managerPubKey,
        receiver: request.driverPubKey,
      },
      amount: request.amount,
      platformFee: escrowConfig.platformFee,
      trustline,
    };

    const escrowResult = await trustlessWorkService.createSingleReleaseEscrow(escrowPayload);

    if (!escrowResult.success || !escrowResult.data) {
      return { success: false, error: escrowResult.error || 'Failed to create escrow' };
    }

    const signedXdr = stellarService.signTransaction(
      escrowResult.data.xdr || '',
      input.managerSecret
    );

    const submitResult = await stellarService.submitTransaction(signedXdr);

    await fundRequestRepository.update(request.id, {
      status: 'APPROVED',
      contractId: escrowResult.data.contractId,
      escrowXdr: signedXdr,
      escrowTxHash: submitResult.hash,
    });

    const escrowContractId = escrowResult.data.contractId || `fund-${Date.now()}`;
    await escrowMilestoneRepository.create({
      escrowId: escrowContractId,
      contractId: escrowContractId,
      engagementId: escrowPayload.engagementId,
      title: escrowPayload.title || `Fuel Request`,
      description: escrowPayload.description || `Fuel request`,
      amount: request.amount,
      status: 'APPROVED',
    });

    return {
      success: true,
      data: await fundRequestRepository.findById(request.id),
    };
  }

  async releaseFunds(input: ReleaseFundsInput) {
    if (!stellarService.validateSecretKey(input.managerSecret)) {
      return { success: false, error: 'Invalid secret key' };
    }

    const request = await fundRequestRepository.findById(input.requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'APPROVED') {
      return { success: false, error: 'Request must be approved before releasing funds' };
    }

    if (!request.contractId) {
      return { success: false, error: 'No escrow contract associated' };
    }

    const escrowStatus = await trustlessWorkService.getEscrow(request.contractId);

    if (!escrowStatus.success || !escrowStatus.data) {
      return { success: false, error: 'Failed to get escrow status' };
    }

    if (escrowStatus.data.status === 'released') {
      return { success: false, error: 'Funds already released' };
    }

    const approveResult = await trustlessWorkService.approveMilestone({
      contractId: request.contractId,
      milestoneIndex: 0,
      signer: input.managerPubKey,
      rolePublicKey: input.managerPubKey,
    });

    if (!approveResult.success || !approveResult.data) {
      return { success: false, error: approveResult.error || 'Failed to approve milestone' };
    }

    const signedApproveXdr = stellarService.signTransaction(
      approveResult.data.xdr,
      input.managerSecret
    );
    await stellarService.submitTransaction(signedApproveXdr);

    const releaseResult = await trustlessWorkService.releaseFunds({
      contractId: request.contractId,
      signer: input.managerPubKey,
      rolePublicKey: input.managerPubKey,
    });

    if (!releaseResult.success || !releaseResult.data) {
      return { success: false, error: releaseResult.error || 'Failed to release funds' };
    }

    const signedReleaseXdr = stellarService.signTransaction(
      releaseResult.data.xdr,
      input.managerSecret
    );
    const txResult = await stellarService.submitTransaction(signedReleaseXdr);

    await fundRequestRepository.update(request.id, { status: 'RELEASED' });

    const milestone = await escrowMilestoneRepository.findByContractId(request.contractId);
    if (milestone) {
      await escrowMilestoneRepository.update(milestone.id, {
        status: 'RELEASED',
        releasedAt: new Date(),
      });
    }

    return { success: true, txHash: txResult.hash };
  }

  rejectRequest(input: RejectFundRequestInput, managerPubKey: string) {
    return this.rejectRequestInternal(input, managerPubKey);
  }

  private async rejectRequestInternal(input: RejectFundRequestInput, managerPubKey: string) {
    const request = await fundRequestRepository.findById(input.requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: `Cannot reject request with status: ${request.status}` };
    }

    if (request.managerPubKey !== managerPubKey) {
      return { success: false, error: 'Only the assigned manager can reject this request' };
    }

    await fundRequestRepository.update(request.id, {
      status: 'REJECTED',
    });

    return {
      success: true,
      data: await fundRequestRepository.findById(request.id),
    };
  }

  getRequest(id: string) {
    return this.getRequestInternal(id);
  }

  private async getRequestInternal(id: string) {
    const request = await fundRequestRepository.findById(id);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    return { success: true, data: request };
  }

  getPendingRequests(managerPubKey: string) {
    return this.getPendingRequestsInternal(managerPubKey);
  }

  private async getPendingRequestsInternal(managerPubKey: string) {
    const requests = await fundRequestRepository.findPendingByManager(managerPubKey);
    return { success: true, data: requests };
  }

  getRequestsByDriver(driverPubKey: string) {
    return this.getRequestsByDriverInternal(driverPubKey);
  }

  private async getRequestsByDriverInternal(driverPubKey: string) {
    const requests = await fundRequestRepository.findByDriverPubKey(driverPubKey);
    return { success: true, data: requests };
  }

  async createTestnetAccount(): Promise<{ success: boolean; data?: TestnetAccount; error?: string }> {
    try {
      const keypair = stellarService.generateKeypair();

      await axios.get(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(keypair.publicKey)}`
      );

      return {
        success: true,
        data: {
          publicKey: keypair.publicKey,
          secret: keypair.secret,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create testnet account',
      };
    }
  }

  async fundTestnetAccount(publicKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.get(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund account',
      };
    }
  }

  async getEscrowStatus(contractId: string) {
    const result = await trustlessWorkService.getEscrow(contractId);

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Escrow not found' };
    }

    return {
      success: true,
      data: {
        contractId: result.data.contractId,
        status: result.data.status,
        balance: result.data.amount,
      },
    };
  }

  async getEscrowConfig() {
    const config = await escrowConfigRepository.getDefault();
    return { success: true, data: config };
  }

  async updateEscrowConfig(data: { usdcAddress?: string; decimals?: number; platformFee?: number }) {
    const config = await escrowConfigRepository.update('default', data);
    return { success: true, data: config };
  }
}

export const fundsService = new FundsService();
