import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const GOVERNANCE_FEATURES = {
  PROPOSAL_TYPES: {
    CHAIN_INTEGRATION: {
      name: 'Chain Integration',
      description: 'Propose new blockchain integration',
      requirements: {
        minPoints: 50000,
        minStake: 1000,
        supportThreshold: 0.75
      },
      executionDelay: 72, // hours
      vetoThreshold: 0.25
    },
    BREEDING_RULES: {
      name: 'Breeding System Update',
      description: 'Modify NFT breeding mechanics',
      requirements: {
        minPoints: 75000,
        minStake: 2000,
        supportThreshold: 0.8
      },
      executionDelay: 48,
      vetoThreshold: 0.3
    },
    REWARD_DISTRIBUTION: {
      name: 'Reward Distribution',
      description: 'Modify reward distribution parameters',
      requirements: {
        minPoints: 100000,
        minStake: 5000,
        supportThreshold: 0.85
      },
      executionDelay: 96,
      vetoThreshold: 0.4
    },
    ACHIEVEMENT_SYSTEM: {
      name: 'Achievement System',
      description: 'Update achievement mechanics',
      requirements: {
        minPoints: 60000,
        minStake: 1500,
        supportThreshold: 0.7
      },
      executionDelay: 24,
      vetoThreshold: 0.2
    },
    EMERGENCY_ACTION: {
      name: 'Emergency Action',
      description: 'Critical system modifications',
      requirements: {
        minPoints: 200000,
        minStake: 10000,
        supportThreshold: 0.9
      },
      executionDelay: 12,
      vetoThreshold: 0.15
    },
    PARTNERSHIP: {
      name: 'Partnership Proposal',
      description: 'Establish new partnership',
      requirements: {
        minPoints: 80000,
        minStake: 3000,
        supportThreshold: 0.75
      },
      executionDelay: 120,
      vetoThreshold: 0.35
    }
  },

  VOTING_POWER_TIERS: {
    NOVICE: {
      minPoints: 1000,
      multiplier: 1.0,
      maxVotesPerDay: 5
    },
    ADEPT: {
      minPoints: 10000,
      multiplier: 1.5,
      maxVotesPerDay: 10
    },
    EXPERT: {
      minPoints: 50000,
      multiplier: 2.0,
      maxVotesPerDay: 20
    },
    MASTER: {
      minPoints: 100000,
      multiplier: 3.0,
      maxVotesPerDay: 30
    },
    ORACLE: {
      minPoints: 250000,
      multiplier: 5.0,
      maxVotesPerDay: 50
    },
    GRAND_ORACLE: {
      minPoints: 500000,
      multiplier: 10.0,
      maxVotesPerDay: 100
    }
  },

  QUORUM_REQUIREMENTS: {
    STANDARD: {
      minParticipation: 0.2,
      minApproval: 0.51,
      executionDelay: 48
    },
    IMPORTANT: {
      minParticipation: 0.3,
      minApproval: 0.65,
      executionDelay: 72
    },
    CRITICAL: {
      minParticipation: 0.4,
      minApproval: 0.75,
      executionDelay: 96
    },
    EMERGENCY: {
      minParticipation: 0.15,
      minApproval: 0.85,
      executionDelay: 24
    }
  },

  PROPOSAL_TEMPLATES: {
    CHAIN_INTEGRATION: {
      title: 'New Chain Integration Proposal',
      sections: [
        'Chain Technical Details',
        'Integration Benefits',
        'Resource Requirements',
        'Timeline',
        'Security Considerations'
      ],
      requiredFields: [
        'chainName',
        'chainType',
        'consensusMechanism',
        'estimatedCost',
        'implementationTime'
      ]
    },
    BREEDING_UPDATE: {
      title: 'Breeding Mechanics Update',
      sections: [
        'Current Issues',
        'Proposed Changes',
        'Impact Analysis',
        'Testing Plan',
        'Rollback Plan'
      ],
      requiredFields: [
        'affectedPairs',
        'newMechanics',
        'expectedOutcome',
        'testingDuration'
      ]
    },
    REWARD_MODIFICATION: {
      title: 'Reward System Modification',
      sections: [
        'Current Distribution',
        'Proposed Changes',
        'Economic Impact',
        'Implementation Plan',
        'Monitoring Metrics'
      ],
      requiredFields: [
        'rewardType',
        'newDistribution',
        'economicProjections',
        'implementationSteps'
      ]
    }
  },

  GOVERNANCE_REWARDS: {
    PROPOSAL_CREATION: {
      basePoints: 100,
      bonusMultiplier: 1.5,
      nftReward: 'Governance Contributor'
    },
    VOTING_PARTICIPATION: {
      basePoints: 50,
      streakBonus: 1.1,
      maxStreak: 10
    },
    SUCCESSFUL_PROPOSAL: {
      basePoints: 500,
      impactMultiplier: 2.0,
      nftReward: 'Master Proposer'
    }
  },

  SPECIAL_POWERS: {
    ORACLE_VETO: {
      requirement: 'ORACLE tier or higher',
      cooldown: 168, // hours
      maxUses: 3
    },
    EMERGENCY_PROPOSAL: {
      requirement: 'GRAND_ORACLE tier',
      cooldown: 336,
      maxUses: 1
    },
    PROPOSAL_BOOST: {
      requirement: 'MASTER tier or higher',
      effect: 'Reduce execution delay by 50%',
      cooldown: 72
    }
  }
};

