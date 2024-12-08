import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const SPECIALIZED_PATHS = {
  ENVIRONMENTAL_SCIENTIST: {
    name: 'Environmental Scientist',
    description: 'Master the science of environmental protection',
    stages: [
      {
        name: 'Research Assistant',
        requirements: ['Complete 5 data collection activities', 'Analyze 3 environmental reports'],
        rewards: ['Scientist Novice NFT', 'Research Tools']
      },
      {
        name: 'Field Researcher',
        requirements: ['Conduct 10 field studies', 'Submit 5 research papers'],
        rewards: ['Scientist Expert NFT', 'Advanced Equipment']
      },
      {
        name: 'Lead Scientist',
        requirements: ['Publish 3 major findings', 'Mentor 5 juniors'],
        rewards: ['Scientist Legend NFT', 'Research Grant']
      },
      {
        name: 'Scientific Oracle',
        requirements: ['Make groundbreaking discovery', 'Influence global policy'],
        rewards: ['Scientist Oracle NFT', 'Global Recognition']
      }
    ]
  },
  TECH_INNOVATOR: {
    name: 'Green Technology Innovator',
    description: 'Pioneer sustainable technology solutions',
    stages: [
      {
        name: 'Tech Enthusiast',
        requirements: ['Implement 3 green tech solutions', 'Reduce energy usage by 20%'],
        rewards: ['Innovator Novice NFT', 'Tech Toolkit']
      },
      {
        name: 'Solution Architect',
        requirements: ['Design 5 eco-friendly systems', 'Achieve 40% efficiency'],
        rewards: ['Innovator Expert NFT', 'Innovation Grant']
      },
      {
        name: 'Tech Pioneer',
        requirements: ['Patent green technology', 'Scale solution to community'],
        rewards: ['Innovator Legend NFT', 'Innovation Lab']
      },
      {
        name: 'Innovation Oracle',
        requirements: ['Revolutionary breakthrough', 'Global implementation'],
        rewards: ['Innovator Oracle NFT', 'Tech Empire']
      }
    ]
  },
  COMMUNITY_LEADER: {
    name: 'Community Sustainability Leader',
    description: 'Lead community environmental initiatives',
    stages: [
      {
        name: 'Local Organizer',
        requirements: ['Organize 3 community events', 'Recruit 10 volunteers'],
        rewards: ['Leader Novice NFT', 'Community Tools']
      },
      {
        name: 'Regional Coordinator',
        requirements: ['Expand to 3 regions', 'Train 25 leaders'],
        rewards: ['Leader Expert NFT', 'Regional Office']
      },
      {
        name: 'National Director',
        requirements: ['National program impact', 'Policy influence'],
        rewards: ['Leader Legend NFT', 'National Network']
      },
      {
        name: 'Movement Oracle',
        requirements: ['Global movement creation', 'Systemic change'],
        rewards: ['Leader Oracle NFT', 'Global Platform']
      }
    ]
  },
  CONSERVATION_EXPERT: {
    name: 'Wildlife Conservation Expert',
    description: 'Protect and preserve wildlife ecosystems',
    stages: [
      {
        name: 'Field Observer',
        requirements: ['Document 10 species', 'Support 2 preservation projects'],
        rewards: ['Conservation Novice NFT', 'Field Kit']
      },
      {
        name: 'Conservation Officer',
        requirements: ['Manage protected area', 'Rehabilitate 5 species'],
        rewards: ['Conservation Expert NFT', 'Territory Rights']
      },
      {
        name: 'Ecosystem Guardian',
        requirements: ['Establish sanctuary', 'Breed endangered species'],
        rewards: ['Conservation Legend NFT', 'Sanctuary Grant']
      },
      {
        name: 'Conservation Oracle',
        requirements: ['Save species from extinction', 'Create preservation model'],
        rewards: ['Conservation Oracle NFT', 'Global Reserve']
      }
    ]
  }
};

