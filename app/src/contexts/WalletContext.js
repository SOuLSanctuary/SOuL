import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({
    SOL: 0,
    SOuL: 0
  });

  // Initialize Solana connection
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Initialize token addresses only when needed to avoid PublicKey errors
  const getTokenMints = () => {
    try {
      return {
        SOuL: new PublicKey(process.env.REACT_APP_SOUL_TOKEN_MINT || 'BLwTnYKqf7u4qjgZrrsKeNs2EzWkMLqVCu6j8iHyrNA3') // Default to a valid devnet address
      };
    } catch (error) {
      console.error('Error initializing token mints:', error);
      return {};
    }
  };

  const connectWallet = async () => {
    try {
      if (window?.solana?.isPhantom) {
        const response = await window.solana.connect();
        const pubKey = new PublicKey(response.publicKey.toString());
        setPublicKey(pubKey);
        setWallet(window.solana);
        setConnected(true);
        await fetchBalances(pubKey);
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
    }
    setPublicKey(null);
    setWallet(null);
    setConnected(false);
    setTokenBalances({
      SOL: 0,
      SOuL: 0
    });
  };

  const fetchBalances = async (pubKey) => {
    if (!pubKey) return;

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(pubKey);
      const balances = {
        SOL: solBalance / 1e9, // Convert lamports to SOL
        SOuL: 0
      };

      // Fetch token balances
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          pubKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const mints = getTokenMints();
        
        tokenAccounts.value.forEach(({ account }) => {
          const tokenMint = account.data.parsed.info.mint;
          const amount = account.data.parsed.info.tokenAmount.uiAmount;
          
          if (mints.SOuL && tokenMint === mints.SOuL.toString()) {
            balances.SOuL = amount;
          }
        });
      } catch (error) {
        console.error('Error fetching token balances:', error);
      }

      setTokenBalances(balances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalances(publicKey);
      const intervalId = setInterval(() => {
        fetchBalances(publicKey);
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [publicKey]);

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window?.solana?.isPhantom && window.solana.isConnected) {
        try {
          const pubKey = new PublicKey(window.solana.publicKey.toString());
          setPublicKey(pubKey);
          setWallet(window.solana);
          setConnected(true);
          await fetchBalances(pubKey);
        } catch (error) {
          console.error('Error auto-connecting:', error);
        }
      }
    };

    autoConnect();
  }, []);

  return (
    <WalletContext.Provider value={{
      connected,
      publicKey,
      wallet,
      connection,
      tokenBalances,
      connect: connectWallet,
      disconnect: disconnectWallet,
      TOKEN_MINTS: getTokenMints()
    }}>
      {children}
    </WalletContext.Provider>
  );
}