const ADVANCED_PROPOSAL_TYPES = {
  QUANTUM_INITIATIVE: {
    name: 'Quantum Environmental Initiative',
    description: 'Proposals leveraging quantum mechanics for environmental impact',
    requirements: {
      proposerLevel: 'Quantum Master',
      minStake: 1000,
      supportThreshold: 0.75,
      quorumThreshold: 0.6
    },
    votingPeriod: '7 days',
    executionDelay: '48 hours',
    rewards: {
      proposer: 500,
      voters: 100,
      implementers: 1000
    }
  },
  COSMIC_DIRECTIVE: {
    name: 'Cosmic Environmental Directive',
    description: 'Proposals harnessing cosmic forces for environmental protection',
    requirements: {
      proposerLevel: 'Cosmic Guardian',
      minStake: 2000,
      supportThreshold: 0.8,
      quorumThreshold: 0.7
    },
    votingPeriod: '14 days',
    executionDelay: '72 hours',
    rewards: {
      proposer: 1000,
      voters: 200,
      implementers: 2000
    }
  }
};

const GOVERNANCE_POWERS = {
  QUANTUM_VETO: {
    name: 'Quantum Veto Power',
    description: 'Ability to veto proposals through quantum consensus',
    requirements: {
      level: 'Quantum Oracle',
      achievements: ['Quantum Master', 'Reality Weaver'],
      tokens: 5000
    },
    cooldown: '30 days',
    effects: {
      vetoStrength: 2.5,
      consensusBonus: 1.5,
      reputationImpact: 'High'
    }
  },
  COSMIC_OVERRIDE: {
    name: 'Cosmic Override',
    description: 'Power to override normal governance rules in emergencies',
    requirements: {
      level: 'Cosmic Oracle',
      achievements: ['Universal Guardian', 'Cosmic Master'],
      tokens: 10000
    },
    cooldown: '60 days',
    effects: {
      overrideStrength: 3.0,
      emergencyPowers: true,
      reputationImpact: 'Extreme'
    }
  }
};

const VOTING_MECHANISMS = {
  QUADRATIC_QUANTUM: {
    name: 'Quadratic Quantum Voting',
    description: 'Voting power scales with square root of quantum tokens',
    formula: 'sqrt(quantum_tokens) * base_power',
    modifiers: {
      achievementBonus: 1.2,
      timeBonus: 1.1,
      stakingMultiplier: 1.5
    }
  },
  COSMIC_WEIGHTED: {
    name: 'Cosmic Weighted Voting',
    description: 'Voting power influenced by cosmic alignment and achievements',
    formula: 'cosmic_alignment * achievement_level * base_power',
    modifiers: {
      alignmentBonus: 2.0,
      achievementMultiplier: 1.8,
      timeDecay: 0.9
    }
  }
};

