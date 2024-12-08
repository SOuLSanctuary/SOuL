import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const BREEDING_MECHANICS = {
  GENETIC_TRAITS: {
    DOMINANT: ['Ocean Power', 'Forest Power', 'Solar Power', 'Tech Power'],
    RECESSIVE: ['Coral Power', 'Wind Power', 'Waste Power', 'Marine Power'],
    MUTATION_CHANCE: 0.15
  },
  ELEMENT_AFFINITIES: {
    WATER: ['Ocean', 'Coral', 'Marine'],
    EARTH: ['Forest', 'Mountain', 'Soil'],
    FIRE: ['Solar', 'Energy', 'Tech'],
    AIR: ['Wind', 'Climate', 'Sky']
  },
  BREEDING_SEASONS: {
    SPRING: {
      boost: ['Forest', 'Wind', 'Solar'],
      penalty: ['Ocean', 'Tech']
    },
    SUMMER: {
      boost: ['Solar', 'Ocean', 'Tech'],
      penalty: ['Forest', 'Mountain']
    },
    AUTUMN: {
      boost: ['Wind', 'Mountain', 'Tech'],
      penalty: ['Solar', 'Marine']
    },
    WINTER: {
      boost: ['Ocean', 'Mountain', 'Energy'],
      penalty: ['Solar', 'Wind']
    }
  },
  LINEAGE_BONUSES: {
    PURE: {
      requirement: 'Same element for 3 generations',
      bonus: 'Element Power +25%'
    },
    HYBRID: {
      requirement: 'Different elements for 3 generations',
      bonus: 'All Powers +10%'
    },
    LEGENDARY: {
      requirement: 'Both parents Mythic rarity',
      bonus: 'Guaranteed Ultra Mythic offspring'
    }
  },
  EVOLUTION_PATHS: {
    GUARDIAN: {
      stages: ['Novice', 'Protector', 'Guardian', 'Oracle'],
      requirements: [100, 500, 1000, 5000],
      bonuses: ['Base Power +10%', 'Cooldown -20%', 'Dual Element', 'Triple Element']
    },
    SAGE: {
      stages: ['Student', 'Adept', 'Master', 'Sage'],
      requirements: [200, 1000, 2000, 10000],
      bonuses: ['Mutation +5%', 'Breeding Speed +20%', 'Power Transfer +25%', 'Element Mastery']
    },
    TECHNOMANCER: {
      stages: ['Initiate', 'Engineer', 'Innovator', 'Architect'],
      requirements: [150, 750, 1500, 7500],
      bonuses: ['Tech Power +15%', 'Hybrid Chance +20%', 'Multi-Element', 'Tech Synthesis']
    }
  }
};

const FUSION_CATALYSTS = {
  ELEMENTAL_CRYSTALS: {
    WATER: 'Enhances Water-based traits',
    EARTH: 'Boosts Earth-based abilities',
    FIRE: 'Amplifies Energy generation',
    AIR: 'Improves Climate influence'
  },
  RARE_MATERIALS: {
    ANCIENT_CORE: 'Guarantees one Legendary trait',
    QUANTUM_SHARD: 'Enables cross-element fusion',
    HARMONY_STONE: 'Balances all elements',
    CHAOS_FRAGMENT: 'Random powerful enhancement'
  },
  SEASONAL_ITEMS: {
    SPRING_ESSENCE: 'Growth and renewal boost',
    SUMMER_CRYSTAL: 'Energy and power boost',
    AUTUMN_LEAF: 'Transformation boost',
    WINTER_ICE: 'Preservation boost'
  }
};

