export const mockTrustlessWorkResponses = {
  createEscrowSuccess: {
    success: true,
    data: {
      contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      xdr: 'AAAAA4K4KNVGYVLBUJHTHV2WYQXNKA6IJHGBNHWSOHIQB2M4BKZPGQABZABO4IA+4B+pD+YW5T2J6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9',
    },
  },

  createEscrowError: {
    success: false,
    error: 'Invalid signer address',
  },

  fundEscrowSuccess: {
    success: true,
    data: {
      txHash: 'abc123def456789012345678901234567890abcdef123456789012345678901234',
    },
  },

  approveMilestoneSuccess: {
    success: true,
    data: {
      xdr: 'AAAA4K4KNVGYVLBUJHTHV2WYQXNKA6IJHGBNHWSOHIQB2M4BKZPGQABZABO4IA+pD+YW5T2J6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2',
    },
  },

  releaseFundsSuccess: {
    success: true,
    data: {
      xdr: 'AAAA4K4KNVGYVLBUJHTHV2WYQXNKA6IJHGBNHWSOHIQB2M4BKZPGQABZABO4IA+pD+YW5T2J6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4',
    },
  },

  getEscrowSuccess: {
    success: true,
    data: {
      contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      status: 'funded',
      amount: '10000000',
      milestone: {
        description: 'Entrega de combustible',
        status: 'approved',
      },
      createdAt: '2026-03-20T10:00:00Z',
      updatedAt: '2026-03-20T12:00:00Z',
    },
  },

  disputeSuccess: {
    success: true,
    data: {
      xdr: 'AAAA4K4KNVGYVLBUJHTHV2WYQXNKA6IJHGBNHWSOHIQB2M4BKZPGQABZABO4IA+pD+YW5T2J6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6',
    },
  },

  setTrustlineSuccess: {
    success: true,
    data: {
      xdr: 'AAAA4K4KNVGYVLBUJHTHV2WYQXNKA6IJHGBNHWSOHIQB2M4BKZPGQABZABO4IA+pD+YW5T2J6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8',
    },
  },

  getMultipleBalancesSuccess: {
    success: true,
    data: [
      { contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', balance: '5000000' },
      { contractId: 'CD0987654321ZYXWVUTSRQPONMLKJIHGFEDCBA0987654321', balance: '3000000' },
    ],
  },

  getEscrowsByRoleSuccess: {
    success: true,
    data: [
      {
        contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        status: 'funded',
        amount: '10000000',
        createdAt: '2026-03-20T10:00:00Z',
        updatedAt: '2026-03-20T12:00:00Z',
      },
    ],
  },
};

export const mockStellarResponses = {
  validKeypair: {
    publicKey: 'GASENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    secret: 'SAESENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCD',
  },

  invalidKey: {
    publicKey: 'INVALID_KEY',
  },

  accountInfo: {
    publicKey: 'GASENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    sequence: '1234567890',
    balances: [
      { asset: 'XLM', balance: '10000.0000000' },
      { asset: 'USDC', balance: '5000.0000000' },
    ],
  },

  submitTransactionSuccess: {
    hash: 'abc123def456789012345678901234567890abcdef123456789012345678901234',
  },
};

export const validEscrowPayload = {
  signer: 'GAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  engagementId: 'ORDER-FUEL-001',
  roles: {
    sender: 'GASENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    approver: 'GAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
    receiver: 'GARECEIVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  },
  amount: '10000000',
  description: 'Pago por suministro de diésel - Contrato TANKO-2026-001',
  trustline: {
    address: 'CBIELTK6YBZJU5UP2WWQAUYO4SJ2HBMQEFMU7HHD32YBXE7MKU65XABZ',
    decimals: 10000000,
  },
};

export const validFundPayload = {
  contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  signer: 'GASENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  role: 'sender' as const,
  rolePublicKey: 'GASENDER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  trustline: {
    address: 'CBIELTK6YBZJU5UP2WWQAUYO4SJ2HBMQEFMU7HHD32YBXE7MKU65XABZ',
    decimals: 10000000,
  },
};

export const validReleasePayload = {
  contractId: 'CD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  signer: 'GAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
  rolePublicKey: 'GAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB',
};

export const validMultiReleasePayload = {
  ...validEscrowPayload,
  milestones: [
    { description: 'Primera entrega - 5000 litros de diésel' },
    { description: 'Segunda entrega - 5000 litros de diésel' },
  ],
};