const MASTERY_PATHS = {
  QUANTUM_ENVIRONMENTALIST: {
    name: 'Quantum Environmental Master',
    description: 'Master quantum mechanics for environmental preservation',
    levels: [
      {
        name: 'Quantum Observer',
        requirements: ['Complete 5 quantum observations', 'Document quantum effects'],
        rewards: ['Quantum Observer NFT', 'Basic Quantum Tools']
      },
      {
        name: 'Quantum Manipulator',
        requirements: ['Successfully manipulate 10 quantum states', 'Create quantum harmony'],
        rewards: ['Quantum Expert NFT', 'Advanced Quantum Kit']
      },
      {
        name: 'Quantum Engineer',
        requirements: ['Design quantum environmental solution', 'Implement quantum system'],
        rewards: ['Quantum Master NFT', 'Quantum Laboratory']
      },
      {
        name: 'Quantum Oracle',
        requirements: ['Achieve quantum breakthrough', 'Transform environment'],
        rewards: ['Quantum Oracle NFT', 'Reality Manipulation']
      }
    ]
  },
  COSMIC_GUARDIAN: {
    name: 'Cosmic Environmental Guardian',
    description: 'Protect environment through cosmic forces',
    levels: [
      {
        name: 'Star Gazer',
        requirements: ['Map cosmic influences', 'Track celestial patterns'],
        rewards: ['Cosmic Novice NFT', 'Celestial Compass']
      },
      {
        name: 'Constellation Keeper',
        requirements: ['Harness constellation energy', 'Create stellar harmony'],
        rewards: ['Cosmic Expert NFT', 'Star Chart']
      },
      {
        name: 'Galaxy Protector',
        requirements: ['Establish cosmic sanctuary', 'Channel universal energy'],
        rewards: ['Cosmic Master NFT', 'Universal Core']
      },
      {
        name: 'Universal Oracle',
        requirements: ['Achieve cosmic enlightenment', 'Transform reality'],
        rewards: ['Cosmic Oracle NFT', 'Reality Nexus']
      }
    ]
  },
  DIGITAL_SHAMAN: {
    name: 'Digital Environmental Shaman',
    description: 'Bridge technology and nature',
    levels: [
      {
        name: 'Code Weaver',
        requirements: ['Create 5 eco-algorithms', 'Implement green tech'],
        rewards: ['Digital Novice NFT', 'Tech Totem']
      },
      {
        name: 'System Harmonizer',
        requirements: ['Optimize 10 systems', 'Achieve tech-nature balance'],
        rewards: ['Digital Expert NFT', 'Harmony Core']
      },
      {
        name: 'Network Sage',
        requirements: ['Build digital ecosystem', 'Create tech-nature synergy'],
        rewards: ['Digital Master NFT', 'Digital Grove']
      },
      {
        name: 'Digital Oracle',
        requirements: ['Perfect digital-natural harmony', 'Transform systems'],
        rewards: ['Digital Oracle NFT', 'Tech-Nature Nexus']
      }
    ]
  }
};

const ACHIEVEMENT_SYNERGIES = {
  SCIENTIST_INNOVATOR: {
    requirements: ['Environmental Scientist Level 2', 'Tech Innovator Level 2'],
    bonus: 'Research findings automatically convert to tech solutions',
    reward: 'Quantum Environmental NFT'
  },
  LEADER_CONSERVATOR: {
    requirements: ['Community Leader Level 2', 'Conservation Expert Level 2'],
    bonus: 'Community programs automatically support conservation',
    reward: 'Community Conservation NFT'
  },
  GRAND_MASTER: {
    requirements: ['Any two paths at Oracle level'],
    bonus: 'All activities gain 3x points',
    reward: 'Grand Oracle NFT'
  },
  QUANTUM_COSMIC: {
    requirements: ['Quantum Level 2', 'Cosmic Level 2'],
    bonus: 'Reality Manipulation Powers',
    reward: 'Universal Guardian NFT'
  },
  DIGITAL_QUANTUM: {
    requirements: ['Digital Level 2', 'Quantum Level 2'],
    bonus: 'Quantum Computing Powers',
    reward: 'Tech Oracle NFT'
  },
  TRIPLE_MASTERY: {
    requirements: ['Any three paths at Master level'],
    bonus: 'All powers enhanced 3x',
    reward: 'Supreme Oracle NFT'
  }
};