const BREEDING_PAIRS = {
  OCEAN_FOREST: {
    parents: ['Ocean Protector', 'Forest Guardian'],
    offspring: {
      name: 'Coastal Forest Guardian',
      description: 'Protector of mangrove ecosystems',
      rarity: 'Mythic',
      attributes: {
        'Ocean Power': 80,
        'Forest Power': 80,
        'Special Ability': 'Mangrove Restoration'
      }
    },
    cooldown: 7
  },
  CLIMATE_ENERGY: {
    parents: ['Climate Warrior', 'Energy Guardian'],
    offspring: {
      name: 'Renewable Force',
      description: 'Master of clean energy transformation',
      rarity: 'Legendary',
      attributes: {
        'Climate Power': 85,
        'Energy Power': 85,
        'Special Ability': 'Carbon Neutralizer'
      }
    },
    cooldown: 14
  },
  WILDLIFE_COMMUNITY: {
    parents: ['Wildlife Guardian', 'Community Leader'],
    offspring: {
      name: 'Ecosystem Ambassador',
      description: 'Bridge between wildlife and communities',
      rarity: 'Mythic',
      attributes: {
        'Wildlife Power': 90,
        'Community Power': 75,
        'Special Ability': 'Habitat Harmony'
      }
    },
    cooldown: 10
  },
  SOLAR_WIND: {
    parents: ['Solar Sage', 'Wind Whisperer'],
    offspring: {
      name: 'Renewable Energy Oracle',
      description: 'Master of sustainable energy sources',
      rarity: 'Ultra Mythic',
      attributes: {
        'Solar Power': 95,
        'Wind Power': 95,
        'Special Ability': 'Energy Synthesis'
      }
    },
    cooldown: 21
  },
  WASTE_TECH: {
    parents: ['Waste Warrior', 'Tech Innovator'],
    offspring: {
      name: 'Recycling Technomancer',
      description: 'Revolutionary waste management specialist',
      rarity: 'Legendary',
      attributes: {
        'Waste Power': 88,
        'Tech Power': 92,
        'Special Ability': 'Smart Recycling'
      }
    },
    cooldown: 14
  },
  CORAL_MARINE: {
    parents: ['Coral Guardian', 'Marine Protector'],
    offspring: {
      name: 'Deep Sea Restorer',
      description: 'Expert in marine ecosystem restoration',
      rarity: 'Mythic',
      attributes: {
        'Coral Power': 85,
        'Marine Power': 90,
        'Special Ability': 'Reef Genesis'
      }
    },
    cooldown: 18
  },
  QUANTUM_FUSION: {
    parents: ['Tech Oracle', 'Energy Sage'],
    offspring: {
      name: 'Quantum Sustainability Architect',
      description: 'Master of quantum-enhanced environmental solutions',
      rarity: 'Ultra Mythic',
      attributes: {
        'Tech Power': 98,
        'Energy Power': 98,
        'Special Ability': 'Quantum Environmental Synthesis'
      }
    },
    cooldown: 30,
    requirements: {
      catalysts: ['QUANTUM_SHARD'],
      season: 'SUMMER',
      alignment: 'TECH'
    }
  },
  ELEMENTAL_HARMONY: {
    parents: ['Water Oracle', 'Earth Guardian'],
    offspring: {
      name: 'Elemental Balance Keeper',
      description: 'Guardian of natural equilibrium',
      rarity: 'Ultra Mythic',
      attributes: {
        'Water Power': 95,
        'Earth Power': 95,
        'Special Ability': 'Elemental Harmony'
      }
    },
    cooldown: 25,
    requirements: {
      catalysts: ['HARMONY_STONE'],
      season: 'SPRING',
      alignment: 'NATURE'
    }
  },
  COSMIC_GUARDIAN: {
    parents: ['Star Weaver', 'Void Walker'],
    offspring: {
      name: 'Cosmic Environmental Protector',
      description: 'Guardian of planetary ecosystems',
      rarity: 'Ultra Mythic',
      attributes: {
        'Cosmic Power': 99,
        'Environmental Power': 99,
        'Special Ability': 'Cosmic Environmental Shield'
      }
    },
    cooldown: 40,
    requirements: {
      catalysts: ['ANCIENT_CORE', 'CHAOS_FRAGMENT'],
      season: 'WINTER',
      alignment: 'COSMIC'
    }
  }
};

