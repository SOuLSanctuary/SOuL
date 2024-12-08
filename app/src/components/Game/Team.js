import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './Team.css';

const Team = ({ gameStateManager }) => {
    const { publicKey } = useWallet();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [inviteAddress, setInviteAddress] = useState('');
    const [createTeamName, setCreateTeamName] = useState('');
    const [createTeamDesc, setCreateTeamDesc] = useState('');

    useEffect(() => {
        if (publicKey) {
            loadTeamData();
        }
    }, [publicKey]);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            const data = await gameStateManager.getTeamData(publicKey.toString());
            setTeamData(data);
        } catch (error) {
            console.error('Failed to load team data:', error);
            setError('Failed to load team data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await gameStateManager.createTeam({
                name: createTeamName,
                description: createTeamDesc,
                leader: publicKey.toString()
            });
            loadTeamData();
            setCreateTeamName('');
            setCreateTeamDesc('');
        } catch (error) {
            console.error('Failed to create team:', error);
            setError('Failed to create team. Please try again.');
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            await gameStateManager.inviteToTeam(teamData.id, inviteAddress);
            setInviteAddress('');
            loadTeamData();
        } catch (error) {
            console.error('Failed to invite member:', error);
            setError('Failed to invite member. Please check the address and try again.');
        }
    };

    const handleLeaveTeam = async () => {
        try {
            await gameStateManager.leaveTeam(teamData.id);
            loadTeamData();
        } catch (error) {
            console.error('Failed to leave team:', error);
            setError('Failed to leave team. Please try again.');
        }
    };

    const renderTeamOverview = () => (
        <div className="team-overview">
            {teamData ? (
                <>
                    <div className="team-header">
                        <div className="team-banner">
                            <h2>{teamData.name}</h2>
                            <p>{teamData.description}</p>
                        </div>
                        <div className="team-stats">
                            <div className="team-stat">
                                <span className="stat-label">Members</span>
                                <span className="stat-value">{teamData.members.length}</span>
                            </div>
                            <div className="team-stat">
                                <span className="stat-label">Total Impact</span>
                                <span className="stat-value">{teamData.totalImpact}</span>
                            </div>
                            <div className="team-stat">
                                <span className="stat-label">Rank</span>
                                <span className="stat-value">#{teamData.rank}</span>
                            </div>
                        </div>
                    </div>

                    {teamData.isLeader && (
                        <div className="team-management">
                            <h3>Team Management</h3>
                            <form onSubmit={handleInviteMember} className="invite-form">
                                <input
                                    type="text"
                                    placeholder="Enter wallet address to invite"
                                    value={inviteAddress}
                                    onChange={(e) => setInviteAddress(e.target.value)}
                                />
                                <button type="submit">Invite Member</button>
                            </form>
                        </div>
                    )}

                    <div className="team-members">
                        <h3>Team Members</h3>
                        <div className="members-grid">
                            {teamData.members.map(member => (
                                <div key={member.address} className="member-card">
                                    <div className="member-avatar">
                                        {member.avatar || '🌟'}
                                    </div>
                                    <div className="member-info">
                                        <h4>{member.username}</h4>
                                        <p>{member.role}</p>
                                        <div className="member-contribution">
                                            <span>Impact: {member.contribution}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!teamData.isLeader && (
                        <button 
                            className="leave-team-btn"
                            onClick={handleLeaveTeam}
                        >
                            Leave Team
                        </button>
                    )}
                </>
            ) : (
                <div className="create-team">
                    <h3>Create a New Team</h3>
                    <form onSubmit={handleCreateTeam}>
                        <div className="form-group">
                            <label>Team Name</label>
                            <input
                                type="text"
                                value={createTeamName}
                                onChange={(e) => setCreateTeamName(e.target.value)}
                                placeholder="Enter team name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Team Description</label>
                            <textarea
                                value={createTeamDesc}
                                onChange={(e) => setCreateTeamDesc(e.target.value)}
                                placeholder="Describe your team's mission"
                                required
                            />
                        </div>
                        <button type="submit">Create Team</button>
                    </form>
                </div>
            )}
        </div>
    );

    const renderTeamChallenges = () => (
        <div className="team-challenges">
            <h3>Active Challenges</h3>
            <div className="challenges-grid">
                {teamData?.challenges.map(challenge => (
                    <div key={challenge.id} className="challenge-card">
                        <div className="challenge-header">
                            <h4>{challenge.title}</h4>
                            <span className={`challenge-status ${challenge.status.toLowerCase()}`}>
                                {challenge.status}
                            </span>
                        </div>
                        <p>{challenge.description}</p>
                        <div className="challenge-progress">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ 
                                        width: `${(challenge.progress / challenge.target) * 100}%`
                                    }}
                                />
                            </div>
                            <span>{challenge.progress} / {challenge.target}</span>
                        </div>
                        <div className="challenge-rewards">
                            <h5>Rewards:</h5>
                            <ul>
                                {challenge.rewards.map((reward, index) => (
                                    <li key={index}>{reward}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTeamAchievements = () => (
        <div className="team-achievements">
            <h3>Team Achievements</h3>
            <div className="achievements-grid">
                {teamData?.achievements.map(achievement => (
                    <div 
                        key={achievement.id}
                        className={`achievement-card ${achievement.unlocked ? 'unlocked' : ''}`}
                    >
                        <div className="achievement-icon">
                            {achievement.icon}
                        </div>
                        <div className="achievement-info">
                            <h4>{achievement.name}</h4>
                            <p>{achievement.description}</p>
                            {achievement.unlocked && (
                                <span className="unlock-date">
                                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="team-loading">
                <div className="loading-spinner"></div>
                <p>Loading team data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="team-error">
                <p>{error}</p>
                <button onClick={loadTeamData}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="team-container">
            <div className="team-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={activeTab === 'challenges' ? 'active' : ''}
                    onClick={() => setActiveTab('challenges')}
                >
                    Challenges
                </button>
                <button
                    className={activeTab === 'achievements' ? 'active' : ''}
                    onClick={() => setActiveTab('achievements')}
                >
                    Achievements
                </button>
            </div>

            <div className="team-content">
                {activeTab === 'overview' && renderTeamOverview()}
                {activeTab === 'challenges' && renderTeamChallenges()}
                {activeTab === 'achievements' && renderTeamAchievements()}
            </div>
        </div>
    );
};

export default Team;
