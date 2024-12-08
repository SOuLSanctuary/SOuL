import { calculateCarbonOffset, calculateWaterSaved, calculateBiodiversityScore } from '../ImpactCalculator';

describe('ImpactCalculator', () => {
    describe('calculateCarbonOffset', () => {
        it('should calculate carbon offset for tree planting', () => {
            const action = {
                type: 'PLANT_TREE',
                details: {
                    treeType: 'oak',
                    age: 'sapling',
                    quantity: 2
                }
            };
            
            const result = calculateCarbonOffset(action);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeDefined();
        });

        it('should calculate carbon offset for renewable energy usage', () => {
            const action = {
                type: 'USE_RENEWABLE_ENERGY',
                details: {
                    source: 'solar',
                    kwhSaved: 100
                }
            };
            
            const result = calculateCarbonOffset(action);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeDefined();
        });

        it('should return 0 for invalid action types', () => {
            const action = {
                type: 'INVALID_ACTION',
                details: {}
            };
            
            const result = calculateCarbonOffset(action);
            expect(result).toBe(0);
        });
    });

    describe('calculateWaterSaved', () => {
        it('should calculate water saved from conservation actions', () => {
            const action = {
                type: 'WATER_CONSERVATION',
                details: {
                    method: 'rainwater_harvesting',
                    liters: 1000
                }
            };
            
            const result = calculateWaterSaved(action);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeDefined();
        });

        it('should calculate water saved from sustainable farming', () => {
            const action = {
                type: 'SUSTAINABLE_FARMING',
                details: {
                    method: 'drip_irrigation',
                    area: 100,
                    duration: 7
                }
            };
            
            const result = calculateWaterSaved(action);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeDefined();
        });

        it('should return 0 for actions without water impact', () => {
            const action = {
                type: 'USE_RENEWABLE_ENERGY',
                details: {}
            };
            
            const result = calculateWaterSaved(action);
            expect(result).toBe(0);
        });
    });

    describe('calculateBiodiversityScore', () => {
        it('should calculate biodiversity score for habitat creation', () => {
            const action = {
                type: 'CREATE_HABITAT',
                details: {
                    type: 'wetland',
                    area: 100,
                    speciesCount: 5
                }
            };
            
            const result = calculateBiodiversityScore(action);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeDefined();
        });

        it('should calculate biodiversity score for species protection', () => {
            const action = {
                type: 'PROTECT_SPECIES',
                details: {
                    species: ['butterfly', 'bee'],
                    duration: 30,
                    area: 50
                }
            };
            
            const result = calculateBiodiversityScore(action);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeDefined();
        });

        it('should handle cumulative biodiversity impact', () => {
            const actions = [
                {
                    type: 'CREATE_HABITAT',
                    details: {
                        type: 'forest',
                        area: 200,
                        speciesCount: 10
                    }
                },
                {
                    type: 'PROTECT_SPECIES',
                    details: {
                        species: ['owl', 'deer'],
                        duration: 90,
                        area: 200
                    }
                }
            ];
            
            const results = actions.map(calculateBiodiversityScore);
            const totalImpact = results.reduce((sum, score) => sum + score, 0);
            
            expect(totalImpact).toBeGreaterThan(0);
            expect(totalImpact).toBeGreaterThan(Math.max(...results));
        });

        it('should return 0 for actions without biodiversity impact', () => {
            const action = {
                type: 'USE_RENEWABLE_ENERGY',
                details: {}
            };
            
            const result = calculateBiodiversityScore(action);
            expect(result).toBe(0);
        });
    });

    describe('Edge Cases and Validation', () => {
        it('should handle missing action details', () => {
            const action = {
                type: 'PLANT_TREE'
            };
            
            expect(calculateCarbonOffset(action)).toBe(0);
            expect(calculateWaterSaved(action)).toBe(0);
            expect(calculateBiodiversityScore(action)).toBe(0);
        });

        it('should handle null or undefined inputs', () => {
            expect(calculateCarbonOffset(null)).toBe(0);
            expect(calculateWaterSaved(undefined)).toBe(0);
            expect(calculateBiodiversityScore(null)).toBe(0);
        });

        it('should validate numerical inputs', () => {
            const action = {
                type: 'WATER_CONSERVATION',
                details: {
                    method: 'rainwater_harvesting',
                    liters: -100 // negative value
                }
            };
            
            const result = calculateWaterSaved(action);
            expect(result).toBe(0);
        });
    });
});