const FUSION_RECIPES = {
  SUPREME_GUARDIAN: {
    ingredients: ['Earth Guardian Supreme', 'Ocean Spirit Legendary', 'Climate Oracle'],
    result: {
      name: 'Supreme Environmental Oracle',
      description: 'Ultimate protector of Earth\'s elements',
      rarity: 'Ultra Mythic',
      attributes: {
        'Earth Power': 95,
        'Ocean Power': 95,
        'Climate Power': 95,
        'Special Ability': 'Elemental Mastery'
      }
    },
    requirements: {
      points: 50000,
      level: 'Environmental Legend'
    }
  },
  SEASONAL_MASTER: {
    ingredients: ['Winter Sustainability Spirit', 'Biodiversity Champion', 'Sustainable Food Sage'],
    result: {
      name: 'Seasonal Harmony Master',
      description: 'Master of all seasonal challenges',
      rarity: 'Ultra Legendary',
      attributes: {
        'Winter Power': 90,
        'Nature Power': 90,
        'Sustainability Power': 90,
        'Special Ability': 'Seasonal Blessing'
      }
    },
    requirements: {
      points: 40000,
      level: 'Climate Champion'
    }
  },
  TECH_INNOVATOR: {
    ingredients: ['Smart City Pioneer', 'Digital Sustainability Expert', 'Green Tech Sage'],
    result: {
      name: 'Sustainable Technology Oracle',
      description: 'Master of eco-friendly innovation',
      rarity: 'Ultra Mythic',
      attributes: {
        'Innovation': 95,
        'Sustainability': 95,
        'Technology': 95,
        'Special Ability': 'Green Innovation'
      }
    },
    requirements: {
      points: 45000,
      level: 'Tech Visionary'
    }
  },
  NATURE_HARMONY: {
    ingredients: ['Forest Spirit', 'Mountain Guardian', 'River Protector'],
    result: {
      name: 'Terrestrial Harmony Master',
      description: 'Keeper of land-based ecosystems',
      rarity: 'Ultra Legendary',
      attributes: {
        'Forest Power': 92,
        'Mountain Power': 92,
        'River Power': 92,
        'Special Ability': 'Ecosystem Symphony'
      }
    },
    requirements: {
      points: 35000,
      level: 'Nature Sage'
    }
  },
  URBAN_GUARDIAN: {
    ingredients: ['City Planner', 'Waste Manager', 'Energy Optimizer'],
    result: {
      name: 'Smart City Oracle',
      description: 'Master of urban sustainability',
      rarity: 'Ultra Mythic',
      attributes: {
        'Urban Planning': 90,
        'Waste Management': 90,
        'Energy Efficiency': 90,
        'Special Ability': 'Urban Harmony'
      }
    },
    requirements: {
      points: 42000,
      level: 'Urban Legend'
    }
  },
  QUANTUM_ENVIRONMENTAL: {
    ingredients: ['Quantum Oracle', 'Environmental Sage', 'Tech Pioneer'],
    catalysts: ['QUANTUM_SHARD', 'HARMONY_STONE'],
    result: {
      name: 'Quantum Environmental Synthesizer',
      description: 'Master of quantum-enhanced environmental restoration',
      rarity: 'Ultra Mythic',
      attributes: {
        'Quantum Power': 98,
        'Environmental Power': 98,
        'Tech Power': 98,
        'Special Ability': 'Quantum Environmental Restoration'
      }
    },
    requirements: {
      points: 100000,
      level: 'Quantum Sage',
      season: 'SUMMER'
    }
  },
  ELEMENTAL_MASTER: {
    ingredients: ['Water Oracle', 'Earth Guardian', 'Fire Sage'],
    catalysts: ['HARMONY_STONE', 'ANCIENT_CORE'],
    result: {
      name: 'Primal Element Master',
      description: 'Supreme master of elemental forces',
      rarity: 'Ultra Mythic',
      attributes: {
        'Water Power': 96,
        'Earth Power': 96,
        'Fire Power': 96,
        'Special Ability': 'Primal Element Synthesis'
      }
    },
    requirements: {
      points: 90000,
      level: 'Element Sage',
      season: 'SPRING'
    }
  }
};

