import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../services/WebSocketIntegration';
import Inventory from './Inventory';
import Profile from './Profile';
import Team from './Team';

const Game = () => {
    const ws = useWebSocket();
    const [gameState, setGameState] = useState({
        inventory: [],
        profile: {},
        team: null,
        environmentalImpact: {}
    });

    // Handle game actions
    const handleGameAction = async (action) => {
        try {
            await ws.performGameAction(action);
        } catch (error) {
            console.error('Game action failed:', error);
            // Handle error in UI
        }
    };

    // Handle environmental actions
    const handleEnvironmentalAction = async (action) => {
        try {
            await ws.trackEnvironmentalAction(action);
        } catch (error) {
            console.error('Environmental action failed:', error);
            // Handle error in UI
        }
    };

    // Handle team actions
    const handleTeamAction = async (action) => {
        try {
            await ws.performTeamAction(action);
        } catch (error) {
            console.error('Team action failed:', error);
            // Handle error in UI
        }
    };

    return (
        <div className="game-container">
            <div className="game-header">
                <h1>SOuL Sanctuary</h1>
                <div className="environmental-stats">
                    <h3>Environmental Impact</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span>Carbon Offset:</span>
                            <span>{gameState.environmentalImpact.carbonOffset || 0} kg</span>
                        </div>
                        <div className="stat-item">
                            <span>Trees Planted:</span>
                            <span>{gameState.environmentalImpact.treesPlanted || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span>Water Saved:</span>
                            <span>{gameState.environmentalImpact.waterSaved || 0} L</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="game-content">
                <div className="left-panel">
                    <Profile 
                        profile={gameState.profile}
                        onAction={handleGameAction}
                    />
                    <Team 
                        team={gameState.team}
                        onTeamAction={handleTeamAction}
                    />
                </div>

                <div className="main-panel">
                    <Inventory 
                        items={gameState.inventory}
                        onItemUse={handleGameAction}
                        onEnvironmentalAction={handleEnvironmentalAction}
                    />
                </div>
            </div>

            <div className="game-footer">
                <div className="action-buttons">
                    <button 
                        onClick={() => handleEnvironmentalAction({ type: 'VERIFY_LOCATION' })}
                        className="verify-btn"
                    >
                        Verify Location
                    </button>
                    <button 
                        onClick={() => handleEnvironmentalAction({ type: 'SUBMIT_EVIDENCE' })}
                        className="submit-btn"
                    >
                        Submit Evidence
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Game;
