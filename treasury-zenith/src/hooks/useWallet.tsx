/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useToast } from './use-toast';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  network: string | null;
  isConnecting: boolean;
}

export const useWallet = () => {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>(() => {
    const savedState = localStorage.getItem('walletState');
    return savedState ? JSON.parse(savedState) : {
      isConnected: false,
      address: null,
      balance: null,
      network: null,
      isConnecting: false,
    };
  });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }));
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();
        
        setWalletState({
          isConnected: true,
          address,
          balance: ethers.formatEther(balance),
          network: network.name,
          isConnecting: false,
        });

        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('walletState');
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      network: null,
      isConnecting: false,
    });
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [toast]);

  const formatAddress = useCallback((address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletState.address) {
          connectWallet();
        }
      };

      const handleChainChanged = async () => {
        if (window.ethereum) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            setWalletState(prev => ({
              ...prev,
              network: network.name
            }));
          } catch (error) {
            console.error('Error updating chain:', error);
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletState.address, connectWallet, disconnectWallet]);

  // Persist wallet state
  useEffect(() => {
    localStorage.setItem('walletState', JSON.stringify(walletState));
  }, [walletState]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const address = accounts[0].address;
            const balance = await provider.getBalance(address);
            const network = await provider.getNetwork();
            
            setWalletState({
              isConnected: true,
              address,
              balance: ethers.formatEther(balance),
              network: network.name,
              isConnecting: false,
            });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    formatAddress,
  };
};

// Add MetaMask types to window
declare global {
  interface Window {
    ethereum?: any;
  }
}