const LEGENDARY_COMBINATIONS = {
  QUANTUM_GUARDIAN: {
    parents: ['Tech Oracle', 'Nature Sage'],
    catalysts: ['QUANTUM_SHARD', 'ANCIENT_CORE'],
    requirements: {
      season: 'SUMMER',
      moonPhase: 'FULL',
      alignment: 'HARMONY',
      parentLevel: 50
    },
    offspring: {
      name: 'Quantum Environmental Guardian',
      rarity: 'Legendary',
      powers: ['Quantum Restoration', 'Nature Synthesis', 'Time Manipulation'],
      baseStats: {
        power: 98,
        wisdom: 95,
        influence: 92
      }
    }
  },
  COSMIC_PROTECTOR: {
    parents: ['Star Weaver', 'Void Walker'],
    catalysts: ['COSMIC_CRYSTAL', 'VOID_ESSENCE'],
    requirements: {
      season: 'WINTER',
      moonPhase: 'NEW',
      alignment: 'COSMIC',
      parentLevel: 60
    },
    offspring: {
      name: 'Cosmic Environmental Protector',
      rarity: 'Legendary',
      powers: ['Cosmic Shield', 'Void Manipulation', 'Reality Weaving'],
      baseStats: {
        power: 96,
        wisdom: 98,
        influence: 94
      }
    }
  }
};

const MYTHIC_FUSIONS = {
  ELEMENTAL_SOVEREIGN: {
    ingredients: ['Water Oracle', 'Fire Sage', 'Earth Guardian', 'Air Nomad'],
    catalysts: ['ELEMENTAL_CORE', 'HARMONY_STONE'],
    requirements: {
      alignment: 'ALL',
      power: 1000,
      moonPhase: 'FULL',
      location: 'SACRED_GROVE'
    },
    result: {
      name: 'Elemental Sovereign',
      rarity: 'Mythic',
      powers: ['Elemental Mastery', 'Nature\'s Wrath', 'Environmental Harmony'],
      baseStats: {
        power: 99,
        wisdom: 99,
        influence: 99
      }
    }
  },
  TECH_SHAMAN: {
    ingredients: ['Digital Sage', 'Nature Oracle', 'Quantum Pioneer'],
    catalysts: ['QUANTUM_CORE', 'TECH_ESSENCE'],
    requirements: {
      alignment: 'TECH_NATURE',
      power: 800,
      moonPhase: 'WAXING',
      location: 'TECH_SANCTUARY'
    },
    result: {
      name: 'Techno-Environmental Shaman',
      rarity: 'Mythic',
      powers: ['Digital Nature', 'Quantum Growth', 'Tech Synthesis'],
      baseStats: {
        power: 97,
        wisdom: 98,
        influence: 96
      }
    }
  }
};

const BREEDING_MUTATIONS = {
  RANDOM_MUTATIONS: {
    chance: 0.05,
    types: [
      'POWER_BOOST',
      'WISDOM_ENHANCEMENT',
      'SPECIAL_ABILITY',
      'RARE_TRAIT'
    ],
    conditions: {
      POWER_BOOST: { minParentPower: 80 },
      WISDOM_ENHANCEMENT: { minParentWisdom: 85 },
      SPECIAL_ABILITY: { parentRarity: 'Legendary' },
      RARE_TRAIT: { moonPhase: 'FULL' }
    }
  },
  ENVIRONMENTAL_ADAPTATIONS: {
    types: {
      FOREST: {
        boost: ['Nature Power', 'Growth Rate'],
        requirement: 'Near Sacred Grove'
      },
      OCEAN: {
        boost: ['Water Affinity', 'Marine Sense'],
        requirement: 'Near Ocean'
      },
      MOUNTAIN: {
        boost: ['Earth Power', 'Stability'],
        requirement: 'High Altitude'
      },
      TECH_HUB: {
        boost: ['Tech Affinity', 'Innovation'],
        requirement: 'In Tech Zone'
      }
    }
  }
};

