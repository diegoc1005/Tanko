import axios from 'axios';
import {
  CreateEscrowPayload,
  FundEscrowPayload,
  ApproveMilestonePayload,
  ReleaseFundsPayload,
  EscrowResponse,
  EscrowStatus,
} from '../src/types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockContractId = 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const mockXdr = 'AAAA4K4KNVGYVLBUJHTHV2WYQXNKA6IJHGBNHWSOHIQB2M4BKZPGQABZABO4IA+pD+YW5T2J6D7E8F9G0H1I2J3';
const mockTxHash = 'abc123def456789012345678901234567890abcdef123456789012345678901234';

const validEscrowPayload: CreateEscrowPayload = {
  signer: 'GAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  engagementId: 'ORDER-FUEL-001',
  roles: {
    sender: 'GASENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    approver: 'GAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    receiver: 'GARECEIVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  },
  amount: '10000000',
  description: 'Pago por suministro de diésel',
  trustline: {
    address: 'CBIELTK6YBZJU5UP2WWQAUYO4SJ2HBMQEFMU7HHD32YBXE7MKU65XABZ',
    decimals: 10000000,
  },
};

describe('TrustlessWork API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Escrow Creation Flow', () => {
    it('should create single release escrow and return contract ID + XDR', async () => {
      const mockResponse: EscrowResponse = {
        contractId: mockContractId,
        xdr: mockXdr,
      };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();
      
      const result = await service.createSingleReleaseEscrow(validEscrowPayload);

      expect(result.success).toBe(true);
      expect(result.data?.contractId).toBe(mockContractId);
      expect(result.data?.xdr).toBe(mockXdr);
    });

    it('should create multi release escrow with milestones', async () => {
      const mockResponse: EscrowResponse = {
        contractId: mockContractId,
        xdr: mockXdr,
      };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const payload = {
        ...validEscrowPayload,
        milestones: [
          { description: 'Primera entrega' },
          { description: 'Segunda entrega' },
        ],
      };

      const result = await service.createMultiReleaseEscrow(payload);

      expect(result.success).toBe(true);
      expect(result.data?.contractId).toBe(mockContractId);
    });
  });

  describe('Escrow Funding', () => {
    it('should fund escrow and return transaction hash', async () => {
      const mockResponse = { txHash: mockTxHash };
      const fundPayload: FundEscrowPayload = {
        contractId: mockContractId,
        signer: validEscrowPayload.roles.sender,
        role: 'sender',
        rolePublicKey: validEscrowPayload.roles.sender,
        trustline: validEscrowPayload.trustline,
      };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.fundEscrow(fundPayload);

      expect(result.success).toBe(true);
      expect(result.data?.txHash).toBe(mockTxHash);
    });
  });

  describe('Milestone Approval', () => {
    it('should approve milestone and return XDR', async () => {
      const mockResponse = { xdr: mockXdr };
      const approvePayload: ApproveMilestonePayload = {
        contractId: mockContractId,
        milestoneIndex: 0,
        signer: validEscrowPayload.roles.approver,
        rolePublicKey: validEscrowPayload.roles.approver,
      };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.approveMilestone(approvePayload);

      expect(result.success).toBe(true);
      expect(result.data?.xdr).toBe(mockXdr);
    });
  });

  describe('Fund Release', () => {
    it('should release funds after approval', async () => {
      const mockResponse = { xdr: mockXdr };
      const releasePayload: ReleaseFundsPayload = {
        contractId: mockContractId,
        signer: validEscrowPayload.roles.approver,
        rolePublicKey: validEscrowPayload.roles.approver,
      };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.releaseFunds(releasePayload);

      expect(result.success).toBe(true);
      expect(result.data?.xdr).toBe(mockXdr);
    });
  });

  describe('Escrow Query', () => {
    it('should get escrow status by contract ID', async () => {
      const mockResponse: EscrowStatus = {
        contractId: mockContractId,
        status: 'funded',
        amount: '10000000',
        milestone: {
          description: 'Entrega de combustible',
          status: 'approved',
        },
        createdAt: '2026-03-20T10:00:00Z',
        updatedAt: '2026-03-20T12:00:00Z',
      };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn(),
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.getEscrow(mockContractId);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('funded');
      expect(result.data?.amount).toBe('10000000');
    });
  });

  describe('Dispute Handling', () => {
    it('should create dispute with reason', async () => {
      const mockResponse = { xdr: mockXdr };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.disputeEscrow(
        mockContractId,
        validEscrowPayload.roles.sender,
        validEscrowPayload.roles.sender,
        'Combustible no entregado en plazo'
      );

      expect(result.success).toBe(true);
      expect(result.data?.xdr).toBe(mockXdr);
    });
  });

  describe('Trustline Setup', () => {
    it('should setup trustline for USDC', async () => {
      const mockResponse = { xdr: mockXdr };

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.setTrustline({
        address: 'GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
        publicKey: validEscrowPayload.roles.sender,
        trustline: {
          address: 'CBIELTK6YBZJU5UP2WWQAUYO4SJ2HBMQEFMU7HHD32YBXE7MKU65XABZ',
          decimals: 10000000,
        },
      });

      expect(result.success).toBe(true);
      expect(result.data?.xdr).toBe(mockXdr);
    });
  });

  describe('Multiple Balances Query', () => {
    it('should get balances for multiple escrows', async () => {
      const mockResponse = [
        { contractId: mockContractId, balance: '5000000' },
        { contractId: 'CD0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987654321', balance: '3000000' },
      ];

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
        get: jest.fn(),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.getMultipleEscrowBalances([
        mockContractId,
        'CD0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987654321',
      ]);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('Escrows by Role', () => {
    it('should get all escrows for a specific role', async () => {
      const mockResponse: EscrowStatus[] = [
        {
          contractId: mockContractId,
          status: 'funded',
          amount: '10000000',
          createdAt: '2026-03-20T10:00:00Z',
          updatedAt: '2026-03-20T12:00:00Z',
        },
      ];

      mockedAxios.create.mockImplementation(() => ({
        post: jest.fn(),
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
      } as any));

      const { TrustlessWorkService } = await import('../src/services/trustlessWork.service');
      const service = new TrustlessWorkService();

      const result = await service.getEscrowsByRole('sender', validEscrowPayload.roles.sender);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(1);
    });
  });
});