const GOVERNANCE_REWARDS = {
  PROPOSAL_CREATION: {
    base: 100,
    modifiers: {
      complexity: 1.5,
      urgency: 1.3,
      impact: 2.0
    },
    bonuses: {
      firstProposal: 500,
      successfulExecution: 1000,
      communitySupport: 750
    }
  },
  VOTING_PARTICIPATION: {
    base: 50,
    modifiers: {
      votingStreak: 1.2,
      stakingAmount: 1.4,
      analysisQuality: 1.6
    },
    bonuses: {
      perfectAttendance: 300,
      minorityVoter: 200,
      earlyVoter: 150
    }
  }
};

const EMERGENCY_PROTOCOLS = {
  QUANTUM_CRISIS: {
    triggers: ['Severe quantum imbalance', 'Critical environmental threat'],
    powers: {
      fastTrackProposals: true,
      emergencyVoting: true,
      quantumIntervention: true
    },
    safeguards: {
      multiSigRequired: true,
      timeLimit: '24 hours',
      auditRequired: true
    }
  },
  COSMIC_EMERGENCY: {
    triggers: ['Cosmic disturbance', 'Universal anomaly'],
    powers: {
      instantExecution: true,
      cosmicOverride: true,
      universalVeto: true
    },
    safeguards: {
      oracleConsensus: true,
      timeLimit: '12 hours',
      publicDisclosure: true
    }
  }
};

const GOVERNANCE_CONFIG = {
  QUANTUM_CHAIN: {
    id: 'QC001',
    type: 'PROTOCOL_UPGRADE',
    status: 'ACTIVE',
    proposer: '0x1234...5678',
    description: 'Implement quantum-secured voting',
    votingPeriod: 72,
    executionDelay: 24,
    vetoPeriod: 12
  },
  COSMIC_BRIDGE: {
    id: 'CB001',
    type: 'BRIDGE_UPGRADE',
    status: 'PENDING',
    proposer: '0x9876...4321',
    description: 'Add cosmic bridge protocol',
    votingPeriod: 48,
    executionDelay: 24,
    vetoPeriod: 12
  }
};

const ACTIVE_PROPOSALS = [
  {
    id: 'QC001',
    type: 'CHAIN_INTEGRATION',
    title: 'Quantum Chain Integration',
    description: 'Integrate quantum-resistant blockchain',
    proposer: '0x123...abc',
    status: 'ACTIVE',
    votes: {
      for: 75000,
      against: 15000,
      abstain: 10000
    },
    quorum: 'CRITICAL',
    timeRemaining: 48,
    specialPowers: ['ORACLE_VETO']
  },
  {
    id: 'EP001',
    type: 'PARTNERSHIP',
    title: 'Global Eco Foundation Partnership',
    description: 'Strategic partnership for global impact',
    proposer: '0x456...def',
    status: 'ACTIVE',
    votes: {
      for: 95000,
      against: 5000,
      abstain: 5000
    },
    quorum: 'IMPORTANT',
    timeRemaining: 72,
    specialPowers: ['PROPOSAL_BOOST']
  }
];

