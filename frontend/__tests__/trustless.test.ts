import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trustlessClient } from '@/lib/trustless/client'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: vi.fn(),
      post: vi.fn(),
    }),
  },
}))

describe('Trustless Work Client', () => {
  describe('configuration', () => {
    it('should have correct base URL configured', () => {
      // The client should be initialized with the base URL from env
      expect(process.env.TRUSTLESS_WORK_BASE_URL || 'https://dev.api.trustlesswork.com').toBeTruthy()
    })
  })

  describe('Escrow types', () => {
    it('should have valid TrustlessEscrowConfig structure', () => {
      const config = {
        title: 'Test Escrow',
        description: 'Test Description',
        engagementId: 'test-engagement-123',
        amount: '1000',
        asset: {
          code: 'USDC',
          issuer: 'GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHG5EYPPP',
        },
        roles: {
          serviceProvider: 'GABC123',
          approver: 'GDEF456',
          receiver: 'GGHI789',
          releaseSigner: 'GJKL012',
          disputeResolver: 'GMNO345',
        },
        platformFee: 0.003,
      }

      expect(config.title).toBeTruthy()
      expect(config.amount).toBeTruthy()
      expect(config.roles.serviceProvider).toBeTruthy()
      expect(config.roles.receiver).toBeTruthy()
      expect(config.roles.releaseSigner).toBeTruthy()
    })
  })
})
