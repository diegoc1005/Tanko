import {
  CreateEscrowPayload,
  FundEscrowPayload,
  ApproveMilestonePayload,
  ReleaseFundsPayload,
} from '../types/index.js';
import { trustlessWorkService } from './trustlessWork.service.js';
import { stellarService } from './stellar.service.js';
import { escrowConfigRepository } from '../repositories/escrowConfig.repository.js';
import { escrowMilestoneRepository } from '../repositories/escrowMilestone.repository.js';

export interface CreateEscrowInput {
  signer: string;
  engagementId: string;
  title: string;
  description?: string;
  roles: {
    sender: string;
    serviceProvider: string;
    platformAddress: string;
    releaseSigner: string;
    disputeResolver: string;
    approver?: string;
    receiver?: string;
  };
  amount: number;
  platformFee?: number;
  milestones?: { title: string; description: string; amount: number }[];
}

export interface FundEscrowInput {
  contractId: string;
  rolePublicKey: string;
  xdr: string;
}

export interface ApproveMilestoneInput {
  contractId: string;
  milestoneIndex: number;
  signer: string;
  rolePublicKey: string;
}

export interface ReleaseFundsInput {
  contractId: string;
  signer: string;
  rolePublicKey: string;
}

export class EscrowService {
  async createSingleReleaseEscrow(input: CreateEscrowInput) {
    this.validatePublicKeys(input.roles);

    const escrowConfig = await escrowConfigRepository.getDefault();
    const trustline = {
      address: escrowConfig.usdcAddress,
      decimals: escrowConfig.decimals,
    };

    const payload: CreateEscrowPayload = {
      signer: input.signer,
      engagementId: input.engagementId,
      title: input.title,
      description: input.description,
      roles: {
        sender: input.roles.sender,
        serviceProvider: input.roles.serviceProvider,
        platformAddress: input.roles.platformAddress,
        releaseSigner: input.roles.releaseSigner,
        disputeResolver: input.roles.disputeResolver,
        approver: input.roles.approver || input.roles.sender,
        receiver: input.roles.receiver || input.roles.serviceProvider,
      },
      amount: input.amount,
      platformFee: input.platformFee ?? escrowConfig.platformFee,
      trustline,
    };

    const result = await trustlessWorkService.createSingleReleaseEscrow(payload);

    if (result.success && result.data) {
      const contractId = result.data.contractId || `escrow-${Date.now()}`;
      await escrowMilestoneRepository.create({
        escrowId: contractId,
        contractId: contractId,
        engagementId: input.engagementId,
        title: input.title || `Escrow ${input.engagementId}`,
        description: input.description || `Single release escrow`,
        amount: input.amount,
        status: 'PENDING',
      });
    }

    return result;
  }

  async createMultiReleaseEscrow(input: CreateEscrowInput) {
    this.validatePublicKeys(input.roles);

    if (!input.milestones || input.milestones.length === 0) {
      return { success: false, error: 'Multi-release escrow requires at least one milestone' };
    }

    const escrowConfig = await escrowConfigRepository.getDefault();
    const trustline = {
      address: escrowConfig.usdcAddress,
      decimals: escrowConfig.decimals,
    };

    const payload: CreateEscrowPayload & { milestones: { title: string; description: string; amount: number; index: number }[] } = {
      signer: input.signer,
      engagementId: input.engagementId,
      title: input.title,
      description: input.description,
      roles: {
        sender: input.roles.sender,
        serviceProvider: input.roles.serviceProvider,
        platformAddress: input.roles.platformAddress,
        releaseSigner: input.roles.releaseSigner,
        disputeResolver: input.roles.disputeResolver,
        approver: input.roles.approver || input.roles.sender,
        receiver: input.roles.receiver || input.roles.serviceProvider,
      },
      amount: input.amount,
      platformFee: input.platformFee ?? escrowConfig.platformFee,
      trustline,
      milestones: input.milestones.map((m, i) => ({
        title: m.title,
        description: m.description,
        amount: m.amount,
        index: i + 1,
      })),
    };

    const result = await trustlessWorkService.createMultiReleaseEscrow(payload);

    if (result.success && result.data) {
      const contractId = result.data.contractId || `escrow-multi-${Date.now()}`;
      await escrowMilestoneRepository.create({
        escrowId: contractId,
        contractId: contractId,
        engagementId: input.engagementId,
        title: input.title || `Multi-Release Escrow ${input.engagementId}`,
        description: input.description || `Multi-release escrow`,
        amount: input.amount,
        status: 'PENDING',
      });
    }

    return result;
  }

