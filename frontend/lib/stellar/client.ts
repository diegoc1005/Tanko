import StellarSdk from '@stellar/stellar-sdk'

// Configuración de la red Stellar
const networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015'
const horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'

// Servidor de Horizon
export const horizonServer = new StellarSdk.Horizon.Server(horizonUrl)

// Tipos de red
export type StellarNetwork = 'testnet' | 'public'

// Configuración de red
export const networkConfig = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    friendbotUrl: 'https://anchor-test.stellar.org/friendbot',
  },
  public: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    horizonUrl: 'https://horizon.stellar.org',
    friendbotUrl: '',
  },
}

// Obtener configuración de red activa
export function getNetworkConfig(): typeof networkConfig.testnet {
  const network = (process.env.STELLAR_NETWORK || 'testnet') as StellarNetwork
  return networkConfig[network]
}

// Usar red de prueba por defecto
StellarSdk.Network.useTestNetwork()

export { StellarSdk }
export default StellarSdk
