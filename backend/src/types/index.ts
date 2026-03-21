export interface Trustline {
  address: string;
  decimals: number;
}

export interface Roles {
  sender: string;
  approver: string;
  receiver: string;
}

export interface Milestone {
  description: string;
  status: 'pending' | 'approved' | 'released' | 'disputed';
}

export interface CreateEscrowPayload {
  signer: string;
  engagementId: string;
  roles: Roles;
  amount: string;
  description: string;
  trustline: Trustline;
  receiverMemo?: string;
}

export interface FundEscrowPayload {
  contractId: string;
  signer: string;
  role: 'sender' | 'approver' | 'receiver';
  rolePublicKey: string;
  trustline: Trustline;
}

export interface ApproveMilestonePayload {
  contractId: string;
  milestoneIndex: number;
  signer: string;
  rolePublicKey: string;
}

export interface ReleaseFundsPayload {
  contractId: string;
  signer: string;
  rolePublicKey: string;
}

export interface SendTransactionPayload {
  xdr: string;
}

export interface EscrowResponse {
  contractId: string;
  xdr: string;
}

export interface TrustlessWorkResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EscrowStatus {
  contractId: string;
  status: 'initialized' | 'funded' | 'approved' | 'released' | 'disputed';
  amount: string;
  milestone?: Milestone;
  createdAt: string;
  updatedAt: string;
}

export interface FundRequest {
  id: string;
  conductorPublicKey: string;
  jefePublicKey: string;
  amount: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'released';
  contractId?: string;
  escrowXdr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundRequestPayload {
  amount: string;
  description: string;
}

export interface ApproveFundRequestPayload {
  requestId: string;
  jefeSecret: string;
  createNewEscrow?: boolean;
}

export interface RejectFundRequestPayload {
  requestId: string;
  reason?: string;
}

export interface TestnetAccount {
  publicKey: string;
  secret: string;
}
