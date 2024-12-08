import React, { useEffect, useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TOKENS } from '../config/tokens';

const WalletManager = () => {
    const { publicKey } = useWallet();
    const { getSOuLBalance, getLSTBalances } = useWalletContext();
    const [soulBalance, setSoulBalance] = useState(0);
    const [lstBalances, setLstBalances] = useState({});

    useEffect(() => {
        const loadBalances = async () => {
            if (publicKey) {
                const soul = await getSOuLBalance();
                const lst = await getLSTBalances();
                setSoulBalance(soul);
                setLstBalances(lst);
            }
        };

        loadBalances();
        // Set up polling for balance updates
        const interval = setInterval(loadBalances, 30000);
        return () => clearInterval(interval);
    }, [publicKey, getSOuLBalance, getLSTBalances]);

    if (!publicKey) {
        return (
            <div className="wallet-connect-container">
                <h2>Connect Your Wallet</h2>
                <p>Connect your Backpack, Phantom, or Solflare wallet to manage your SOuL tokens</p>
                <WalletMultiButton />
            </div>
        );
    }

    return (
        <div className="wallet-manager">
            <div className="wallet-info">
                <h3>Wallet Address</h3>
                <p>{publicKey.toString()}</p>
            </div>
            
            <div className="token-balances">
                <div className="balance-card main-token">
                    <h3>SOuL Balance</h3>
                    <p>{soulBalance} SOuL</p>
                </div>
                
                <div className="lst-balances">
                    <h3>LST Balances</h3>
                    {Object.entries(TOKENS.LST).map(([key, token]) => (
                        <div key={key} className="balance-card lst">
                            <h4>{token.name}</h4>
                            <p>{lstBalances[key] || 0} {token.symbol}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WalletManager;
