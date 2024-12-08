import { ErrorHandler } from './ErrorHandler';

class QuestManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.activeQuests = new Map();
        this.questTemplates = this.initializeQuestTemplates();
    }

    initializeQuestTemplates() {
        return {
            FOREST_CONSERVATION: {
                type: 'CONSERVATION',
                title: 'Forest Guardian',
                description: 'Monitor and protect forest areas',
                objectives: [
                    { type: 'COLLECT_DATA', target: 'TREE_HEALTH', count: 10 },
                    { type: 'IDENTIFY_SPECIES', count: 5 },
                    { type: 'REPORT_THREATS', count: 3 }
                ],
                rewards: {
                    experience: 1000,
                    tokens: 50,
                    items: ['SEED_BUNDLE', 'ECO_SCANNER'],
                    title: 'Forest Guardian'
                },
                impactMetrics: {
                    carbonOffset: 100,
                    biodiversityScore: 50
                }
            },
            WATER_QUALITY: {
                type: 'MONITORING',
                title: 'Water Sentinel',
                description: 'Monitor water quality and report pollution',
                objectives: [
                    { type: 'TEST_WATER_QUALITY', count: 5 },
                    { type: 'IDENTIFY_POLLUTANTS', count: 3 },
                    { type: 'CLEAN_WATERWAY', count: 1 }
                ],
                rewards: {
                    experience: 800,
                    tokens: 40,
                    items: ['WATER_PURIFIER', 'QUALITY_SENSOR'],
                    title: 'Water Sentinel'
                },
                impactMetrics: {
                    waterQuality: 30,
                    pollutionReduction: 20
                }
            },
            WILDLIFE_PROTECTION: {
                type: 'CONSERVATION',
                title: 'Wildlife Protector',
                description: 'Document and protect local wildlife',
                objectives: [
                    { type: 'PHOTO_WILDLIFE', count: 8 },
                    { type: 'TRACK_MOVEMENT', count: 4 },
                    { type: 'CREATE_HABITAT', count: 1 }
                ],
                rewards: {
                    experience: 1200,
                    tokens: 60,
                    items: ['WILDLIFE_CAMERA', 'TRACKING_DEVICE'],
                    title: 'Wildlife Protector'
                },
                impactMetrics: {
                    biodiversityScore: 70,
                    habitatPreservation: 40
                }
            }
        };
    }

    async generateDailyQuests(playerLocation) {
        try {
            const locationTypes = await this.gameStateManager.determineLocationTypes(playerLocation);
            const quests = [];

            for (const locationType of locationTypes) {
                const availableQuests = this.filterQuestsByLocation(locationType);
                const selectedQuest = this.selectAppropriateQuest(availableQuests);
                if (selectedQuest) {
                    quests.push(this.customizeQuest(selectedQuest, playerLocation));
                }
            }

            return quests;
        } catch (error) {
            console.error('Failed to generate daily quests:', error);
            return this.getFallbackQuests();
        }
    }

    filterQuestsByLocation(locationType) {
        const questPool = [];
        for (const [id, quest] of Object.entries(this.questTemplates)) {
            if (this.isQuestSuitableForLocation(quest, locationType)) {
                questPool.push({ id, ...quest });
            }
        }
        return questPool;
    }

    isQuestSuitableForLocation(quest, locationType) {
        const locationQuestMapping = {
            FOREST: ['FOREST_CONSERVATION', 'WILDLIFE_PROTECTION'],
            WATER: ['WATER_QUALITY', 'WILDLIFE_PROTECTION'],
            URBAN: ['AIR_QUALITY', 'WASTE_MANAGEMENT'],
            PARK: ['FOREST_CONSERVATION', 'WILDLIFE_PROTECTION', 'COMMUNITY_GARDEN']
        };

        return locationQuestMapping[locationType]?.includes(quest.type) || false;
    }

    selectAppropriateQuest(availableQuests) {
        if (!availableQuests.length) return null;

        // Sort by player's level and previous completion rate
        const sortedQuests = availableQuests.sort((a, b) => {
            const aScore = this.calculateQuestSuitabilityScore(a);
            const bScore = this.calculateQuestSuitabilityScore(b);
            return bScore - aScore;
        });

        return sortedQuests[0];
    }

    calculateQuestSuitabilityScore(quest) {
        const playerLevel = this.gameStateManager.gameState?.level || 1;
        const completionHistory = this.getQuestCompletionHistory(quest.id);
        
        let score = 0;
        
        // Level appropriateness
        score += Math.max(0, 100 - Math.abs(playerLevel - quest.recommendedLevel) * 10);
        
        // Completion rate
        if (completionHistory) {
            score += completionHistory.successRate * 50;
            score += (1 - completionHistory.abandonRate) * 30;
        }
        
        // Time sensitivity
        if (quest.timeSensitive && this.isOptimalTimeForQuest(quest)) {
            score += 20;
        }
        
        return score;
    }

    customizeQuest(baseQuest, playerLocation) {
        const customizedQuest = { ...baseQuest };
        
        // Adjust difficulty based on player level
        const playerLevel = this.gameStateManager.gameState?.level || 1;
        customizedQuest.objectives = this.adjustObjectivesDifficulty(
            baseQuest.objectives,
            playerLevel
        );

        // Add location-specific elements
        customizedQuest.location = {
            center: playerLocation,
            radius: this.calculateQuestRadius(baseQuest.type)
        };

        // Add time constraints
        customizedQuest.timeLimit = this.calculateTimeLimit(baseQuest.type);
        customizedQuest.optimalHours = this.calculateOptimalHours(baseQuest.type);

        return customizedQuest;
    }

    adjustObjectivesDifficulty(objectives, playerLevel) {
        return objectives.map(objective => ({
            ...objective,
            count: Math.ceil(objective.count * (1 + (playerLevel - 1) * 0.1)),
            difficulty: this.calculateObjectiveDifficulty(objective, playerLevel)
        }));
    }

    calculateQuestRadius(questType) {
        const baseRadius = 1000; // meters
        const radiusMultipliers = {
            CONSERVATION: 2,
            MONITORING: 1.5,
            COMMUNITY: 1,
            SPECIAL: 3
        };
        return baseRadius * (radiusMultipliers[questType] || 1);
    }

    calculateTimeLimit(questType) {
        const baseLimits = {
            CONSERVATION: 24 * 60 * 60, // 24 hours
            MONITORING: 12 * 60 * 60,   // 12 hours
            COMMUNITY: 6 * 60 * 60,     // 6 hours
            SPECIAL: 48 * 60 * 60       // 48 hours
        };
        return baseLimits[questType] || 24 * 60 * 60;
    }

    async startQuest(questId) {
        try {
            const quest = await ErrorHandler.retryOperation(async () => {
                const questData = await this.fetchQuestData(questId);
                if (!this.canStartQuest(questData)) {
                    throw new Error('Cannot start quest: requirements not met');
                }
                return this.initializeQuestProgress(questData);
            });

            this.activeQuests.set(questId, quest);
            await this.gameStateManager.saveToCache();
            return quest;
        } catch (error) {
            console.error('Failed to start quest:', error);
            throw error;
        }
    }

    async updateQuestProgress(questId, action, data) {
        try {
            const quest = this.activeQuests.get(questId);
            if (!quest) throw new Error('Quest not found');

            const updatedQuest = await ErrorHandler.retryOperation(async () => {
                const progress = this.calculateProgress(quest, action, data);
                const verified = await this.verifyProgress(progress, data);
                if (verified) {
                    return this.updateQuestState(quest, progress);
                }
                throw new Error('Progress verification failed');
            });

            this.activeQuests.set(questId, updatedQuest);
            
            if (this.isQuestComplete(updatedQuest)) {
                await this.completeQuest(questId);
            }

            return updatedQuest;
        } catch (error) {
            console.error('Failed to update quest progress:', error);
            throw error;
        }
    }

    async completeQuest(questId) {
        try {
            const quest = this.activeQuests.get(questId);
            if (!quest) throw new Error('Quest not found');

            await ErrorHandler.retryOperation(async () => {
                await this.verifyCompletion(quest);
                await this.distributeRewards(quest);
                await this.updateEnvironmentalImpact(quest);
                this.activeQuests.delete(questId);
            });

            await this.gameStateManager.saveToCache();
            return true;
        } catch (error) {
            console.error('Failed to complete quest:', error);
            throw error;
        }
    }

    async verifyProgress(progress, data) {
        // Implement verification logic here
        // This could include checking GPS data, timestamps, photo verification, etc.
        return true; // Placeholder
    }

    async updateEnvironmentalImpact(quest) {
        const impact = this.calculateEnvironmentalImpact(quest);
        await this.gameStateManager.updateImpactMetrics(impact);
    }

    calculateEnvironmentalImpact(quest) {
        // Calculate actual environmental impact based on quest completion
        return {
            carbonOffset: quest.impactMetrics.carbonOffset,
            waterQuality: quest.impactMetrics.waterQuality || 0,
            biodiversityScore: quest.impactMetrics.biodiversityScore || 0,
            pollutionReduction: quest.impactMetrics.pollutionReduction || 0,
            timestamp: Date.now()
        };
    }
}

export default QuestManager;
