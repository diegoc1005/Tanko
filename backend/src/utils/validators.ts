import { z } from 'zod';

export const trustlineSchema = z.object({
  address: z.string().min(1, 'Trustline address is required'),
  decimals: z.number().positive('Decimals must be positive'),
});

export const rolesSchema = z.object({
  sender: z.string().min(1, 'Sender address is required'),
  approver: z.string().min(1, 'Approver address is required'),
  receiver: z.string().min(1, 'Receiver address is required'),
});

export const createEscrowSchema = z.object({
  signer: z.string().min(1, 'Signer address is required'),
  engagementId: z.string().min(1, 'Engagement ID is required'),
  roles: rolesSchema,
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  trustline: trustlineSchema,
  receiverMemo: z.string().optional(),
});

export const createMultiReleaseEscrowSchema = createEscrowSchema.extend({
  milestones: z.array(
    z.object({
      description: z.string().min(1, 'Milestone description is required'),
    })
  ).min(1, 'At least one milestone is required'),
});

export const fundEscrowSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  role: z.enum(['sender', 'approver', 'receiver']),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
  trustline: trustlineSchema,
});

export const approveMilestoneSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  milestoneIndex: z.number().int().nonnegative('Milestone index must be non-negative'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
});

export const releaseFundsSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
});

export const sendTransactionSchema = z.object({
  xdr: z.string().min(1, 'XDR is required'),
});

export const getEscrowSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  type: z.enum(['single', 'multi']).default('single'),
});

export const setTrustlineSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  publicKey: z.string().min(1, 'Public key is required'),
  trustline: trustlineSchema,
});

export const getEscrowsByRoleSchema = z.object({
  role: z.enum(['sender', 'approver', 'receiver']),
  publicKey: z.string().min(1, 'Public key is required'),
});

export const getMultipleBalancesSchema = z.object({
  contractIds: z.array(z.string().min(1)).min(1, 'At least one contract ID is required'),
});

export const disputeEscrowSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
  reason: z.string().optional(),
});

export const resolveDisputeSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
  resolver: z.enum(['sender', 'approver', 'receiver']),
  percentage: z.number().min(0).max(100),
});

export type CreateEscrowInput = z.infer<typeof createEscrowSchema>;
export type CreateMultiReleaseEscrowInput = z.infer<typeof createMultiReleaseEscrowSchema>;
export type FundEscrowInput = z.infer<typeof fundEscrowSchema>;
export type ApproveMilestoneInput = z.infer<typeof approveMilestoneSchema>;
export type ReleaseFundsInput = z.infer<typeof releaseFundsSchema>;
export type SendTransactionInput = z.infer<typeof sendTransactionSchema>;
export type GetEscrowInput = z.infer<typeof getEscrowSchema>;
export type SetTrustlineInput = z.infer<typeof setTrustlineSchema>;
export type GetEscrowsByRoleInput = z.infer<typeof getEscrowsByRoleSchema>;
export type GetMultipleBalancesInput = z.infer<typeof getMultipleBalancesSchema>;
export type DisputeEscrowInput = z.infer<typeof disputeEscrowSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
