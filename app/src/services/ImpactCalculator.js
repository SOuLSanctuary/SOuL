/**
 * Environmental Impact Calculator Service
 * Calculates various environmental impacts based on user actions
 */

export const IMPACT_COEFFICIENTS = {
    TREE_PLANTING: {
        oak: 2.5,
        maple: 2.0,
        pine: 1.8,
        default: 1.5
    },
    RENEWABLE_ENERGY: {
        solar: 0.4,
        wind: 0.1,
        default: 0.2
    },
    WATER_CONSERVATION: {
        rainwater_harvesting: 1.0,
        greywater_reuse: 0.8,
        default: 0.5
    },
    BIODIVERSITY: {
        wetland: 3.0,
        forest: 2.5,
        grassland: 1.5,
        default: 1.0
    }
};

/**
 * Calculate carbon offset from environmental actions
 * @param {Object} action - The environmental action
 * @returns {number} - Carbon offset in kg CO2
 */
export function calculateCarbonOffset(action) {
    if (!action?.type || !action?.details) {
        return 0;
    }

    switch (action.type) {
        case 'PLANT_TREE': {
            const { treeType = 'default', quantity = 1, age = 'sapling' } = action.details;
            const baseOffset = IMPACT_COEFFICIENTS.TREE_PLANTING[treeType] || IMPACT_COEFFICIENTS.TREE_PLANTING.default;
            const ageMultiplier = age === 'mature' ? 2 : 1;
            return baseOffset * quantity * ageMultiplier;
        }

        case 'USE_RENEWABLE_ENERGY': {
            const { source = 'default', kwhSaved = 0 } = action.details;
            const coefficient = IMPACT_COEFFICIENTS.RENEWABLE_ENERGY[source] || IMPACT_COEFFICIENTS.RENEWABLE_ENERGY.default;
            return Math.max(0, kwhSaved * coefficient);
        }

        default:
            return 0;
    }
}

/**
 * Calculate water saved from conservation actions
 * @param {Object} action - The environmental action
 * @returns {number} - Water saved in liters
 */
export function calculateWaterSaved(action) {
    if (!action?.type || !action?.details) {
        return 0;
    }

    switch (action.type) {
        case 'WATER_CONSERVATION': {
            const { method = 'default', liters = 0 } = action.details;
            const coefficient = IMPACT_COEFFICIENTS.WATER_CONSERVATION[method] || IMPACT_COEFFICIENTS.WATER_CONSERVATION.default;
            return Math.max(0, liters * coefficient);
        }

        case 'SUSTAINABLE_FARMING': {
            const { method = 'default', area = 0, duration = 1 } = action.details;
            const baseWaterSaved = area * 0.5; // Base water savings per square meter
            return Math.max(0, baseWaterSaved * duration);
        }

        default:
            return 0;
    }
}

/**
 * Calculate biodiversity score from environmental actions
 * @param {Object} action - The environmental action
 * @returns {number} - Biodiversity impact score
 */
export function calculateBiodiversityScore(action) {
    if (!action?.type || !action?.details) {
        return 0;
    }

    switch (action.type) {
        case 'CREATE_HABITAT': {
            const { type = 'default', area = 0, speciesCount = 0 } = action.details;
            const coefficient = IMPACT_COEFFICIENTS.BIODIVERSITY[type] || IMPACT_COEFFICIENTS.BIODIVERSITY.default;
            return Math.max(0, area * coefficient * (1 + speciesCount * 0.1));
        }

        case 'PROTECT_SPECIES': {
            const { species = [], duration = 0, area = 0 } = action.details;
            const speciesImpact = species.length * 2;
            const areaImpact = area * 0.01;
            const durationImpact = Math.min(duration / 30, 1); // Cap at 1 month
            return Math.max(0, speciesImpact * areaImpact * durationImpact);
        }

        default:
            return 0;
    }
}

/**
 * Calculate total environmental impact score
 * @param {Object} action - The environmental action
 * @returns {Object} - Combined impact scores
 */
export function calculateTotalImpact(action) {
    return {
        carbonOffset: calculateCarbonOffset(action),
        waterSaved: calculateWaterSaved(action),
        biodiversityScore: calculateBiodiversityScore(action)
    };
}

export default {
    calculateCarbonOffset,
    calculateWaterSaved,
    calculateBiodiversityScore,
    calculateTotalImpact,
    IMPACT_COEFFICIENTS
};
