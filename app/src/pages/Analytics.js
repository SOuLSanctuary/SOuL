import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import '../styles/Analytics.css';

function Analytics() {
  const { wallet } = useWallet();
  const [timeRange, setTimeRange] = useState('month');
  const [dataType, setDataType] = useState('all');

  // Sample analytics data
  const analyticsData = {
    environmentalHealth: {
      soilQuality: {
        current: 85,
        trend: '+5%',
        historical: [80, 82, 83, 85, 84, 85]
      },
      airQuality: {
        current: 92,
        trend: '+2%',
        historical: [88, 89, 90, 91, 92, 92]
      },
      waterQuality: {
        current: 88,
        trend: '+3%',
        historical: [84, 85, 86, 87, 88, 88]
      }
    },
    biodiversityMetrics: {
      speciesCount: {
        total: 145,
        newSpecies: 12,
        endangered: 15,
        recovered: 3
      },
      habitatCoverage: {
        forest: '45%',
        wetland: '25%',
        grassland: '30%'
      }
    },
    restorationProgress: {
      activeProjects: 8,
      completedProjects: 12,
      successRate: '85%',
      areaRestored: '500ha',
      pendingProjects: 5
    },
    communityEngagement: {
      activeParticipants: 250,
      totalContributions: 1500,
      volunteerHours: 3500,
      projectParticipation: '75%'
    }
  };

  const renderEnvironmentalHealth = () => (
    <div className="analytics-section">
      <h2>Environmental Health Indicators</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Soil Quality</h3>
          <div className="metric-value">{analyticsData.environmentalHealth.soilQuality.current}%</div>
          <div className="trend positive">{analyticsData.environmentalHealth.soilQuality.trend}</div>
        </div>
        <div className="metric-card">
          <h3>Air Quality</h3>
          <div className="metric-value">{analyticsData.environmentalHealth.airQuality.current}%</div>
          <div className="trend positive">{analyticsData.environmentalHealth.airQuality.trend}</div>
        </div>
        <div className="metric-card">
          <h3>Water Quality</h3>
          <div className="metric-value">{analyticsData.environmentalHealth.waterQuality.current}%</div>
          <div className="trend positive">{analyticsData.environmentalHealth.waterQuality.trend}</div>
        </div>
      </div>
    </div>
  );

  const renderBiodiversityMetrics = () => (
    <div className="analytics-section">
      <h2>Biodiversity Analysis</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Species Overview</h3>
          <div className="metric-details">
            <div>Total Species: {analyticsData.biodiversityMetrics.speciesCount.total}</div>
            <div>New Species: {analyticsData.biodiversityMetrics.speciesCount.newSpecies}</div>
            <div>Endangered: {analyticsData.biodiversityMetrics.speciesCount.endangered}</div>
            <div>Recovered: {analyticsData.biodiversityMetrics.speciesCount.recovered}</div>
          </div>
        </div>
        <div className="metric-card">
          <h3>Habitat Distribution</h3>
          <div className="metric-details">
            <div>Forest: {analyticsData.biodiversityMetrics.habitatCoverage.forest}</div>
            <div>Wetland: {analyticsData.biodiversityMetrics.habitatCoverage.wetland}</div>
            <div>Grassland: {analyticsData.biodiversityMetrics.habitatCoverage.grassland}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestorationMetrics = () => (
    <div className="analytics-section">
      <h2>Restoration Analytics</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Project Status</h3>
          <div className="metric-details">
            <div>Active Projects: {analyticsData.restorationProgress.activeProjects}</div>
            <div>Completed: {analyticsData.restorationProgress.completedProjects}</div>
            <div>Pending: {analyticsData.restorationProgress.pendingProjects}</div>
          </div>
        </div>
        <div className="metric-card">
          <h3>Success Metrics</h3>
          <div className="metric-details">
            <div>Success Rate: {analyticsData.restorationProgress.successRate}</div>
            <div>Area Restored: {analyticsData.restorationProgress.areaRestored}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunityMetrics = () => (
    <div className="analytics-section">
      <h2>Community Engagement</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Participation Overview</h3>
          <div className="metric-details">
            <div>Active Participants: {analyticsData.communityEngagement.activeParticipants}</div>
            <div>Total Contributions: {analyticsData.communityEngagement.totalContributions}</div>
          </div>
        </div>
        <div className="metric-card">
          <h3>Engagement Metrics</h3>
          <div className="metric-details">
            <div>Volunteer Hours: {analyticsData.communityEngagement.volunteerHours}</div>
            <div>Project Participation: {analyticsData.communityEngagement.projectParticipation}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <h1>Environmental Analytics</h1>
        <div className="analytics-controls">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past Quarter</option>
            <option value="year">Past Year</option>
          </select>
          <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
            <option value="all">All Metrics</option>
            <option value="environmental">Environmental Health</option>
            <option value="biodiversity">Biodiversity</option>
            <option value="restoration">Restoration</option>
            <option value="community">Community</option>
          </select>
        </div>
      </header>

      <div className="analytics-content">
        {(dataType === 'all' || dataType === 'environmental') && renderEnvironmentalHealth()}
        {(dataType === 'all' || dataType === 'biodiversity') && renderBiodiversityMetrics()}
        {(dataType === 'all' || dataType === 'restoration') && renderRestorationMetrics()}
        {(dataType === 'all' || dataType === 'community') && renderCommunityMetrics()}
      </div>
    </div>
  );
}

export default Analytics;
