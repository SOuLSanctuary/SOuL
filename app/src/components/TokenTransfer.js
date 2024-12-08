import React, { useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { PublicKey } from '@solana/web3.js';
import { TOKENS } from '../config/tokens';

const TokenTransfer = () => {
    const { transferTokens } = useWalletContext();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('SOUL');
    const [status, setStatus] = useState('');

    const handleTransfer = async (e) => {
        e.preventDefault();
        setStatus('Processing...');

        try {
            // Validate recipient address
            const recipientPubkey = new PublicKey(recipient);
            
            // Get token mint based on selection
            const tokenConfig = selectedToken === 'SOUL' 
                ? TOKENS.SOUL 
                : TOKENS.LST[selectedToken];

            await transferTokens(recipientPubkey, parseFloat(amount), tokenConfig.mint);
            setStatus('Transfer successful!');
            
            // Reset form
            setRecipient('');
            setAmount('');
        } catch (error) {
            console.error('Transfer failed:', error);
            setStatus(`Transfer failed: ${error.message}`);
        }
    };

    return (
        <div className="token-transfer">
            <h3>Transfer Tokens</h3>
            <form onSubmit={handleTransfer}>
                <div className="form-group">
                    <label>Token:</label>
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
                    <label>Recipient Address:</label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Enter recipient's Solana address"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount to transfer"
                        min="0"
                        step="0.000000001"
                        required
                    />
                </div>

                <button type="submit">Transfer</button>
                {status && <p className="status-message">{status}</p>}
            </form>
        </div>
    );
};

export default TokenTransfer;
