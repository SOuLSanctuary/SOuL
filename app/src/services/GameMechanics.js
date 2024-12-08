import { PublicKey } from '@solana/web3.js';

export class GameMechanics {
    constructor(connection, programId, gameStateManager) {
        this.connection = connection;
        this.programId = new PublicKey(programId);
        this.gameStateManager = gameStateManager;
        this.questCache = new Map();
        this.achievementCache = new Map();
    }

    // Quest Management
    async getAvailableQuests(playerAddress) {
        try {
            const quests = await this.gameStateManager.getQuests(playerAddress);
            this.questCache.set(playerAddress, quests);
            return quests.filter(quest => quest.status === 'AVAILABLE');
        } catch (error) {
            console.error('Failed to fetch available quests:', error);
            throw error;
        }
    }

    async acceptQuest(playerAddress, questId) {
        try {
            await this.gameStateManager.updateQuestStatus(playerAddress, questId, 'IN_PROGRESS');
            this.refreshQuestCache(playerAddress);
        } catch (error) {
            console.error('Failed to accept quest:', error);
            throw error;
        }
    }

    async completeQuest(playerAddress, questId, proofData) {
        try {
            // Verify quest completion requirements
            const quest = await this.getQuestDetails(questId);
            if (!this.verifyQuestCompletion(quest, proofData)) {
                throw new Error('Quest completion requirements not met');
            }

            // Process rewards
            await this.processQuestRewards(playerAddress, quest);

            // Update quest status
            await this.gameStateManager.updateQuestStatus(playerAddress, questId, 'COMPLETED');
            
            // Check for triggered achievements
            await this.checkQuestAchievements(playerAddress, quest);

            this.refreshQuestCache(playerAddress);
            return true;
        } catch (error) {
            console.error('Failed to complete quest:', error);
            throw error;
        }
    }

    // Achievement System
    async checkQuestAchievements(playerAddress, completedQuest) {
        try {
            const achievements = await this.gameStateManager.getAchievements(playerAddress);
            const triggeredAchievements = achievements.filter(achievement => 
                this.isAchievementTriggered(achievement, completedQuest)
            );

            for (const achievement of triggeredAchievements) {
                await this.unlockAchievement(playerAddress, achievement.id);
            }
        } catch (error) {
            console.error('Failed to check achievements:', error);
            throw error;
        }
    }

    async unlockAchievement(playerAddress, achievementId) {
        try {
            await this.gameStateManager.unlockAchievement(playerAddress, achievementId);
            this.refreshAchievementCache(playerAddress);
        } catch (error) {
            console.error('Failed to unlock achievement:', error);
            throw error;
        }
    }

    // Experience and Leveling
    async calculateExperience(playerAddress, actionType, actionValue) {
        const experienceMultipliers = {
            QUEST_COMPLETION: 100,
            ENVIRONMENTAL_ACTION: 50,
            TEAM_CONTRIBUTION: 25,
            DAILY_ACTIVITY: 10
        };

        const baseExperience = actionValue * (experienceMultipliers[actionType] || 1);
        const bonusMultiplier = await this.calculateBonusMultiplier(playerAddress);
        
        return Math.floor(baseExperience * bonusMultiplier);
    }

    async awardExperience(playerAddress, experience) {
        try {
            const currentLevel = await this.gameStateManager.getPlayerLevel(playerAddress);
            const newExperience = await this.gameStateManager.addExperience(playerAddress, experience);
            
            // Check for level up
            const newLevel = this.calculateLevel(newExperience);
            if (newLevel > currentLevel) {
                await this.handleLevelUp(playerAddress, newLevel);
            }

            return {
                experienceGained: experience,
                totalExperience: newExperience,
                level: newLevel,
                leveledUp: newLevel > currentLevel
            };
        } catch (error) {
            console.error('Failed to award experience:', error);
            throw error;
        }
    }

    // Environmental Impact Tracking
    async trackEnvironmentalAction(playerAddress, actionType, actionData) {
        try {
            const impact = this.calculateEnvironmentalImpact(actionType, actionData);
            await this.gameStateManager.updateEnvironmentalImpact(playerAddress, impact);

            // Award experience for environmental action
            const experience = await this.calculateExperience(
                playerAddress,
                'ENVIRONMENTAL_ACTION',
                impact.totalImpact
            );
            await this.awardExperience(playerAddress, experience);

            // Check for environmental achievements
            await this.checkEnvironmentalAchievements(playerAddress, actionType, impact);

            return impact;
        } catch (error) {
            console.error('Failed to track environmental action:', error);
            throw error;
        }
    }

