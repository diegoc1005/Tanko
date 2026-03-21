import { describe, it, expect } from 'vitest'
import { generateKeypair, accountExists } from '@/lib/stellar/wallet'

describe('Stellar Wallet Service', () => {
  describe('generateKeypair', () => {
    it('should generate a valid keypair', () => {
      const keypair = generateKeypair()
      
      expect(keypair).toHaveProperty('publicKey')
      expect(keypair).toHaveProperty('secretKey')
      expect(keypair.publicKey).toMatch(/^G[A-Z0-9]{55}$/)
      expect(keypair.secretKey).toMatch(/^S[A-Z0-9]{55}$/)
    })

    it('should generate unique keypairs each time', () => {
      const keypair1 = generateKeypair()
      const keypair2 = generateKeypair()
      
      expect(keypair1.publicKey).not.toBe(keypair2.publicKey)
      expect(keypair1.secretKey).not.toBe(keypair2.secretKey)
    })

    it('should generate valid Stellar public key format', () => {
      const keypair = generateKeypair()
      
      // Stellar public keys start with G and are 56 characters
      expect(keypair.publicKey.length).toBe(56)
      expect(keypair.publicKey.startsWith('G')).toBe(true)
    })

    it('should generate valid Stellar secret key format', () => {
      const keypair = generateKeypair()
      
      // Stellar secret keys start with S and are 56 characters
      expect(keypair.secretKey.length).toBe(56)
      expect(keypair.secretKey.startsWith('S')).toBe(true)
    })
  })

  describe('accountExists', () => {
    it('should return false for non-existent accounts', async () => {
      const keypair = generateKeypair()
      const exists = await accountExists(keypair.publicKey)
      
      expect(exists).toBe(false)
    })
  })
})
