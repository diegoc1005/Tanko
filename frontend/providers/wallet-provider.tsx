'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  publicKey: string | null
  error: string | null
  network: string
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (network: 'testnet' | 'public') => void
  fetchAddress: () => Promise<string | null>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const freighterModule = new FreighterModule()

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    publicKey: null,
    error: null,
    network: 'testnet',
  })

  useEffect(() => {
    initializeKit()
    checkExistingConnection()
  }, [])

  const initializeKit = () => {
    try {
      StellarWalletsKit.init({
        modules: [freighterModule],
        selectedWalletId: 'freighter',
        network: Networks.TESTNET,
      })
    } catch (error) {
      console.error('Error initializing kit:', error)
    }
  }

  const checkExistingConnection = async () => {
    try {
      const storedAddress = localStorage.getItem('stellar_address')
      if (storedAddress) {
        setState(prev => ({
          ...prev,
          address: storedAddress,
          publicKey: storedAddress,
          isConnected: true,
        }))
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const fetchAddress = async (): Promise<string | null> => {
    try {
      const result = await StellarWalletsKit.getAddress()
      return result.address
    } catch {
      return null
    }
  }

  const connect = async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }))
    
    try {
      const result = await StellarWalletsKit.authModal()
      
      if (result?.address) {
        localStorage.setItem('stellar_address', result.address)
        setState({
          address: result.address,
          publicKey: result.address,
          isConnected: true,
          isConnecting: false,
          error: null,
          network: 'testnet',
        })
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Error al conectar wallet',
      }))
    }
  }

  const disconnect = () => {
    try {
      StellarWalletsKit.disconnectWallet()
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
    
    localStorage.removeItem('stellar_address')
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      publicKey: null,
      error: null,
      network: 'testnet',
    })
  }

  const switchNetwork = (network: 'testnet' | 'public') => {
    const networkValue = network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
    StellarWalletsKit.setNetwork(networkValue)
    setState(prev => ({ ...prev, network }))
  }

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, switchNetwork, fetchAddress }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
