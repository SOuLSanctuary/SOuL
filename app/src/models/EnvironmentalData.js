// Environmental Data Models

export const TREE_DATA = {
    HEALTH_STATUS: [
        'Healthy',
        'Minor Issues',
        'Moderate Issues',
        'Severe Issues',
        'Dead',
        'Unknown'
    ],
    ENDEMISM: [
        'Endemic',
        'Native',
        'Indigenous',
        'Introduced',
        'Invasive',
        'Unknown'
    ],
    CONSERVATION_STATUS: [
        'Least Concern (LC)',
        'Near Threatened (NT)',
        'Vulnerable (VU)',
        'Endangered (EN)',
        'Critically Endangered (CR)',
        'Extinct in the Wild (EW)',
        'Extinct (EX)',
        'Data Deficient (DD)',
        'Not Evaluated (NE)'
    ]
};

export const FOREST_DATA = {
    PRESENCE: [
        'Present',
        'Absent',
        'Fragmented',
        'Degraded'
    ],
    FOREST_TYPES: [
        'Tropical Rainforest',
        'Tropical Dry Forest',
        'Temperate Deciduous Forest',
        'Temperate Coniferous Forest',
        'Boreal Forest',
        'Cloud Forest',
        'Mangrove Forest',
        'Mixed Forest'
    ],
    FOREST_COVER: [
        'Dense (>70%)',
        'Moderate (40-70%)',
        'Sparse (10-40%)',
        'Very Sparse (<10%)'
    ],
    LANDCOVER_TYPES: [
        'Forest',
        'Woodland',
        'Shrubland',
        'Grassland',
        'Wetland',
        'Agricultural Land',
        'Urban/Built-up',
        'Barren Land'
    ],
    PROGRESSION_TYPES: [
        'Early Secondary Forest',
        'Mid-Secondary Forest',
        'Late Secondary Forest',
        'Old Growth Forest',
        'Open Forest',
        'Degraded Forest'
    ]
};

export const THREAT_DATA = {
    TYPES: [
        'Illegal Logging',
        'Illegal Poaching',
        'Illegal Trade',
        'Unprescribed Fire',
        'Deliberate Burning',
        'Illegal Conversion',
        'Illegal Waste Disposal',
        'Illegal Harvesting',
        'Illegal Hunting'
    ],
    SEVERITY: [
        'Low',
        'Medium',
        'High',
        'Critical'
    ],
    STATUS: [
        'Active',
        'Inactive',
        'Suspected',
        'Confirmed',
        'Resolved'
    ]
};

export const DISASTER_DATA = {
    TYPES: [
        'Landslide',
        'Flooding',
        'Tsunami',
        'Earth Quake',
        'Mudslide',
        'Avalanche'
    ],
    SEVERITY: [
        'Minor',
        'Moderate',
        'Major',
        'Catastrophic'
    ],
    IMPACT: [
        'Minimal',
        'Localized',
        'Widespread',
        'Devastating'
    ]
};

export const WEATHER_DATA = {
    RAIN: {
        INTENSITY: [
            'Light',
            'Moderate',
            'Heavy'
        ],
        DURATION: [
            'Brief',
            'Intermittent',
            'Continuous',
            'Sustained (3+ days)'
        ]
    },
    CONDITIONS: [
        'Sunny',
        'Partly Cloudy',
        'Mostly Cloudy',
        'Overcast',
        'Stormy',
        'Windy'
    ],
    WIND: {
        STRENGTH: [
            'Calm',
            'Light',
            'Moderate',
            'Strong',
            'Very Strong',
            'Severe'
        ]
    }
};

export const WILDLIFE_DATA = {
    HEALTH_STATUS: [
        'Healthy',
        'Minor Issues',
        'Moderate Issues',
        'Severe Issues',
        'Deceased',
        'Unknown'
    ],
    ENDEMISM: [
        'Endemic',
        'Native',
        'Indigenous',
        'Introduced',
        'Invasive',
        'Unknown'
    ],
    CONSERVATION_STATUS: [
        'Least Concern (LC)',
        'Near Threatened (NT)',
        'Vulnerable (VU)',
        'Endangered (EN)',
        'Critically Endangered (CR)',
        'Extinct in the Wild (EW)',
        'Extinct (EX)',
        'Data Deficient (DD)',
        'Not Evaluated (NE)'
    ],
    ACTIVITIES: [
        'Perching',
        'Feeding',
        'Mate-calling',
        'Nesting',
        'Hunting',
        'Resting',
        'Moving/Traveling',
        'Territorial Display',
        'Social Interaction',
        'Grooming'
    ]
};
