import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { TOKENS } from '../config/tokens';

const TokenStaking = () => {
    const { stakeTokens, getSOuLBalance, claimRewards } = useWalletContext();
    const [stakeAmount, setStakeAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('SOUL');
    const [availableBalance, setAvailableBalance] = useState(0);
    const [status, setStatus] = useState('');
    const [rewards, setRewards] = useState(0);

    useEffect(() => {
        const loadBalance = async () => {
            const balance = await getSOuLBalance();
            setAvailableBalance(balance);
        };

        loadBalance();
    }, [getSOuLBalance]);

    const handleStake = async (e) => {
        e.preventDefault();
        setStatus('Processing stake...');

        try {
            const tokenConfig = selectedToken === 'SOUL' 
                ? TOKENS.SOUL 
                : TOKENS.LST[selectedToken];

            await stakeTokens(parseFloat(stakeAmount), tokenConfig.mint);
            setStatus('Staking successful!');
            
            // Reset form and refresh balance
            setStakeAmount('');
            const newBalance = await getSOuLBalance();
            setAvailableBalance(newBalance);
        } catch (error) {
            console.error('Staking failed:', error);
            setStatus(`Staking failed: ${error.message}`);
        }
    };

    const handleClaimRewards = async () => {
        setStatus('Claiming rewards...');
        try {
            await claimRewards();
            setStatus('Rewards claimed successfully!');
            // Refresh rewards
            // Implementation for fetching updated rewards
        } catch (error) {
            console.error('Claiming rewards failed:', error);
            setStatus(`Claiming rewards failed: ${error.message}`);
        }
    };

    return (
        <div className="token-staking">
            <h3>Stake Tokens</h3>
            
            <div className="staking-info">
                <p>Available Balance: {availableBalance} SOuL</p>
                <p>Current Rewards: {rewards} SOuL</p>
            </div>

            <form onSubmit={handleStake}>
                <div className="form-group">
                    <label>Token to Stake:</label>
                    <select 
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                    >
                        <option value="SOUL">SOuL</option>
                        {Object.entries(TOKENS.LST).map(([key, token]) => (
                            <option key={key} value={key}>
                                {token.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Amount to Stake:</label>
                    <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="Enter amount to stake"
                        min="0"
                        max={availableBalance}
                        step="0.000000001"
                        required
                    />
                </div>

                <button type="submit">Stake Tokens</button>
                <button 
                    type="button" 
                    onClick={handleClaimRewards}
                    disabled={rewards <= 0}
                >
                    Claim Rewards
                </button>

                {status && <p className="status-message">{status}</p>}
            </form>
        </div>
    );
};

export default TokenStaking;
