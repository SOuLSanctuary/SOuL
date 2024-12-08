import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Chart } from 'react-chartjs-2';
import './ImpactDashboard.css';

const ImpactDashboard = () => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [impactData, setImpactData] = useState(null);
    const [verifierStatus, setVerifierStatus] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (publicKey) {
            fetchImpactData();
            checkVerifierStatus();
        }
    }, [publicKey]);

    const fetchImpactData = async () => {
        try {
            setLoading(true);
            // Fetch impact metrics from the program
            // This is a placeholder for the actual implementation
            const data = {
                totalForestArea: 1000000, // m²
                carbonOffset: 50000, // kg
                waterSaved: 1000000, // liters
                biodiversityScore: 850,
                energySaved: 25000, // kWh
                wasteRecycled: 15000, // kg
                impactScore: 75000,
                recentReports: [
                    {
                        id: '1',
                        timestamp: Date.now(),
                        location: { latitude: 40.7128, longitude: -74.0060 },
                        status: 'Verified',
                        score: 1500
                    },
                    // Add more reports...
                ]
            };
            setImpactData(data);
        } catch (error) {
            console.error('Error fetching impact data:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkVerifierStatus = async () => {
        try {
            // Check if the connected wallet is a registered verifier
            // This is a placeholder for the actual implementation
            const status = {
                isVerifier: true,
                reputationScore: 750,
                verifiedReports: 25,
                stakeAmount: 5000
            };
            setVerifierStatus(status);
        } catch (error) {
            console.error('Error checking verifier status:', error);
        }
    };

    const renderMetricsChart = () => {
        if (!impactData) return null;

        const data = {
            labels: ['Forest Area', 'Carbon Offset', 'Water Saved', 'Energy Saved', 'Waste Recycled'],
            datasets: [{
                label: 'Environmental Impact Metrics',
                data: [
                    impactData.totalForestArea / 10000, // Convert to hectares
                    impactData.carbonOffset / 1000, // Convert to tons
                    impactData.waterSaved / 1000, // Convert to m³
                    impactData.energySaved,
                    impactData.wasteRecycled
                ],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.6)',
                    'rgba(52, 152, 219, 0.6)',
                    'rgba(155, 89, 182, 0.6)',
                    'rgba(241, 196, 15, 0.6)',
                    'rgba(230, 126, 34, 0.6)'
                ]
            }]
        };

        return (
            <div className="metrics-chart">
                <Chart type="radar" data={data} />
            </div>
        );
    };

    return (
        <div className="impact-dashboard">
            <header className="dashboard-header">
                <h1>Environmental Impact Dashboard</h1>
                {verifierStatus?.isVerifier && (
                    <div className="verifier-badge">
                        Verified Impact Assessor
                        <div className="reputation-score">
                            Score: {verifierStatus.reputationScore}
                        </div>
                    </div>
                )}
            </header>

            {loading ? (
                <div className="loading">Loading impact data...</div>
            ) : (
                <>
                    <div className="metrics-overview">
                        <div className="metric-card">
                            <h3>Protected Forest Area</h3>
                            <p>{(impactData?.totalForestArea / 10000).toFixed(2)} hectares</p>
                        </div>
                        <div className="metric-card">
                            <h3>Carbon Offset</h3>
                            <p>{(impactData?.carbonOffset / 1000).toFixed(2)} tons</p>
                        </div>
                        <div className="metric-card">
                            <h3>Water Conservation</h3>
                            <p>{(impactData?.waterSaved / 1000).toFixed(2)} m³</p>
                        </div>
                        <div className="metric-card">
                            <h3>Impact Score</h3>
                            <p>{impactData?.impactScore.toLocaleString()}</p>
                        </div>
                    </div>

                    {renderMetricsChart()}

                    <div className="recent-reports">
                        <h2>Recent Impact Reports</h2>
                        <div className="reports-grid">
                            {impactData?.recentReports.map(report => (
                                <div 
                                    key={report.id} 
                                    className={`report-card ${report.status.toLowerCase()}`}
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <div className="report-header">
                                        <span className="report-id">#{report.id}</span>
                                        <span className="report-status">{report.status}</span>
                                    </div>
                                    <div className="report-details">
                                        <p>Score: {report.score}</p>
                                        <p>Date: {new Date(report.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {verifierStatus?.isVerifier && (
                        <div className="verifier-actions">
                            <h2>Verifier Actions</h2>
                            <button onClick={() => {/* Implement verify action */}}>
                                Verify New Reports
                            </button>
                            <button onClick={() => {/* Implement dispute action */}}>
                                Review Disputes
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ImpactDashboard;