const SPECIAL_CHALLENGES = {
  QUANTUM_LEAP: {
    description: 'Complete quantum environmental task in record time',
    requirement: 'Under 24 hours',
    reward: {
      points: 10000,
      nft: 'Time Master NFT',
      bonus: 'Time Manipulation'
    }
  },
  COSMIC_HARMONY: {
    description: 'Align all cosmic forces perfectly',
    requirement: 'Perfect alignment score',
    reward: {
      points: 15000,
      nft: 'Cosmic Master NFT',
      bonus: 'Universal Harmony'
    }
  },
  DIGITAL_REVOLUTION: {
    description: 'Transform entire digital ecosystem',
    requirement: '100% efficiency',
    reward: {
      points: 20000,
      nft: 'Digital Supreme NFT',
      bonus: 'System Mastery'
    }
  }
};

const TIME_LIMITED_ACHIEVEMENTS = {
  QUANTUM_RUSH: {
    duration: '24 hours',
    tasks: [
      'Complete 10 quantum observations',
      'Manipulate 5 quantum states',
      'Achieve quantum harmony'
    ],
    reward: {
      points: 5000,
      nft: 'Quantum Rush NFT',
      bonus: 'Time Boost'
    }
  },
  COSMIC_CONVERGENCE: {
    duration: '7 days',
    tasks: [
      'Map all constellations',
      'Channel cosmic energy',
      'Create universal harmony'
    ],
    reward: {
      points: 10000,
      nft: 'Cosmic Event NFT',
      bonus: 'Universal Power'
    }
  },
  DIGITAL_SPRINT: {
    duration: '48 hours',
    tasks: [
      'Optimize 20 systems',
      'Achieve perfect harmony',
      'Transform digital space'
    ],
    reward: {
      points: 7500,
      nft: 'Digital Sprint NFT',
      bonus: 'System Boost'
    }
  }
};