  async fundEscrow(input: FundEscrowInput) {
    if (!stellarService.validatePublicKey(input.rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    const escrow = await trustlessWorkService.getEscrow(input.contractId);
    if (!escrow.success || !escrow.data) {
      return { success: false, error: 'Escrow not found' };
    }

    const payload: FundEscrowPayload = {
      contractId: input.contractId,
      rolePublicKey: input.rolePublicKey,
      xdr: input.xdr,
    };

    return trustlessWorkService.fundEscrow(payload);
  }

  async fundMultiReleaseEscrow(input: FundEscrowInput) {
    if (!stellarService.validatePublicKey(input.rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    const payload: FundEscrowPayload = {
      contractId: input.contractId,
      rolePublicKey: input.rolePublicKey,
      xdr: input.xdr,
    };

    return trustlessWorkService.fundMultiReleaseEscrow(payload);
  }

  async approveMilestone(input: ApproveMilestoneInput) {
    if (!stellarService.validatePublicKey(input.rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    const escrow = await trustlessWorkService.getEscrow(input.contractId);
    if (!escrow.success || !escrow.data) {
      return { success: false, error: 'Escrow not found' };
    }

    const payload: ApproveMilestonePayload = {
      contractId: input.contractId,
      milestoneIndex: input.milestoneIndex,
      signer: input.signer,
      rolePublicKey: input.rolePublicKey,
    };

    return trustlessWorkService.approveMilestone(payload);
  }

  async approveMultiReleaseMilestone(input: ApproveMilestoneInput) {
    if (!stellarService.validatePublicKey(input.rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    const payload: ApproveMilestonePayload = {
      contractId: input.contractId,
      milestoneIndex: input.milestoneIndex,
      signer: input.signer,
      rolePublicKey: input.rolePublicKey,
    };

    return trustlessWorkService.approveMultiReleaseMilestone(payload);
  }

  async releaseFunds(input: ReleaseFundsInput) {
    if (!stellarService.validatePublicKey(input.rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    const escrow = await trustlessWorkService.getEscrow(input.contractId);
    if (!escrow.success || !escrow.data) {
      return { success: false, error: 'Escrow not found' };
    }

    const payload: ReleaseFundsPayload = {
      contractId: input.contractId,
      signer: input.signer,
      rolePublicKey: input.rolePublicKey,
    };

    const result = await trustlessWorkService.releaseFunds(payload);

    if (result.success) {
      const milestone = await escrowMilestoneRepository.findByContractId(input.contractId);
      if (milestone) {
        await escrowMilestoneRepository.update(milestone.id, {
          status: 'RELEASED',
          releasedAt: new Date(),
        });
      }
    }

    return result;
  }

  async releaseMultiReleaseFunds(input: ReleaseFundsInput) {
    if (!stellarService.validatePublicKey(input.rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    const payload: ReleaseFundsPayload = {
      contractId: input.contractId,
      signer: input.signer,
      rolePublicKey: input.rolePublicKey,
    };

    const result = await trustlessWorkService.releaseMultiReleaseFunds(payload);

    if (result.success) {
      const milestone = await escrowMilestoneRepository.findByContractId(input.contractId);
      if (milestone) {
        await escrowMilestoneRepository.update(milestone.id, {
          status: 'RELEASED',
          releasedAt: new Date(),
        });
      }
    }

    return result;
  }

  async getEscrow(contractId: string, type: 'single' | 'multi' = 'single') {
    return type === 'multi'
      ? trustlessWorkService.getMultiReleaseEscrow(contractId)
      : trustlessWorkService.getEscrow(contractId);
  }

  async getEscrowMilestones(contractId: string) {
    return escrowMilestoneRepository.findByContractId(contractId);
  }

  async disputeEscrow(contractId: string, signer: string, rolePublicKey: string, reason?: string) {
    if (!stellarService.validatePublicKey(rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    return trustlessWorkService.disputeEscrow(contractId, signer, rolePublicKey, reason);
  }

  async resolveDispute(
    contractId: string,
    signer: string,
    rolePublicKey: string,
    resolver: 'serviceProvider' | 'platformAddress' | 'releaseSigner' | 'disputeResolver',
    percentage: number
  ) {
    if (!stellarService.validatePublicKey(rolePublicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    return trustlessWorkService.resolveDispute(contractId, signer, rolePublicKey, resolver, percentage);
  }

  async getEscrowsByRole(role: string, publicKey: string) {
    if (!stellarService.validatePublicKey(publicKey)) {
      return { success: false, error: 'Invalid public key' };
    }

    return trustlessWorkService.getEscrowsByRole(role, publicKey);
  }

  private validatePublicKeys(roles: CreateEscrowInput['roles']) {
    const keys = [
      roles.sender,
      roles.serviceProvider,
      roles.platformAddress,
      roles.releaseSigner,
      roles.disputeResolver,
    ];

    for (const key of keys) {
      if (!stellarService.validatePublicKey(key)) {
        throw new Error(`Invalid public key: ${key}`);
      }
    }
  }
}

export const escrowService = new EscrowService();
