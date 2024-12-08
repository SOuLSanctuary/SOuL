import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Chart } from 'react-chartjs-2';
import './LSTManager.css';

const LST_TYPES = {
    AIR: 'airSOuL',
    FOREST: 'forestSOuL',
    LAND: 'landSOuL',
    WATER: 'waterSOuL',
    OCEAN: 'oceanSOuL',
    WILDLIFE: 'wildlifeSOuL',
    ENERGY: 'energySOuL',
    LIFE: 'lifeSOuL',
    SANCTUARY: 'sanctuarySOuL',
    PES: 'pesSOuL',
    PPP: 'pppSOuL',
    SSS: 'sssSOuL'
};

const LSTManager = () => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [selectedLST, setSelectedLST] = useState('FOREST');
    const [stakeAmount, setStakeAmount] = useState('');
    const [unstakeAmount, setUnstakeAmount] = useState('');
    const [lstBalances, setLstBalances] = useState({});
    const [stakingStats, setStakingStats] = useState({
        totalStaked: 0,
        rewardsEarned: 0,
        apy: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (publicKey) {
            fetchLSTBalances();
            fetchStakingStats();
        }
    }, [publicKey, selectedLST]);

    const fetchLSTBalances = async () => {
        try {
            // Placeholder for actual balance fetching
            const balances = {};
            Object.keys(LST_TYPES).forEach(type => {
                balances[type] = Math.floor(Math.random() * 1000);
            });
            setLstBalances(balances);
        } catch (error) {
            console.error('Error fetching LST balances:', error);
        }
    };

    const fetchStakingStats = async () => {
        try {
            // Placeholder for actual staking stats
            setStakingStats({
                totalStaked: Math.floor(Math.random() * 10000),
                rewardsEarned: Math.floor(Math.random() * 1000),
                apy: 12 + Math.floor(Math.random() * 8), // 12-20% APY
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching staking stats:', error);
            setLoading(false);
        }
    };

    const handleStake = async (e) => {
        e.preventDefault();
        if (!stakeAmount || isNaN(stakeAmount)) return;

        try {
            setLoading(true);
            // Implement staking logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
            
            // Refresh balances and stats
            await fetchLSTBalances();
            await fetchStakingStats();
            
            setStakeAmount('');
        } catch (error) {
            console.error('Staking failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnstake = async (e) => {
        e.preventDefault();
        if (!unstakeAmount || isNaN(unstakeAmount)) return;

        try {
            setLoading(true);
            // Implement unstaking logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
            
            // Refresh balances and stats
            await fetchLSTBalances();
            await fetchStakingStats();
            
            setUnstakeAmount('');
        } catch (error) {
            console.error('Unstaking failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStakingChart = () => {
        const data = {
            labels: Object.values(LST_TYPES),
            datasets: [{
                label: 'Staked Amount',
                data: Object.keys(LST_TYPES).map(type => lstBalances[type] || 0),
                backgroundColor: [
                    '#87CEEB', // Air
                    '#2ECC71', // Forest
                    '#795548', // Land
                    '#3498DB', // Water
                    '#34495E', // Ocean
                    '#F1C40F', // Wildlife
                    '#E67E22', // Energy
                    '#E74C3C', // Life
                    '#9B59B6', // Sanctuary
                    '#1ABC9C', // PES
                    '#D35400', // PPP
                    '#2C3E50', // SSS
                ],
            }],
        };

        return (
            <div className="staking-chart">
                <Chart type="doughnut" data={data} />
            </div>
        );
    };

    return (
        <div className="lst-manager">
            <header className="lst-header">
                <h1>LST Management</h1>
                <div className="stats-overview">
                    <div className="stat">
                        <label>Total Staked</label>
                        <p>{stakingStats.totalStaked.toLocaleString()} SOuL</p>
                    </div>
                    <div className="stat">
                        <label>Rewards Earned</label>
                        <p>{stakingStats.rewardsEarned.toLocaleString()} SOuL</p>
                    </div>
                    <div className="stat">
                        <label>Current APY</label>
                        <p>{stakingStats.apy}%</p>
                    </div>
                </div>
            </header>

            <div className="lst-content">
                <div className="staking-actions">
                    <div className="lst-selector">
                        <h3>Select LST Type</h3>
                        <select 
                            value={selectedLST}
                            onChange={(e) => setSelectedLST(e.target.value)}
                        >
                            {Object.entries(LST_TYPES).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="staking-forms">
                        <form onSubmit={handleStake} className="stake-form">
                            <h3>Stake SOuL</h3>
                            <input
                                type="number"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                placeholder="Enter amount to stake"
                                min="0"
                                step="0.000000001"
                            />
                            <button type="submit" disabled={loading}>
                                Stake
                            </button>
                        </form>

                        <form onSubmit={handleUnstake} className="unstake-form">
                            <h3>Unstake {LST_TYPES[selectedLST]}</h3>
                            <input
                                type="number"
                                value={unstakeAmount}
                                onChange={(e) => setUnstakeAmount(e.target.value)}
                                placeholder="Enter amount to unstake"
                                min="0"
                                step="0.000000001"
                            />
                            <button type="submit" disabled={loading}>
                                Unstake
                            </button>
                        </form>
                    </div>
                </div>

                <div className="staking-overview">
                    <h3>Staking Distribution</h3>
                    {renderStakingChart()}
                </div>

                <div className="lst-balances">
                    <h3>Your LST Balances</h3>
                    <div className="balances-grid">
                        {Object.entries(LST_TYPES).map(([key, value]) => (
                            <div key={key} className="balance-card">
                                <h4>{value}</h4>
                                <p>{lstBalances[key]?.toLocaleString() || 0}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LSTManager;