const ACHIEVEMENT_TIERS = {
  RECYCLING: {
    name: 'Recycling Master',
    tiers: [
      {
        level: 1,
        name: 'Recycling Initiate',
        requirement: 100,
        reward: 'Recycling Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Recycling Adept',
        requirement: 500,
        reward: 'Recycling Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'Recycling Master',
        requirement: 1000,
        reward: 'Recycling Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Recycling Grandmaster',
        requirement: 5000,
        reward: 'Ultimate Recycler NFT',
        multiplier: 2.0
      }
    ]
  },
  ENERGY: {
    name: 'Energy Conservation',
    tiers: [
      {
        level: 1,
        name: 'Energy Saver',
        requirement: 1000,
        reward: 'Energy Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Power Guardian',
        requirement: 5000,
        reward: 'Power Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'Energy Master',
        requirement: 10000,
        reward: 'Energy Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Ultimate Energy Sage',
        requirement: 50000,
        reward: 'Energy Oracle NFT',
        multiplier: 2.0
      }
    ]
  },
  WILDLIFE: {
    name: 'Wildlife Protection',
    tiers: [
      {
        level: 1,
        name: 'Wildlife Friend',
        requirement: 10,
        reward: 'Wildlife Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Wildlife Guardian',
        requirement: 50,
        reward: 'Wildlife Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'Wildlife Master',
        requirement: 100,
        reward: 'Wildlife Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Supreme Wildlife Protector',
        requirement: 500,
        reward: 'Wildlife Oracle NFT',
        multiplier: 2.0
      }
    ]
  },
  COMMUNITY: {
    name: 'Community Leadership',
    tiers: [
      {
        level: 1,
        name: 'Community Helper',
        requirement: 5,
        reward: 'Community Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Community Guide',
        requirement: 25,
        reward: 'Community Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'Community Leader',
        requirement: 50,
        reward: 'Community Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Community Champion',
        requirement: 100,
        reward: 'Community Oracle NFT',
        multiplier: 2.0
      }
    ]
  },
  INNOVATION: {
    name: 'Green Innovation',
    tiers: [
      {
        level: 1,
        name: 'Tech Enthusiast',
        requirement: 3,
        reward: 'Innovation Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Green Innovator',
        requirement: 15,
        reward: 'Innovation Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'Tech Pioneer',
        requirement: 30,
        reward: 'Innovation Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Sustainability Architect',
        requirement: 50,
        reward: 'Innovation Oracle NFT',
        multiplier: 2.0
      }
    ]
  },
  EDUCATION: {
    name: 'Environmental Education',
    tiers: [
      {
        level: 1,
        name: 'Eco Educator',
        requirement: 5,
        reward: 'Education Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Knowledge Keeper',
        requirement: 25,
        reward: 'Education Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'Wisdom Sharer',
        requirement: 50,
        reward: 'Education Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Environmental Sage',
        requirement: 100,
        reward: 'Education Oracle NFT',
        multiplier: 2.0
      }
    ]
  },
  AGRICULTURE: {
    name: 'Sustainable Agriculture',
    tiers: [
      {
        level: 1,
        name: 'Urban Farmer',
        requirement: 10,
        reward: 'Agriculture Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Soil Guardian',
        requirement: 50,
        reward: 'Agriculture Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'Harvest Master',
        requirement: 100,
        reward: 'Agriculture Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Agricultural Oracle',
        requirement: 200,
        reward: 'Agriculture Oracle NFT',
        multiplier: 2.0
      }
    ]
  },
  WATER: {
    name: 'Water Conservation',
    tiers: [
      {
        level: 1,
        name: 'Water Saver',
        requirement: 100,
        reward: 'Water Novice NFT',
        multiplier: 1.1
      },
      {
        level: 2,
        name: 'Stream Guardian',
        requirement: 500,
        reward: 'Water Expert NFT',
        multiplier: 1.25
      },
      {
        level: 3,
        name: 'River Keeper',
        requirement: 1000,
        reward: 'Water Legend NFT',
        multiplier: 1.5
      },
      {
        level: 4,
        name: 'Aqua Oracle',
        requirement: 5000,
        reward: 'Water Oracle NFT',
        multiplier: 2.0
      }
    ]
  },
  QUANTUM_MASTERY: {
    name: 'Quantum Environmental Solutions',
    tiers: [
      {
        level: 1,
        name: 'Quantum Observer',
        requirement: 5,
        reward: 'Quantum Novice NFT',
        multiplier: 1.2
      },
      {
        level: 2,
        name: 'Quantum Manipulator',
        requirement: 25,
        reward: 'Quantum Expert NFT',
        multiplier: 1.4
      },
      {
        level: 3,
        name: 'Quantum Engineer',
        requirement: 50,
        reward: 'Quantum Legend NFT',
        multiplier: 1.8
      },
      {
        level: 4,
        name: 'Quantum Oracle',
        requirement: 100,
        reward: 'Quantum Oracle NFT',
        multiplier: 2.5
      }
    ]
  },
  COSMIC_GUARDIAN: {
    name: 'Cosmic Environmental Protection',
    tiers: [
      {
        level: 1,
        name: 'Star Gazer',
        requirement: 10,
        reward: 'Cosmic Novice NFT',
        multiplier: 1.3
      },
      {
        level: 2,
        name: 'Constellation Keeper',
        requirement: 50,
        reward: 'Cosmic Expert NFT',
        multiplier: 1.6
      },
      {
        level: 3,
        name: 'Galaxy Protector',
        requirement: 100,
        reward: 'Cosmic Legend NFT',
        multiplier: 2.0
      },
      {
        level: 4,
        name: 'Universal Oracle',
        requirement: 200,
        reward: 'Cosmic Oracle NFT',
        multiplier: 3.0
      }
    ]
  }
};

