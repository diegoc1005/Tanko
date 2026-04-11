import prisma from '../db/prisma.js';

export interface UpdateEscrowConfigDTO {
  usdcAddress?: string;
  decimals?: number;
  platformFee?: number;
}

export class EscrowConfigRepository {
  async findAll() {
    return prisma.escrowConfig.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findByName(name: string = 'default') {
    return prisma.escrowConfig.findUnique({
      where: { name },
    });
  }

  async findById(id: string) {
    return prisma.escrowConfig.findUnique({
      where: { id },
    });
  }

  async getDefault() {
    let config = await prisma.escrowConfig.findUnique({
      where: { name: 'default' },
    });

    if (!config) {
      config = await prisma.escrowConfig.create({
        data: {
          name: 'default',
          usdcAddress: 'CBIELTK6YBZJU5UP2WWQAUYO4SJ2HBMQEFMU7HHD32YBXE7MKU65XABZ',
          decimals: 7,
          platformFee: 0,
        },
      });
    }

    return config;
  }

  async create(data: { name: string; usdcAddress: string; decimals?: number; platformFee?: number }) {
    return prisma.escrowConfig.create({ data });
  }

  async update(name: string, data: UpdateEscrowConfigDTO) {
    return prisma.escrowConfig.update({
      where: { name },
      data,
    });
  }

  async delete(name: string) {
    return prisma.escrowConfig.delete({
      where: { name },
    });
  }
}

export const escrowConfigRepository = new EscrowConfigRepository();