    // Helper Methods
    calculateLevel(experience) {
        // Level calculation formula: level = floor(1 + sqrt(experience / 100))
        return Math.floor(1 + Math.sqrt(experience / 100));
    }

    async calculateBonusMultiplier(playerAddress) {
        try {
            const [equipment, teamBonus, eventBonus] = await Promise.all([
                this.gameStateManager.getEquippedItems(playerAddress),
                this.gameStateManager.getTeamBonus(playerAddress),
                this.gameStateManager.getActiveEventBonus(playerAddress)
            ]);

            const equipmentMultiplier = equipment.reduce((total, item) => total + (item.expBonus || 0), 1);
            return equipmentMultiplier * (1 + teamBonus) * (1 + eventBonus);
        } catch (error) {
            console.error('Failed to calculate bonus multiplier:', error);
            return 1; // Default multiplier if calculation fails
        }
    }

    async handleLevelUp(playerAddress, newLevel) {
        try {
            // Update player level
            await this.gameStateManager.updatePlayerLevel(playerAddress, newLevel);

            // Award level-up rewards
            const rewards = this.getLevelUpRewards(newLevel);
            await this.processRewards(playerAddress, rewards);

            // Unlock new content
            await this.unlockLevelContent(playerAddress, newLevel);

            return {
                level: newLevel,
                rewards: rewards,
                unlockedContent: await this.getUnlockedContent(newLevel)
            };
        } catch (error) {
            console.error('Failed to handle level up:', error);
            throw error;
        }
    }

    calculateEnvironmentalImpact(actionType, actionData) {
        const impactFactors = {
            TREE_PLANTING: {
                carbonOffset: 22, // kg CO2 per year
                waterSaved: 100, // liters per year
                biodiversityScore: 5
            },
            WASTE_RECYCLING: {
                carbonOffset: 1.5, // kg CO2 per kg
                waterSaved: 5, // liters per kg
                biodiversityScore: 1
            },
            RENEWABLE_ENERGY: {
                carbonOffset: 0.5, // kg CO2 per kWh
                energySaved: 1, // kWh
                biodiversityScore: 0.5
            }
        };

        const factor = impactFactors[actionType];
        if (!factor) return null;

        const quantity = actionData.quantity || 1;
        const impact = {
            carbonOffset: factor.carbonOffset * quantity,
            waterSaved: factor.waterSaved * quantity,
            energySaved: factor.energySaved * quantity,
            biodiversityScore: factor.biodiversityScore * quantity,
            timestamp: Date.now()
        };

        impact.totalImpact = Object.values(impact).reduce((sum, value) => 
            typeof value === 'number' ? sum + value : sum, 0
        );

        return impact;
    }

    // Cache Management
    async refreshQuestCache(playerAddress) {
        const quests = await this.gameStateManager.getQuests(playerAddress);
        this.questCache.set(playerAddress, quests);
    }

    async refreshAchievementCache(playerAddress) {
        const achievements = await this.gameStateManager.getAchievements(playerAddress);
        this.achievementCache.set(playerAddress, achievements);
    }

    // Verification Methods
    verifyQuestCompletion(quest, proofData) {
        switch (quest.verificationType) {
            case 'LOCATION':
                return this.verifyLocation(quest.requirements, proofData);
            case 'PHOTO':
                return this.verifyPhoto(quest.requirements, proofData);
            case 'SENSOR_DATA':
                return this.verifySensorData(quest.requirements, proofData);
            case 'BLOCKCHAIN_PROOF':
                return this.verifyBlockchainProof(quest.requirements, proofData);
            default:
                return false;
        }
    }

    verifyLocation(requirements, proofData) {
        if (!proofData.coordinates) return false;
        
        const distance = this.calculateDistance(
            requirements.coordinates,
            proofData.coordinates
        );
        return distance <= requirements.radius;
    }

    verifyPhoto(requirements, proofData) {
        // Implement photo verification logic
        // This could include AI image recognition, timestamp verification, etc.
        return true; // Placeholder
    }

    verifySensorData(requirements, proofData) {
        if (!proofData.sensorData) return false;

        return Object.entries(requirements.thresholds).every(([key, threshold]) => {
            const value = proofData.sensorData[key];
            return value >= threshold.min && value <= threshold.max;
        });
    }

    verifyBlockchainProof(requirements, proofData) {
        // Implement blockchain-specific verification
        return true; // Placeholder
    }

    // Utility Methods
    calculateDistance(coord1, coord2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = this.toRadians(coord1.latitude);
        const φ2 = this.toRadians(coord2.latitude);
        const Δφ = this.toRadians(coord2.latitude - coord1.latitude);
        const Δλ = this.toRadians(coord2.longitude - coord1.longitude);

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
}

export default GameMechanics;