function AchievementTiers() {
  const { connected } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    // Simulate progress (replace with actual data from your program)
    setProgress({
      RECYCLING: 750,
      ENERGY: 3000,
      WILDLIFE: 75,
      COMMUNITY: 30,
      INNOVATION: 20,
      EDUCATION: 10,
      AGRICULTURE: 50,
      WATER: 200,
      QUANTUM_MASTERY: 0,
      COSMIC_GUARDIAN: 0
    });
  }, []);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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

  const progressBarStyle = {
    width: '100%',
    height: '8px',
    backgroundColor: '#1a1c20',
    borderRadius: '4px',
    marginTop: '1rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const progressFillStyle = (current, target) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${Math.min((current / target) * 100, 100)}%`,
    backgroundColor: '#4CAF50',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  });

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

  const getCurrentTier = (category) => {
    const tiers = ACHIEVEMENT_TIERS[category].tiers;
    const currentProgress = progress[category] || 0;
    
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (currentProgress >= tiers[i].requirement) {
        return tiers[i];
      }
    }
    return null;
  };

  const getNextTier = (category) => {
    const tiers = ACHIEVEMENT_TIERS[category].tiers;
    const currentProgress = progress[category] || 0;
    
    for (let tier of tiers) {
      if (currentProgress < tier.requirement) {
        return tier;
      }
    }
    return null;
  };

  const TierModal = ({ category, onClose }) => {
    const categoryData = ACHIEVEMENT_TIERS[category];
    const currentProgress = progress[category] || 0;

    return (
      <>
        <div style={overlayStyle} onClick={onClose} />
        <div style={modalStyle}>
          <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{categoryData.name} Tiers</h3>
          
          {categoryData.tiers.map((tier, index) => {
            const isCompleted = currentProgress >= tier.requirement;
            const isActive = currentProgress < tier.requirement;
            
            return (
              <div key={index} style={{
                backgroundColor: '#282c34',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: `1px solid ${isCompleted ? '#4CAF50' : '#666'}`
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{ 
                    color: isCompleted ? '#4CAF50' : '#888',
                    margin: 0
                  }}>
                    {tier.name}
                  </h4>
                  <span style={{ 
                    color: isCompleted ? '#4CAF50' : '#666',
                    fontSize: '0.9rem'
                  }}>
                    Level {tier.level}
                  </span>
                </div>

                <p style={{ color: '#888', marginBottom: '0.5rem' }}>
                  Requirement: {tier.requirement} {category.toLowerCase()}
                </p>

                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  <span>Reward: {tier.reward}</span>
                  <span>×{tier.multiplier} Multiplier</span>
                </div>

                {isActive && (
                  <div style={progressBarStyle}>
                    <div style={progressFillStyle(currentProgress, tier.requirement)} />
                  </div>
                )}
              </div>
            );
          })}

          <button style={buttonStyle} onClick={onClose}>Close</button>
        </div>
      </>
    );
  };

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Achievement Tiers</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to view achievement tiers
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#4CAF50', marginBottom: '1.5rem' }}>Achievement Tiers</h2>

      <div style={gridStyle}>
        {Object.entries(ACHIEVEMENT_TIERS).map(([key, category]) => {
          const currentTier = getCurrentTier(key);
          const nextTier = getNextTier(key);
          
          return (
            <div
              key={key}
              style={{
                ...cardStyle,
                transform: selectedCategory === key ? 'scale(1.02)' : 'scale(1)'
              }}
              onClick={() => setSelectedCategory(key)}
            >
              <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{category.name}</h4>
              
              {currentTier && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#888' }}>Current Tier:</p>
                  <p style={{ color: '#4CAF50' }}>{currentTier.name}</p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    ×{currentTier.multiplier} Multiplier
                  </p>
                </div>
              )}

              {nextTier && (
                <>
                  <p style={{ color: '#888' }}>Next Tier: {nextTier.name}</p>
                  <div style={progressBarStyle}>
                    <div style={progressFillStyle(
                      progress[key] || 0,
                      nextTier.requirement
                    )} />
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {progress[key] || 0} / {nextTier.requirement}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedCategory && (
        <TierModal 
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}

export default AchievementTiers;
