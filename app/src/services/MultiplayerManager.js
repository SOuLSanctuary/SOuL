import { ErrorHandler } from './ErrorHandler';
import { Connection, PublicKey } from '@solana/web3.js';

class MultiplayerManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.activePlayers = new Map();
        this.teams = new Map();
        this.challenges = new Map();
        this.eventEmitter = new EventEmitter();
        this.maxTeamSize = 5;
        this.maxChallengeParticipants = 10;
    }

    // Player Discovery and Interaction
    async discoverNearbyPlayers(location, radius = 1000) {
        try {
            return await ErrorHandler.retryOperation(async () => {
                const players = await this.fetchNearbyPlayers(location, radius);
                return this.filterActivePlayers(players);
            });
        } catch (error) {
            console.error('Failed to discover players:', error);
            return [];
        }
    }

    async fetchNearbyPlayers(location, radius) {
        // Query blockchain for player locations
        const players = await this.gameStateManager.connection.getProgramAccounts(
            new PublicKey(process.env.REACT_APP_GAME_PROGRAM_ID),
            {
                filters: [
                    { dataSize: 128 }, // Expected size of player data
                    { memcmp: { offset: 0, bytes: 'player' } }
                ]
            }
        );

        return players.filter(player => 
            this.isWithinRadius(location, player.location, radius)
        );
    }

    isWithinRadius(point1, point2, radius) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = point1.lat * Math.PI/180;
        const φ2 = point2.lat * Math.PI/180;
        const Δφ = (point2.lat - point1.lat) * Math.PI/180;
        const Δλ = (point2.lng - point1.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return (R * c) <= radius;
    }

    // Team Management
    async createTeam(teamData) {
        try {
            const team = await ErrorHandler.retryOperation(async () => {
                const teamId = await this.generateTeamId();
                const newTeam = {
                    id: teamId,
                    name: teamData.name,
                    leader: teamData.leader,
                    members: [teamData.leader],
                    created: Date.now(),
                    stats: {
                        totalImpact: 0,
                        questsCompleted: 0,
                        achievements: []
                    }
                };

                await this.saveTeamToBlockchain(newTeam);
                this.teams.set(teamId, newTeam);
                return newTeam;
            });

            this.eventEmitter.emit('teamCreated', team);
            return team;
        } catch (error) {
            console.error('Failed to create team:', error);
            throw error;
        }
    }

    async joinTeam(teamId, playerId) {
        const team = this.teams.get(teamId);
        if (!team) throw new Error('Team not found');
        if (team.members.length >= this.maxTeamSize) {
            throw new Error('Team is full');
        }

        try {
            await ErrorHandler.retryOperation(async () => {
                team.members.push(playerId);
                await this.saveTeamToBlockchain(team);
                this.teams.set(teamId, team);
            });

            this.eventEmitter.emit('playerJoinedTeam', { teamId, playerId });
            return team;
        } catch (error) {
            console.error('Failed to join team:', error);
            throw error;
        }
    }

    // Challenges
    async createChallenge(challengeData) {
        try {
            const challenge = await ErrorHandler.retryOperation(async () => {
                const challengeId = await this.generateChallengeId();
                const newChallenge = {
                    id: challengeId,
                    type: challengeData.type,
                    creator: challengeData.creator,
                    participants: [],
                    startTime: challengeData.startTime,
                    endTime: challengeData.endTime,
                    objectives: challengeData.objectives,
                    rewards: challengeData.rewards,
                    status: 'PENDING'
                };

                await this.saveChallengeToBlockchain(newChallenge);
                this.challenges.set(challengeId, newChallenge);
                return newChallenge;
            });

            this.eventEmitter.emit('challengeCreated', challenge);
            return challenge;
        } catch (error) {
            console.error('Failed to create challenge:', error);
            throw error;
        }
    }

    async joinChallenge(challengeId, playerId) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge) throw new Error('Challenge not found');
        if (challenge.participants.length >= this.maxChallengeParticipants) {
            throw new Error('Challenge is full');
        }

        try {
            await ErrorHandler.retryOperation(async () => {
                challenge.participants.push(playerId);
                await this.saveChallengeToBlockchain(challenge);
                this.challenges.set(challengeId, challenge);
            });

            this.eventEmitter.emit('playerJoinedChallenge', { challengeId, playerId });
            return challenge;
        } catch (error) {
            console.error('Failed to join challenge:', error);
            throw error;
        }
    }

    // Real-time Updates
    subscribeToPlayerUpdates(playerId, callback) {
        return this.eventEmitter.on(`playerUpdate:${playerId}`, callback);
    }

    subscribeToTeamUpdates(teamId, callback) {
        return this.eventEmitter.on(`teamUpdate:${teamId}`, callback);
    }

    subscribeToChallengeUpdates(challengeId, callback) {
        return this.eventEmitter.on(`challengeUpdate:${challengeId}`, callback);
    }

    // Collaborative Actions
    async initiateCollaborativeAction(actionData) {
        try {
            return await ErrorHandler.retryOperation(async () => {
                const action = await this.createCollaborativeAction(actionData);
                await this.notifyParticipants(action);
                return action;
            });
        } catch (error) {
            console.error('Failed to initiate collaborative action:', error);
            throw error;
        }
    }

    async participateInAction(actionId, playerId) {
        try {
            return await ErrorHandler.retryOperation(async () => {
                const action = await this.getCollaborativeAction(actionId);
                await this.validateParticipation(action, playerId);
                return this.updateActionProgress(action, playerId);
            });
        } catch (error) {
            console.error('Failed to participate in action:', error);
            throw error;
        }
    }

    // Trading System
    async initiateTradeOffer(tradeData) {
        try {
            return await ErrorHandler.retryOperation(async () => {
                const trade = await this.createTradeOffer(tradeData);
                await this.notifyTradeParticipant(trade);
                return trade;
            });
        } catch (error) {
            console.error('Failed to initiate trade:', error);
            throw error;
        }
    }

    async respondToTradeOffer(tradeId, response) {
        try {
            return await ErrorHandler.retryOperation(async () => {
                const trade = await this.getTradeOffer(tradeId);
                if (response === 'ACCEPT') {
                    return this.executeTrade(trade);
                } else {
                    return this.cancelTrade(trade);
                }
            });
        } catch (error) {
            console.error('Failed to respond to trade:', error);
            throw error;
        }
    }

    // Utility Methods
    async generateTeamId() {
        return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async generateChallengeId() {
        return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async saveTeamToBlockchain(team) {
        // Implement blockchain save logic
    }

    async saveChallengeToBlockchain(challenge) {
        // Implement blockchain save logic
    }

    // Event Emitter class
    class EventEmitter {
        constructor() {
            this.events = {};
        }

        on(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(callback);
            return () => this.off(event, callback);
        }

        off(event, callback) {
            if (!this.events[event]) return;
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }

        emit(event, data) {
            if (!this.events[event]) return;
            this.events[event].forEach(callback => callback(data));
        }
    }
}

export default MultiplayerManager;