const MOCK_PROPOSALS = [
  {
    id: 1,
    title: 'Add Electric Vehicle Charging Activity',
    type: 'NEW_ACTIVITY',
    description: 'Introduce a new activity type for tracking EV charging sessions',
    creator: '0x1234...5678',
    startTime: new Date('2024-12-01'),
    endTime: new Date('2024-12-14'),
    status: 'active',
    votes: {
      for: 15000,
      against: 5000,
      abstain: 1000
    },
    details: {
      pointsPerCharge: 100,
      minimumChargeDuration: 30,
      maxDailyPoints: 300
    },
    quorumRequired: 20000,
    executionDelay: 48, // hours
    vetoPeriod: 24 // hours
  },
  {
    id: 2,
    title: 'Increase Wildlife Protection Points',
    type: 'POINT_SYSTEM',
    description: 'Proposal to increase point rewards for wildlife protection activities by 50%',
    creator: '0x9876...4321',
    startTime: new Date('2024-12-05'),
    endTime: new Date('2024-12-19'),
    status: 'active',
    votes: {
      for: 25000,
      against: 3000,
      abstain: 2000
    },
    details: {
      currentMultiplier: 1,
      proposedMultiplier: 1.5,
      affectedActivities: ['Wildlife Monitoring', 'Habitat Restoration']
    },
    quorumRequired: 25000,
    executionDelay: 72,
    vetoPeriod: 48
  },
  {
    id: 3,
    title: 'Add Cardano Chain Integration',
    type: 'CHAIN_INTEGRATION',
    description: 'Proposal to integrate Cardano blockchain for cross-chain activities',
    creator: '0xabcd...efgh',
    startTime: new Date('2024-12-06'),
    endTime: new Date('2024-12-20'),
    status: 'active',
    votes: {
      for: 35000,
      against: 2000,
      abstain: 3000
    },
    details: {
      chain: 'Cardano',
      features: ['NFT Bridge', 'Token Bridge', 'Activity Sync'],
      technicalRequirements: ['Smart Contract Integration', 'Bridge Protocol']
    },
    quorumRequired: 30000,
    executionDelay: 96,
    vetoPeriod: 72
  },
  {
    id: 4,
    title: 'Emergency Climate Action Fund',
    type: 'EMERGENCY_ACTION',
    description: 'Create an emergency fund for immediate climate action responses',
    creator: '0xijkl...mnop',
    startTime: new Date('2024-12-07'),
    endTime: new Date('2024-12-10'),
    status: 'active',
    votes: {
      for: 45000,
      against: 1000,
      abstain: 500
    },
    details: {
      fundSize: '1000000 USDC',
      useCase: 'Rapid Response to Environmental Emergencies',
      governance: 'Multi-sig with Environmental Experts'
    },
    quorumRequired: 40000,
    executionDelay: 24,
    vetoPeriod: 12
  }
];

