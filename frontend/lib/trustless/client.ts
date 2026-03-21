import axios, { AxiosInstance } from 'axios'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA TRUSTLESS WORK
// ═══════════════════════════════════════════════════════════════════════════════

export interface TrustlessEscrowConfig {
  title: string
  description: string
  engagementId: string
  amount: string
  asset: {
    code: string
    issuer: string
  }
  roles: {
    serviceProvider: string
    approver: string
    receiver: string
    releaseSigner: string
    disputeResolver: string
    platformAddress?: string
  }
  platformFee?: number
}

export interface EscrowResponse {
  id?: string
  contractId?: string
  escrowId?: string
  xdr?: string
  success?: boolean
  error?: string
}

export interface EscrowBalance {
  contractId: string
  balance: string
  asset: string
}

export interface EscrowInfo {
  id: string
  contractId: string
  title: string
  description: string
  engagementId: string
  amount: string
  status: string
  roles: {
    serviceProvider: string
    approver: string
    receiver: string
    releaseSigner: string
    disputeResolver: string
  }
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  index: number
  title: string
  description: string
  amount: string
  status: 'pending' | 'approved' | 'released' | 'disputed'
}

export interface TransactionInfo {
  id: string
  type: string
  amount: string
  txHash: string
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTE DE TRUSTLESS WORK
// ═══════════════════════════════════════════════════════════════════════════════

class TrustlessWorkClient {
  private client: AxiosInstance
  private apiKey: string

  constructor() {
    const baseURL = process.env.TRUSTLESS_WORK_BASE_URL || 'https://dev.api.trustlesswork.com'
    this.apiKey = process.env.TRUSTLESS_WORK_API_KEY || ''
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 30000,
    })
  }

  /**
   * Despliega un nuevo escrow de liberación única
   */
  async deploySingleRelease(config: TrustlessEscrowConfig): Promise<EscrowResponse> {
    try {
      const response = await this.client.post('/deployer/single-release', {
        title: config.title,
        description: config.description,
        engagement_id: config.engagementId,
        amount: config.amount,
        asset: {
          code: config.asset.code,
          issuer: config.asset.issuer,
        },
        roles: {
          service_provider: config.roles.serviceProvider,
          approver: config.roles.approver,
          receiver: config.roles.receiver,
          release_signer: config.roles.releaseSigner,
          dispute_resolver: config.roles.disputeResolver,
          platform_address: config.roles.platformAddress,
        },
        platform_fee: config.platformFee || 0,
      })
      return response.data
    } catch (error: any) {
      console.error('Error deploying escrow:', error?.response?.data || error.message)
      return { success: false, error: error?.response?.data?.message || error.message }
    }
  }

  /**
   * Despliega un nuevo escrow multi-lanzamiento
   */
  async deployMultiRelease(config: TrustlessEscrowConfig & { milestones: { title: string; description: string; amount: string }[] }): Promise<EscrowResponse> {
    try {
      const response = await this.client.post('/deployer/multi-release', {
        title: config.title,
        description: config.description,
        engagement_id: config.engagementId,
        milestones: config.milestones.map((m, i) => ({
          index: i + 1,
          title: m.title,
          description: m.description,
          amount: m.amount,
        })),
        asset: {
          code: config.asset.code,
          issuer: config.asset.issuer,
        },
        roles: {
          service_provider: config.roles.serviceProvider,
          approver: config.roles.approver,
          receiver: config.roles.receiver,
          release_signer: config.roles.releaseSigner,
          dispute_resolver: config.roles.disputeResolver,
          platform_address: config.roles.platformAddress,
        },
        platform_fee: config.platformFee || 0,
      })
      return response.data
    } catch (error: any) {
      console.error('Error deploying multi-release escrow:', error?.response?.data || error.message)
      return { success: false, error: error?.response?.data?.message || error.message }
    }
  }

  /**
   * Financia un escrow existente
   */
  async fundEscrow(contractId: string, xdr: string): Promise<EscrowResponse> {
    try {
      const response = await this.client.post(`/escrow/single-release/fund-escrow`, {
        contract_id: contractId,
        xdr,
      })
      return response.data
    } catch (error: any) {
      console.error('Error funding escrow:', error?.response?.data || error.message)
      return { success: false, error: error?.response?.data?.message || error.message }
    }
  }

  /**
   * Aprueba un milestone
   */
  async approveMilestone(contractId: string, milestoneIndex: number, xdr: string): Promise<EscrowResponse> {
    try {
      const response = await this.client.post(`/escrow/single-release/approve-milestone`, {
        contract_id: contractId,
        milestone_index: milestoneIndex,
        xdr,
      })
      return response.data
    } catch (error: any) {
      console.error('Error approving milestone:', error?.response?.data || error.message)
      return { success: false, error: error?.response?.data?.message || error.message }
    }
  }

  /**
   * Libera fondos de un escrow
   */
  async releaseFunds(contractId: string, xdr: string): Promise<EscrowResponse> {
    try {
      const response = await this.client.post(`/escrow/single-release/release-funds`, {
        contract_id: contractId,
        xdr,
      })
      return response.data
    } catch (error: any) {
      console.error('Error releasing funds:', error?.response?.data || error.message)
      return { success: false, error: error?.response?.data?.message || error.message }
    }
  }

  /**
   * Obtiene el balance de un escrow
   */
  async getEscrowBalance(contractId: string): Promise<EscrowBalance | null> {
    try {
      const response = await this.client.get('/escrow/get-multiple-escrow-balance', {
        params: { contract_id: contractId },
      })
      return response.data.balances?.[0] || null
    } catch (error: any) {
      console.error('Error getting escrow balance:', error?.response?.data || error.message)
      return null
    }
  }

  /**
   * Obtiene información de un escrow
   */
  async getEscrow(contractId: string): Promise<EscrowInfo | null> {
    try {
      const response = await this.client.get(`/escrow/single-release/get-escrow`, {
        params: { contract_id: contractId },
      })
      return response.data
    } catch (error: any) {
      console.error('Error getting escrow info:', error?.response?.data || error.message)
      return null
    }
  }

  /**
   * Obtiene escrows por firmante
   */
  async getEscrowsBySigner(publicKey: string): Promise<EscrowInfo[]> {
    try {
      const response = await this.client.get('/helper/get-escrows-by-signer', {
        params: { signer: publicKey },
      })
      return response.data.escrows || []
    } catch (error: any) {
      console.error('Error getting escrows by signer:', error?.response?.data || error.message)
      return []
    }
  }

  /**
   * Envía una transacción XDR firmada a la red
   */
  async sendTransaction(xdr: string): Promise<{ txHash?: string; error?: string }> {
    try {
      const response = await this.client.post('/helper/send-transaction', { xdr })
      return { txHash: response.data.tx_hash }
    } catch (error: any) {
      console.error('Error sending transaction:', error?.response?.data || error.message)
      return { error: error?.response?.data?.message || error.message }
    }
  }

  /**
   * Obtiene transacciones de un escrow
   */
  async getEscrowTransactions(contractId: string): Promise<TransactionInfo[]> {
    try {
      const response = await this.client.get('/helper/get-transactions', {
        params: { contract_id: contractId },
      })
      return response.data.transactions || []
    } catch (error: any) {
      console.error('Error getting transactions:', error?.response?.data || error.message)
      return []
    }
  }
}

// Exportar instancia singleton
export const trustlessClient = new TrustlessWorkClient()
export default trustlessClient
