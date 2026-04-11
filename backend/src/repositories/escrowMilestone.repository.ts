import prisma from '../db/prisma.js';

export type FundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RELEASED';

export interface CreateEscrowMilestoneDTO {
  escrowId: string;
  contractId: string;
  engagementId: string;
  title: string;
  description?: string;
  amount: number;
  status?: FundStatus;
}

export interface UpdateEscrowMilestoneDTO {
  title?: string;
  description?: string;
  amount?: number;
  status?: FundStatus;
  releasedAt?: Date;
}

export class EscrowMilestoneRepository {
  async findAll() {
    return prisma.escrowMilestone.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.escrowMilestone.findUnique({
      where: { id },
    });
  }

  async findByContractId(contractId: string) {
    return prisma.escrowMilestone.findFirst({
      where: { contractId },
    });
  }

  async findByEngagementId(engagementId: string) {
    return prisma.escrowMilestone.findMany({
      where: { engagementId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: CreateEscrowMilestoneDTO) {
    return prisma.escrowMilestone.create({ data });
  }

  async update(id: string, data: UpdateEscrowMilestoneDTO) {
    return prisma.escrowMilestone.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.escrowMilestone.delete({
      where: { id },
    });
  }

  async count() {
    return prisma.escrowMilestone.count();
  }

  async getTotalEscrowAmount() {
    const result = await prisma.escrowMilestone.aggregate({
      where: { status: { in: ['APPROVED', 'PENDING'] } },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getTotalReleasedAmount() {
    const result = await prisma.escrowMilestone.aggregate({
      where: { status: 'RELEASED' },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getDefaultEscrowConfig() {
    return prisma.escrowConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const escrowMilestoneRepository = new EscrowMilestoneRepository();