function Governance() {
  const { connected } = useWallet();
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [newProposalModal, setNewProposalModal] = useState(false);
  const [userVotingPower, setUserVotingPower] = useState(0);

  useEffect(() => {
    // Simulate fetching user's voting power
    setUserVotingPower(7500); // Example value
  }, []);

  const containerStyle = {
    backgroundColor: '#1a1c20',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem'
  };

  const cardStyle = {
    backgroundColor: '#282c34',
    borderRadius: '8px',
    padding: '1.5rem',
    border: '1px solid #4CAF50',
    marginBottom: '1rem',
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
    maxWidth: '800px',
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
    marginRight: '0.5rem'
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

  const getVotingPowerTier = (points) => {
    for (const [tier, data] of Object.entries(GOVERNANCE_FEATURES.VOTING_POWER_TIERS).reverse()) {
      if (points >= data.minPoints) {
        return { tier, ...data };
      }
    }
    return { tier: 'NOVICE', ...GOVERNANCE_FEATURES.VOTING_POWER_TIERS.NOVICE };
  };

  const calculateProgress = (votes) => {
    const total = votes.for + votes.against + votes.abstain;
    return {
      for: (votes.for / total) * 100,
      against: (votes.against / total) * 100,
      abstain: (votes.abstain / total) * 100
    };
  };

  const ProposalModal = ({ proposal, onClose }) => {
    const progress = calculateProgress(proposal.votes);
    const [vote, setVote] = useState(null);

    return (
      <>
        <div style={overlayStyle} onClick={onClose} />
        <div style={modalStyle}>
          <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>{proposal.title}</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ 
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              {proposal.type}
            </span>
          </div>

          <p style={{ color: '#888', marginBottom: '1.5rem' }}>
            {proposal.description}
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Details</h4>
            {Object.entries(proposal.details).map(([key, value]) => (
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

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Voting Progress</h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#4CAF50' }}>For: {proposal.votes.for.toLocaleString()}</span>
                <span>{progress.for.toFixed(1)}%</span>
              </div>
              <div style={progressBarStyle}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progress.for}%`,
                  backgroundColor: '#4CAF50'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#ff4444' }}>Against: {proposal.votes.against.toLocaleString()}</span>
                <span>{progress.against.toFixed(1)}%</span>
              </div>
              <div style={progressBarStyle}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progress.against}%`,
                  backgroundColor: '#ff4444'
                }} />
              </div>
            </div>

            <div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#888' }}>Abstain: {proposal.votes.abstain.toLocaleString()}</span>
                <span>{progress.abstain.toFixed(1)}%</span>
              </div>
              <div style={progressBarStyle}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progress.abstain}%`,
                  backgroundColor: '#888'
                }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>Your Voting Power</h4>
            <p style={{ color: '#888' }}>
              {userVotingPower.toLocaleString()} votes ({getVotingPowerTier(userVotingPower).tier})
            </p>
          </div>

          <div style={{ 
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: vote === 'for' ? '#4CAF50' : '#282c34',
                flex: 1
              }}
              onClick={() => setVote('for')}
            >
              Vote For
            </button>
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: vote === 'against' ? '#ff4444' : '#282c34',
                flex: 1
              }}
              onClick={() => setVote('against')}
            >
              Vote Against
            </button>
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: vote === 'abstain' ? '#888' : '#282c34',
                flex: 1
              }}
              onClick={() => setVote('abstain')}
            >
              Abstain
            </button>
          </div>

          <button 
            style={{
              ...buttonStyle,
              width: '100%',
              opacity: vote ? 1 : 0.5,
              cursor: vote ? 'pointer' : 'not-allowed'
            }}
            disabled={!vote}
            onClick={() => {
              alert('Voting functionality coming soon!');
              onClose();
            }}
          >
            Submit Vote
          </button>
        </div>
      </>
    );
  };

  const NewProposalModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
      title: '',
      type: Object.keys(GOVERNANCE_FEATURES.PROPOSAL_TYPES)[0],
      description: '',
      details: {}
    });

    const inputStyle = {
      backgroundColor: '#282c34',
      border: '1px solid #4CAF50',
      borderRadius: '4px',
      padding: '0.5rem',
      color: 'white',
      width: '100%',
      marginBottom: '1rem'
    };

    return (
      <>
        <div style={overlayStyle} onClick={onClose} />
        <div style={modalStyle}>
          <h3 style={{ color: '#4CAF50', marginBottom: '1.5rem' }}>Create New Proposal</h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>
              Title
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter proposal title"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>
              Type
            </label>
            <select
              style={inputStyle}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {Object.entries(GOVERNANCE_FEATURES.PROPOSAL_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>
              Description
            </label>
            <textarea
              style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter proposal description"
            />
          </div>

          <button 
            style={buttonStyle}
            onClick={() => {
              alert('Proposal creation coming soon!');
              onClose();
            }}
          >
            Create Proposal
          </button>
        </div>
      </>
    );
  };

  if (!connected) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Governance</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Connect your wallet to participate in governance
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ color: '#4CAF50', margin: 0 }}>Governance</h2>
        <button 
          style={buttonStyle}
          onClick={() => setNewProposalModal(true)}
        >
          Create Proposal
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Your Voting Power</h3>
        <div style={{
          backgroundColor: '#282c34',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #4CAF50'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ color: '#888', marginBottom: '0.5rem' }}>
                Current Voting Power
              </p>
              <p style={{ color: '#4CAF50', fontSize: '1.5rem', margin: 0 }}>
                {userVotingPower.toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#888', marginBottom: '0.5rem' }}>
                Tier
              </p>
              <p style={{ color: '#4CAF50', fontSize: '1.5rem', margin: 0 }}>
                {getVotingPowerTier(userVotingPower).tier}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Active Proposals</h3>
      
      {proposals.map(proposal => {
        const progress = calculateProgress(proposal.votes);
        
        return (
          <div
            key={proposal.id}
            style={{
              ...cardStyle,
              transform: selectedProposal?.id === proposal.id ? 'scale(1.02)' : 'scale(1)'
            }}
            onClick={() => setSelectedProposal(proposal)}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div>
                <h4 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>
                  {proposal.title}
                </h4>
                <span style={{ 
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  {proposal.type}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                  Ends in {Math.ceil((proposal.endTime - new Date()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>

            <p style={{ color: '#888', marginBottom: '1rem' }}>
              {proposal.description}
            </p>

            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem'
              }}>
                <span style={{ color: '#4CAF50' }}>For</span>
                <span>{progress.for.toFixed(1)}%</span>
              </div>
              <div style={progressBarStyle}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progress.for}%`,
                  backgroundColor: '#4CAF50'
                }} />
              </div>
            </div>
          </div>
        );
      })}

      {selectedProposal && (
        <ProposalModal 
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      )}

      {newProposalModal && (
        <NewProposalModal
          onClose={() => setNewProposalModal(false)}
        />
      )}
    </div>
  );
}

export default Governance;
