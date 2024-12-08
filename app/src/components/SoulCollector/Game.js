import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletContext } from '../../contexts/WalletContext';
import './Game.css';

const Game = () => {
    const { publicKey } = useWallet();
    const { getSOuLBalance } = useWalletContext();
    const [gameState, setGameState] = useState({
        score: 0,
        level: 1,
        environmentalData: [],
        collectibles: [],
        playerPosition: { x: 0, y: 0 },
        isCollecting: false
    });

    const [environmentalMetrics, setEnvironmentalMetrics] = useState({
        airQuality: 0,
        forestDensity: 0,
        waterQuality: 0,
        biodiversity: 0
    });

    useEffect(() => {
        if (publicKey) {
            initializeGame();
        }
    }, [publicKey]);

    const initializeGame = async () => {
        // Initialize game state
        generateEnvironmentalData();
        spawnCollectibles();
        startEnvironmentalMonitoring();
    };

    const generateEnvironmentalData = () => {
        // Simulated environmental data generation
        setEnvironmentalMetrics({
            airQuality: Math.random() * 100,
            forestDensity: Math.random() * 100,
            waterQuality: Math.random() * 100,
            biodiversity: Math.random() * 100
        });
    };

    const spawnCollectibles = () => {
        // Generate collectible items on the map
        const newCollectibles = Array(5).fill(null).map(() => ({
            id: Math.random().toString(),
            type: ['air', 'forest', 'water', 'wildlife'][Math.floor(Math.random() * 4)],
            position: {
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100)
            },
            value: Math.floor(Math.random() * 100) + 50
        }));
        
        setGameState(prev => ({
            ...prev,
            collectibles: newCollectibles
        }));
    };

    const startEnvironmentalMonitoring = () => {
        // Start monitoring environmental metrics
        const interval = setInterval(generateEnvironmentalData, 30000);
        return () => clearInterval(interval);
    };

    const handleCollection = async (collectible) => {
        if (gameState.isCollecting) return;

        setGameState(prev => ({ ...prev, isCollecting: true }));

        try {
            // Simulate data collection process
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update game state
            setGameState(prev => ({
                ...prev,
                score: prev.score + collectible.value,
                collectibles: prev.collectibles.filter(c => c.id !== collectible.id),
                isCollecting: false
            }));

            // If all collectibles are collected, spawn new ones and increase level
            if (gameState.collectibles.length === 1) {
                spawnCollectibles();
                setGameState(prev => ({ ...prev, level: prev.level + 1 }));
            }
        } catch (error) {
            console.error('Collection failed:', error);
            setGameState(prev => ({ ...prev, isCollecting: false }));
        }
    };

    return (
        <div className="game-container">
            <div className="game-hud">
                <div className="game-stats">
                    <h3>Level: {gameState.level}</h3>
                    <h3>Score: {gameState.score}</h3>
                </div>
                
                <div className="environmental-metrics">
                    <h3>Environmental Metrics</h3>
                    <div className="metrics-grid">
                        <div className="metric">
                            <label>Air Quality:</label>
                            <div className="progress-bar">
                                <div 
                                    className="progress" 
                                    style={{ width: `${environmentalMetrics.airQuality}%` }}
                                />
                            </div>
                        </div>
                        <div className="metric">
                            <label>Forest Density:</label>
                            <div className="progress-bar">
                                <div 
                                    className="progress" 
                                    style={{ width: `${environmentalMetrics.forestDensity}%` }}
                                />
                            </div>
                        </div>
                        <div className="metric">
                            <label>Water Quality:</label>
                            <div className="progress-bar">
                                <div 
                                    className="progress" 
                                    style={{ width: `${environmentalMetrics.waterQuality}%` }}
                                />
                            </div>
                        </div>
                        <div className="metric">
                            <label>Biodiversity:</label>
                            <div className="progress-bar">
                                <div 
                                    className="progress" 
                                    style={{ width: `${environmentalMetrics.biodiversity}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="game-world">
                {gameState.collectibles.map(collectible => (
                    <div
                        key={collectible.id}
                        className={`collectible ${collectible.type}`}
                        style={{
                            left: `${collectible.position.x}%`,
                            top: `${collectible.position.y}%`
                        }}
                        onClick={() => handleCollection(collectible)}
                    >
                        <div className="collectible-info">
                            <span>{collectible.type}</span>
                            <span>{collectible.value} points</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Game;
