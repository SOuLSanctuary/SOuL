import { Connection, PublicKey } from '@solana/web3.js';
import { ErrorHandler } from './ErrorHandler';

class GameStateManager {
    constructor(connection, wallet) {
        this.connection = connection;
        this.wallet = wallet;
        this.gameState = null;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    // Initialize game state with error handling and offline support
    async initializeGameState() {
        try {
            // Try to load from local cache first
            const cachedState = this.loadFromCache();
            if (cachedState) {
                this.gameState = cachedState;
            }

            // Then attempt to sync with blockchain
            await this.syncWithBlockchain();
        } catch (error) {
            console.error('Failed to initialize game state:', error);
            // Fall back to cached state if available
            if (this.gameState) {
                return this.gameState;
            }
            throw error;
        }
    }

    // Save state to local cache
    saveToCache() {
        try {
            localStorage.setItem('gameState', JSON.stringify({
                ...this.gameState,
                lastUpdated: Date.now()
            }));
        } catch (error) {
            console.error('Failed to save to cache:', error);
        }
    }

    // Load state from local cache
    loadFromCache() {
        try {
            const cached = localStorage.getItem('gameState');
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            console.error('Failed to load from cache:', error);
        }
        return null;
    }

    // Sync with blockchain with retry mechanism
    async syncWithBlockchain() {
        return ErrorHandler.retryOperation(async () => {
            if (!this.wallet.publicKey) {
                throw new Error('Wallet not connected');
            }

            // Fetch on-chain game state
            const accountInfo = await this.connection.getAccountInfo(
                new PublicKey(this.wallet.publicKey)
            );

            if (accountInfo) {
                // Update local state with blockchain data
                this.gameState = {
                    ...this.gameState,
                    ...this.deserializeGameState(accountInfo.data)
                };
                this.saveToCache();
            }
        }, this.retryAttempts, this.retryDelay);
    }

    // Handle collectible spawning with location-based rules
    async spawnCollectibles(userLocation) {
        try {
            const collectibles = [];
            const spawnRadius = 0.01; // approximately 1km

            // Generate collectibles based on location type
            const locationTypes = await this.determineLocationTypes(userLocation);
            
            for (const locationType of locationTypes) {
                const spawns = this.generateLocationBasedSpawns(
                    locationType,
                    userLocation,
                    spawnRadius
                );
                collectibles.push(...spawns);
            }

            return collectibles;
        } catch (error) {
            console.error('Failed to spawn collectibles:', error);
            // Return cached collectibles if available
            return this.gameState?.cachedCollectibles || [];
        }
    }

    // Determine location types based on real-world data
    async determineLocationTypes(location) {
        try {
            // Use Maps API to determine environment type
            const types = ['FOREST', 'WATER', 'URBAN', 'PARK'];
            // TODO: Implement actual location type detection
            return types;
        } catch (error) {
            console.error('Failed to determine location types:', error);
            return ['URBAN']; // Default fallback
        }
    }

    // Generate spawns based on location type
    generateLocationBasedSpawns(locationType, center, radius) {
        const spawns = [];
        const spawnCount = this.getSpawnCountForLocationType(locationType);

        for (let i = 0; i < spawnCount; i++) {
            const spawn = this.generateSingleSpawn(locationType, center, radius);
            spawns.push(spawn);
        }

        return spawns;
    }

    // Get spawn count based on location type
    getSpawnCountForLocationType(locationType) {
        const spawnRates = {
            FOREST: { min: 5, max: 10 },
            WATER: { min: 3, max: 7 },
            URBAN: { min: 2, max: 5 },
            PARK: { min: 4, max: 8 }
        };

        const rate = spawnRates[locationType] || spawnRates.URBAN;
        return Math.floor(Math.random() * (rate.max - rate.min + 1)) + rate.min;
    }

    // Generate a single spawn with appropriate attributes
    generateSingleSpawn(locationType, center, radius) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        const lat = center.lat + r * Math.cos(angle);
        const lng = center.lng + r * Math.sin(angle);

        return {
            id: `${Date.now()}-${Math.random()}`,
            type: this.getCollectibleTypeForLocation(locationType),
            position: { lat, lng },
            rarity: this.calculateRarity(),
            power: this.calculatePower(),
            attributes: this.generateAttributes(locationType)
        };
    }

    // Calculate spawn rarity
    calculateRarity() {
        const rand = Math.random();
        if (rand < 0.01) return 'LEGENDARY';
        if (rand < 0.05) return 'EPIC';
        if (rand < 0.15) return 'RARE';
        if (rand < 0.35) return 'UNCOMMON';
        return 'COMMON';
    }

    // Calculate collectible power
    calculatePower() {
        return Math.floor(Math.random() * 900) + 100; // 100-1000
    }

    // Generate attributes based on location
    generateAttributes(locationType) {
        const baseAttributes = {
            FOREST: { sustainability: 0.8, biodiversity: 0.9, pollution: 0.2 },
            WATER: { sustainability: 0.7, biodiversity: 0.8, pollution: 0.3 },
            URBAN: { sustainability: 0.4, biodiversity: 0.3, pollution: 0.7 },
            PARK: { sustainability: 0.6, biodiversity: 0.7, pollution: 0.4 }
        };

        return {
            ...baseAttributes[locationType],
            uniqueness: Math.random(),
            timestamp: Date.now()
        };
    }

    // Handle collectible collection with error recovery
    async collectCollectible(collectibleId, userLocation) {
        try {
            return await ErrorHandler.retryOperation(async () => {
                // Verify distance
                const collectible = this.findCollectible(collectibleId);
                if (!this.isWithinRange(userLocation, collectible.position)) {
                    throw new Error('Too far from collectible');
                }

                // Process collection
                await this.processCollection(collectible);
                return true;
            }, this.retryAttempts, this.retryDelay);
        } catch (error) {
            console.error('Failed to collect:', error);
            throw error;
        }
    }

    // Check if user is within range of collectible
    isWithinRange(userLocation, collectibleLocation, maxRange = 0.1) {
        const distance = this.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            collectibleLocation.lat,
            collectibleLocation.lng
        );
        return distance <= maxRange;
    }

    // Calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Process collectible collection
    async processCollection(collectible) {
        // Update local state
        this.gameState = {
            ...this.gameState,
            inventory: [...(this.gameState.inventory || []), collectible],
            experience: (this.gameState.experience || 0) + this.calculateExperience(collectible)
        };

        // Save to cache immediately
        this.saveToCache();

        // Try to sync with blockchain
        try {
            await this.syncWithBlockchain();
        } catch (error) {
            console.warn('Failed to sync with blockchain, will retry later:', error);
            // Queue for later sync
            this.queueForSync(collectible);
        }
    }

    // Calculate experience gained from collectible
    calculateExperience(collectible) {
        const rarityMultipliers = {
            LEGENDARY: 5,
            EPIC: 3,
            RARE: 2,
            UNCOMMON: 1.5,
            COMMON: 1
        };

        return Math.floor(
            collectible.power * 
            (rarityMultipliers[collectible.rarity] || 1)
        );
    }

    // Queue failed operations for later sync
    queueForSync(operation) {
        const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        syncQueue.push({
            operation,
            timestamp: Date.now()
        });
        localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
    }

    // Process sync queue
    async processSyncQueue() {
        const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        const failedOps = [];

        for (const op of syncQueue) {
            try {
                await this.syncOperation(op.operation);
            } catch (error) {
                failedOps.push(op);
            }
        }

        localStorage.setItem('syncQueue', JSON.stringify(failedOps));
    }
}

export default GameStateManager;