const SEASONAL_EVENTS = {
  SPRING_AWAKENING: {
    duration: '21 days',
    specialBreeding: {
      boost: ['Nature', 'Growth', 'Renewal'],
      newCombinations: ['Spring Guardian', 'Bloom Sage'],
      bonusRewards: ['Spring Essence', 'Renewal Crystal']
    }
  },
  SUMMER_SOLSTICE: {
    duration: '21 days',
    specialBreeding: {
      boost: ['Solar', 'Fire', 'Energy'],
      newCombinations: ['Solar Oracle', 'Energy Master'],
      bonusRewards: ['Solar Crystal', 'Energy Core']
    }
  },
  AUTUMN_HARMONY: {
    duration: '21 days',
    specialBreeding: {
      boost: ['Balance', 'Transformation', 'Wisdom'],
      newCombinations: ['Harmony Keeper', 'Wisdom Sage'],
      bonusRewards: ['Harmony Stone', 'Wisdom Essence']
    }
  },
  WINTER_SOLSTICE: {
    duration: '21 days',
    specialBreeding: {
      boost: ['Ice', 'Preservation', 'Purity'],
      newCombinations: ['Frost Oracle', 'Pure Guardian'],
      bonusRewards: ['Ice Crystal', 'Purity Essence']
    }
  }
};

const BREEDING_SYNERGIES = {
  ELEMENTAL_HARMONY: {
    combinations: [
      ['Water', 'Fire'],
      ['Earth', 'Air'],
      ['Nature', 'Tech']
    ],
    bonus: {
      powerBoost: 1.5,
      specialAbility: 'Elemental Synthesis',
      uniqueTrait: 'Harmonic Resonance'
    }
  },
  COSMIC_ALIGNMENT: {
    combinations: [
      ['Star', 'Void'],
      ['Quantum', 'Reality'],
      ['Time', 'Space']
    ],
    bonus: {
      powerBoost: 2.0,
      specialAbility: 'Cosmic Manipulation',
      uniqueTrait: 'Universal Harmony'
    }
  }
};

