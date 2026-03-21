import {
  createEscrowSchema,
  createMultiReleaseEscrowSchema,
  fundEscrowSchema,
  approveMilestoneSchema,
  releaseFundsSchema,
  getEscrowSchema,
  setTrustlineSchema,
  getEscrowsByRoleSchema,
  getMultipleBalancesSchema,
  disputeEscrowSchema,
  resolveDisputeSchema,
} from '../src/utils/validators';

describe('Validators', () => {
  const validTrustline = {
    address: 'CBIELTK6YBZJU5UP2WWQAUYO4SJ2HBMQEFMU7HHD32YBXE7MKU65XABZ',
    decimals: 10000000,
  };

  const validRoles = {
    sender: 'GASENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    approver: 'GAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    receiver: 'GARECEIVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  };

  describe('createEscrowSchema', () => {
    it('should validate correct single release escrow payload', () => {
      const payload = {
        signer: validRoles.approver,
        engagementId: 'ORDER-001',
        roles: validRoles,
        amount: '10000000',
        description: 'Pago por diésel',
        trustline: validTrustline,
      };

      const result = createEscrowSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should fail with missing required fields', () => {
      const payload = {
        signer: validRoles.approver,
        engagementId: 'ORDER-001',
        roles: validRoles,
      };

      const result = createEscrowSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should fail with empty amount', () => {
      const payload = {
        signer: validRoles.approver,
        engagementId: 'ORDER-001',
        roles: validRoles,
        amount: '',
        description: 'Pago por diésel',
        trustline: validTrustline,
      };

      const result = createEscrowSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should accept optional receiverMemo', () => {
      const payload = {
        signer: validRoles.approver,
        engagementId: 'ORDER-001',
        roles: validRoles,
        amount: '10000000',
        description: 'Pago por diésel',
        trustline: validTrustline,
        receiverMemo: 'memo-123',
      };

      const result = createEscrowSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('createMultiReleaseEscrowSchema', () => {
    it('should validate multi release escrow with milestones', () => {
      const payload = {
        signer: validRoles.approver,
        engagementId: 'ORDER-001',
        roles: validRoles,
        amount: '10000000',
        description: 'Pago por diésel',
        trustline: validTrustline,
        milestones: [
          { description: 'Primera entrega' },
          { description: 'Segunda entrega' },
        ],
      };

      const result = createMultiReleaseEscrowSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should fail with empty milestones array', () => {
      const payload = {
        signer: validRoles.approver,
        engagementId: 'ORDER-001',
        roles: validRoles,
        amount: '10000000',
        description: 'Pago por diésel',
        trustline: validTrustline,
        milestones: [],
      };

      const result = createMultiReleaseEscrowSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('fundEscrowSchema', () => {
    it('should validate fund escrow payload', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.sender,
        role: 'sender',
        rolePublicKey: validRoles.sender,
        trustline: validTrustline,
      };

      const result = fundEscrowSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.sender,
        role: 'invalid_role',
        rolePublicKey: validRoles.sender,
        trustline: validTrustline,
      };

      const result = fundEscrowSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('approveMilestoneSchema', () => {
    it('should validate approve milestone payload', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        milestoneIndex: 0,
        signer: validRoles.approver,
        rolePublicKey: validRoles.approver,
      };

      const result = approveMilestoneSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject negative milestone index', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        milestoneIndex: -1,
        signer: validRoles.approver,
        rolePublicKey: validRoles.approver,
      };

      const result = approveMilestoneSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('releaseFundsSchema', () => {
    it('should validate release funds payload', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.approver,
        rolePublicKey: validRoles.approver,
      };

      const result = releaseFundsSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should fail with missing contractId', () => {
      const payload = {
        signer: validRoles.approver,
        rolePublicKey: validRoles.approver,
      };

      const result = releaseFundsSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('getEscrowSchema', () => {
    it('should validate get escrow query', () => {
      const query = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        type: 'single',
      };

      const result = getEscrowSchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should default type to single', () => {
      const query = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      };

      const result = getEscrowSchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('single');
      }
    });
  });

  describe('setTrustlineSchema', () => {
    it('should validate trustline setup payload', () => {
      const payload = {
        address: 'GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
        publicKey: validRoles.sender,
        trustline: validTrustline,
      };

      const result = setTrustlineSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('getEscrowsByRoleSchema', () => {
    it('should validate role query', () => {
      const query = {
        role: 'sender',
        publicKey: validRoles.sender,
      };

      const result = getEscrowsByRoleSchema.safeParse(query);
      expect(result.success).toBe(true);
    });

    it('should accept all valid roles', () => {
      const roles = ['sender', 'approver', 'receiver'];

      for (const role of roles) {
        const query = { role, publicKey: validRoles.sender };
        const result = getEscrowsByRoleSchema.safeParse(query);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('getMultipleBalancesSchema', () => {
    it('should validate multiple balances request', () => {
      const payload = {
        contractIds: [
          'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
          'CD0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987654321',
        ],
      };

      const result = getMultipleBalancesSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should fail with empty contractIds array', () => {
      const payload = {
        contractIds: [],
      };

      const result = getMultipleBalancesSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('disputeEscrowSchema', () => {
    it('should validate dispute payload with reason', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.sender,
        rolePublicKey: validRoles.sender,
        reason: 'Combustible no entregado',
      };

      const result = disputeEscrowSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should allow optional reason', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.sender,
        rolePublicKey: validRoles.sender,
      };

      const result = disputeEscrowSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('resolveDisputeSchema', () => {
    it('should validate resolve dispute payload', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.sender,
        rolePublicKey: validRoles.sender,
        resolver: 'receiver',
        percentage: 100,
      };

      const result = resolveDisputeSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject percentage over 100', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.sender,
        rolePublicKey: validRoles.sender,
        resolver: 'receiver',
        percentage: 150,
      };

      const result = resolveDisputeSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('should accept percentage of 0', () => {
      const payload = {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        signer: validRoles.sender,
        rolePublicKey: validRoles.sender,
        resolver: 'receiver',
        percentage: 0,
      };

      const result = resolveDisputeSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
