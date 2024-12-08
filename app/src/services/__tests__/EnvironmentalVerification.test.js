import EnvironmentalVerification from '../EnvironmentalVerification';

describe('EnvironmentalVerification', () => {
    let verifier;
    
    beforeEach(() => {
        verifier = new EnvironmentalVerification();
    });

    describe('Location Verification', () => {
        it('should validate correct coordinates', () => {
            const validLocation = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10
            };
            
            expect(verifier.isValidCoordinate(validLocation.latitude, validLocation.longitude)).toBe(true);
        });

        it('should reject invalid coordinates', () => {
            const invalidLocations = [
                { latitude: 91, longitude: 0 },    // Invalid latitude
                { latitude: 0, longitude: 181 },   // Invalid longitude
                { latitude: 'invalid', longitude: 0 }, // Invalid type
            ];

            invalidLocations.forEach(loc => {
                expect(verifier.isValidCoordinate(loc.latitude, loc.longitude)).toBe(false);
            });
        });

        it('should validate GPS accuracy', () => {
            expect(verifier.isAcceptableAccuracy(10)).toBe(true);  // Good accuracy
            expect(verifier.isAcceptableAccuracy(100)).toBe(false); // Poor accuracy
        });

        it('should track location history', () => {
            const location = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10
            };

            verifier.updateLocationHistory(location);
            const history = verifier.getLocationHistory(location);
            
            expect(history).toHaveLength(1);
            expect(history[0]).toHaveProperty('timestamp');
            expect(history[0]).toHaveProperty('accuracy', 10);
        });
    });

    describe('Evidence Verification', () => {
        it('should verify valid image metadata', () => {
            const validMetadata = {
                timestamp: Date.now(),
                location: {
                    latitude: 37.7749,
                    longitude: -122.4194
                },
                deviceInfo: {
                    model: 'Test Device',
                    os: 'Test OS'
                }
            };

            expect(verifier.verifyImageMetadata(validMetadata)).toBe(true);
        });

        it('should reject invalid image metadata', () => {
            const invalidMetadata = {
                timestamp: Date.now()
                // Missing required fields
            };

            expect(verifier.verifyImageMetadata(invalidMetadata)).toBe(false);
        });

        it('should verify measurements within range', () => {
            const validMeasurements = {
                height: 1.5,
                diameter: 0.2
            };

            const result = verifier.verifyMeasurements(validMeasurements, 'TREE_PLANTING');
            expect(result.isValid).toBe(true);
        });

        it('should reject measurements outside range', () => {
            const invalidMeasurements = {
                height: 10, // Too tall
                diameter: 0.001 // Too thin
            };

            const result = verifier.verifyMeasurements(invalidMeasurements, 'TREE_PLANTING');
            expect(result.isValid).toBe(false);
        });
    });

    describe('Timestamp Verification', () => {
        it('should accept recent timestamps', () => {
            const recentTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago
            expect(verifier.verifyTimestamp(recentTimestamp)).toBe(true);
        });

        it('should reject old timestamps', () => {
            const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
            expect(verifier.verifyTimestamp(oldTimestamp)).toBe(false);
        });

        it('should reject future timestamps', () => {
            const futureTimestamp = Date.now() + (1 * 60 * 60 * 1000); // 1 hour in future
            expect(verifier.verifyTimestamp(futureTimestamp)).toBe(false);
        });
    });

    describe('Complete Action Verification', () => {
        const validAction = {
            type: 'TREE_PLANTING',
            evidence: {
                images: [{
                    data: 'test-image-data',
                    metadata: {
                        timestamp: Date.now(),
                        location: {
                            latitude: 37.7749,
                            longitude: -122.4194
                        },
                        deviceInfo: {
                            model: 'Test Device',
                            os: 'Test OS'
                        }
                    }
                }],
                measurements: {
                    height: 1.5,
                    diameter: 0.2
                },
                metadata: {
                    species: 'Oak',
                    soilType: 'Loam',
                    weatherConditions: 'Sunny'
                }
            },
            location: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10
            },
            timestamp: Date.now()
        };

        it('should verify valid environmental action', async () => {
            const result = await verifier.verifyEnvironmentalAction(validAction);
            expect(result.isValid).toBe(true);
            expect(result.confidenceScore).toBeGreaterThanOrEqual(0.7);
        });

        it('should cache verification results', async () => {
            // First verification
            await verifier.verifyEnvironmentalAction(validAction);

            // Should use cached result
            const start = Date.now();
            await verifier.verifyEnvironmentalAction(validAction);
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(100); // Cache lookup should be fast
        });

        it('should reject action with invalid components', async () => {
            const invalidAction = {
                ...validAction,
                location: {
                    ...validAction.location,
                    accuracy: 100 // Poor accuracy
                }
            };

            const result = await verifier.verifyEnvironmentalAction(invalidAction);
            expect(result.isValid).toBe(false);
        });
    });

    describe('Cache Management', () => {
        it('should clean old cache entries', () => {
            // Mock Date.now to simulate time passing
            const realDateNow = Date.now.bind(global.Date);
            const currentTime = realDateNow();
            
            global.Date.now = jest.fn(() => currentTime);
            
            const action = {
                type: 'TEST',
                timestamp: currentTime,
                location: { latitude: 0, longitude: 0 }
            };

            verifier.cacheVerification(action, {
                isValid: true,
                timestamp: currentTime - (2 * 60 * 60 * 1000) // 2 hours old
            });

            // Advance time by 1 hour
            global.Date.now = jest.fn(() => currentTime + (1 * 60 * 60 * 1000));
            
            verifier.cleanCache();
            
            expect(verifier.verificationCache.size).toBe(0);
            
            // Restore real Date.now
            global.Date.now = realDateNow;
        });

        it('should maintain recent cache entries', () => {
            const action = {
                type: 'TEST',
                timestamp: Date.now(),
                location: { latitude: 0, longitude: 0 }
            };

            verifier.cacheVerification(action, {
                isValid: true,
                timestamp: Date.now()
            });

            verifier.cleanCache();
            
            expect(verifier.verificationCache.size).toBe(1);
        });
    });
});