function NFTBreeding() {
  const { connected } = useWallet();
  const [selectedPair, setSelectedPair] = useState(null);
  const [selectedFusion, setSelectedFusion] = useState(null);
  const [breedingHistory, setBreedingHistory] = useState([]);
  const [fusionHistory, setFusionHistory] = useState([]);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const tabStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const tabButtonStyle = (active) => ({
    padding: '0.5rem 1rem',
    backgroundColor: active ? '#4CAF50' : '#282c34',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  };

  const cardStyle = {
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1.5rem',
    border: '1px solid #4CAF50',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  };

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1a1c20',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #4CAF50',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    zIndex: 1000
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999
  };

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem'
  };

  const [activeTab, setActiveTab] = useState('breeding');

  const BreedingModal = ({ pair, onClose }) => (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Breeding Pair</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Parents</h4>
          <ul style={{ color: '#888', listStyle: 'none', padding: 0 }}>
            {pair.parents.map((parent, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>• {parent}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Offspring</h4>
          <p style={{ color: '#888', marginBottom: '0.5rem' }}>{pair.offspring.name}</p>
          <p style={{ color: '#666' }}>{pair.offspring.description}</p>
          <p style={{ color: '#4CAF50', marginTop: '0.5rem' }}>Rarity: {pair.offspring.rarity}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Attributes</h4>
          {Object.entries(pair.offspring.attributes).map(([key, value]) => (
            <div key={key} style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              color: '#888',
              marginBottom: '0.5rem'
            }}>
              <span>{key}:</span>
              <span style={{ color: '#4CAF50' }}>{value}</span>
            </div>
          ))}
        </div>

        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Cooldown Period: {pair.cooldown} days
        </p>

        <button style={buttonStyle} onClick={() => alert('Breeding functionality coming soon!')}>
          Start Breeding
        </button>
        <button style={{ ...buttonStyle, backgroundColor: '#666' }} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );

  const FusionModal = ({ recipe, onClose }) => (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>NFT Fusion</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Required NFTs</h4>
          <ul style={{ color: '#888', listStyle: 'none', padding: 0 }}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>• {ingredient}</li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Result</h4>
          <p style={{ color: '#888', marginBottom: '0.5rem' }}>{recipe.result.name}</p>
          <p style={{ color: '#666' }}>{recipe.result.description}</p>
          <p style={{ color: '#4CAF50', marginTop: '0.5rem' }}>Rarity: {recipe.result.rarity}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Requirements</h4>
          <p style={{ color: '#888' }}>Points: {recipe.requirements.points.toLocaleString()}</p>
          <p style={{ color: '#888' }}>Level: {recipe.requirements.level}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Attributes</h4>
          {Object.entries(recipe.result.attributes).map(([key, value]) => (
            <div key={key} style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              color: '#888',
              marginBottom: '0.5rem'
            }}>
              <span>{key}:</span>
              <span style={{ color: '#4CAF50' }}>{value}</span>
            </div>
          ))}
        </div>

        <button style={buttonStyle} onClick={() => alert('Fusion functionality coming soon!')}>
          Start Fusion
        </button>
        <button style={{ ...buttonStyle, backgroundColor: '#666' }} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>NFT Breeding & Fusion</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to access NFT breeding and fusion
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#4CAF50', marginBottom: '1.5rem' }}>NFT Breeding & Fusion</h2>

      <div style={tabStyle}>
        <button 
          style={tabButtonStyle(activeTab === 'breeding')}
          onClick={() => setActiveTab('breeding')}
        >
          Breeding
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'fusion')}
          onClick={() => setActiveTab('fusion')}
        >
          Fusion
        </button>
      </div>

      {activeTab === 'breeding' ? (
        <>
          <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Available Breeding Pairs</h3>
          <div style={gridStyle}>
            {Object.entries(BREEDING_PAIRS).map(([key, pair]) => (
              <div
                key={key}
                style={{
                  ...cardStyle,
                  transform: selectedPair === pair ? 'scale(1.02)' : 'scale(1)'
                }}
                onClick={() => setSelectedPair(pair)}
              >
                <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{pair.offspring.name}</h4>
                <p style={{ color: '#888', marginBottom: '1rem' }}>{pair.offspring.description}</p>
                <div style={{ color: '#666' }}>
                  <p>Parents:</p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {pair.parents.map((parent, index) => (
                      <li key={index}>• {parent}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Available Fusion Recipes</h3>
          <div style={gridStyle}>
            {Object.entries(FUSION_RECIPES).map(([key, recipe]) => (
              <div
                key={key}
                style={{
                  ...cardStyle,
                  transform: selectedFusion === recipe ? 'scale(1.02)' : 'scale(1)'
                }}
                onClick={() => setSelectedFusion(recipe)}
              >
                <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{recipe.result.name}</h4>
                <p style={{ color: '#888', marginBottom: '1rem' }}>{recipe.result.description}</p>
                <div style={{ color: '#666' }}>
                  <p>Required NFTs: {recipe.ingredients.length}</p>
                  <p>Rarity: {recipe.result.rarity}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedPair && (
        <BreedingModal 
          pair={selectedPair}
          onClose={() => setSelectedPair(null)}
        />
      )}

      {selectedFusion && (
        <FusionModal 
          recipe={selectedFusion}
          onClose={() => setSelectedFusion(null)}
        />
      )}
    </div>
  );
}

export default NFTBreeding;
