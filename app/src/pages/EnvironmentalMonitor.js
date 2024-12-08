import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Notification } from '../components/Notification';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import '../styles/Collectors.css';
import {
  TREE_DATA,
  FOREST_DATA,
  THREAT_DATA,
  DISASTER_DATA,
  WEATHER_DATA,
  WILDLIFE_DATA
} from '../models/EnvironmentalData';
import GeoMedia from '../components/GeoMedia';

function EnvironmentalMonitor() {
  const { connected, wallet, connection } = useWallet();
  const [formData, setFormData] = useState({
    monitoringType: '',
    location: '',
    description: '',
    date: new Date('2024-12-07T14:29:42+08:00').toISOString().split('T')[0],
    // Tree data
    treeSpecies: '',
    treeHealth: '',
    treeEndemism: '',
    treeConservation: '',
    // Forest data
    forestPresence: '',
    forestType: '',
    forestCover: '',
    landcoverType: '',
    forestProgression: '',
    // Threat data
    threatType: '',
    threatSeverity: '',
    threatStatus: '',
    // Disaster data
    disasterType: '',
    disasterSeverity: '',
    disasterImpact: '',
    // Weather data
    weatherCondition: '',
    rainIntensity: '',
    rainDuration: '',
    windStrength: '',
    // Wildlife data
    wildlifeSpecies: '',
    wildlifeHealth: '',
    wildlifeEndemism: '',
    wildlifeConservation: '',
    wildlifeActivity: '',
    photos: [],
    audios: []
  });

  const [notification, setNotification] = useState({
    message: '',
    type: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const monitoringTypes = [
    { value: 'tree', label: 'Tree Monitoring' },
    { value: 'forest', label: 'Forest Assessment' },
    { value: 'threat', label: 'Threat Detection' },
    { value: 'disaster', label: 'Disaster Recording' },
    { value: 'weather', label: 'Weather & Phenomena' },
    { value: 'wildlife', label: 'Wildlife Observation' }
  ];

  const validateForm = () => {
    const errors = [];
    
    if (!formData.monitoringType) {
      errors.push('Please select a monitoring type');
    }
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (formData.description.length < 10) errors.push('Description must be at least 10 characters');

    // Validate monitoring-specific fields
    switch (formData.monitoringType) {
      case 'tree':
        if (!formData.treeSpecies) errors.push('Tree species is required');
        if (!formData.treeHealth) errors.push('Tree health status is required');
        break;
      case 'forest':
        if (!formData.forestPresence) errors.push('Forest presence is required');
        if (!formData.forestType) errors.push('Forest type is required');
        break;
      case 'threat':
        if (!formData.threatType) errors.push('Threat type is required');
        if (!formData.threatSeverity) errors.push('Threat severity is required');
        break;
      case 'disaster':
        if (!formData.disasterType) errors.push('Disaster type is required');
        if (!formData.disasterSeverity) errors.push('Disaster severity is required');
        break;
      case 'weather':
        if (!formData.weatherCondition) errors.push('Weather condition is required');
        break;
      case 'wildlife':
        if (!formData.wildlifeSpecies) errors.push('Wildlife species is required');
        if (!formData.wildlifeActivity) errors.push('Wildlife activity is required');
        break;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected || !wallet) {
      setNotification({
        message: 'Please connect your wallet first',
        type: 'warning'
      });
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setNotification({
        message: errors[0],
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: LAMPORTS_PER_SOL * 0.001
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      setNotification({
        message: `Environmental data recorded successfully! Transaction: ${signature.slice(0, 8)}...`,
        type: 'success'
      });

      // Reset form
      setFormData({
        monitoringType: '',
        location: '',
        description: '',
        date: new Date('2024-12-07T14:29:42+08:00').toISOString().split('T')[0],
        treeSpecies: '',
        treeHealth: '',
        treeEndemism: '',
        treeConservation: '',
        forestPresence: '',
        forestType: '',
        forestCover: '',
        landcoverType: '',
        forestProgression: '',
        threatType: '',
        threatSeverity: '',
        threatStatus: '',
        disasterType: '',
        disasterSeverity: '',
        disasterImpact: '',
        weatherCondition: '',
        rainIntensity: '',
        rainDuration: '',
        windStrength: '',
        wildlifeSpecies: '',
        wildlifeHealth: '',
        wildlifeEndemism: '',
        wildlifeConservation: '',
        wildlifeActivity: '',
        photos: [],
        audios: []
      });

    } catch (error) {
      console.error('Transaction error:', error);
      setNotification({
        message: error.message || 'Failed to record environmental data',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoCapture = (metadata) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, metadata]
    }));
  };

  const handleAudioCapture = (metadata) => {
    setFormData(prev => ({
      ...prev,
      audios: [...prev.audios, metadata]
    }));
  };

  const renderMonitoringFields = () => {
    switch (formData.monitoringType) {
      case 'tree':
        return (
          <>
            <div className="form-group">
              <label>Species</label>
              <input
                type="text"
                name="treeSpecies"
                value={formData.treeSpecies}
                onChange={handleInputChange}
                placeholder="Enter tree species"
              />
            </div>
            <div className="form-group">
              <label>Health Status</label>
              <select
                name="treeHealth"
                value={formData.treeHealth}
                onChange={handleInputChange}
              >
                <option value="">Select health status</option>
                {TREE_DATA.HEALTH_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Endemism</label>
              <select
                name="treeEndemism"
                value={formData.treeEndemism}
                onChange={handleInputChange}
              >
                <option value="">Select endemism status</option>
                {TREE_DATA.ENDEMISM.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Conservation Status</label>
              <select
                name="treeConservation"
                value={formData.treeConservation}
                onChange={handleInputChange}
              >
                <option value="">Select conservation status</option>
                {TREE_DATA.CONSERVATION_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'forest':
        return (
          <>
            <div className="form-group">
              <label>Forest Presence</label>
              <select
                name="forestPresence"
                value={formData.forestPresence}
                onChange={handleInputChange}
              >
                <option value="">Select presence status</option>
                {FOREST_DATA.PRESENCE.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Forest Type</label>
              <select
                name="forestType"
                value={formData.forestType}
                onChange={handleInputChange}
              >
                <option value="">Select forest type</option>
                {FOREST_DATA.FOREST_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Forest Cover</label>
              <select
                name="forestCover"
                value={formData.forestCover}
                onChange={handleInputChange}
              >
                <option value="">Select forest cover</option>
                {FOREST_DATA.FOREST_COVER.map(cover => (
                  <option key={cover} value={cover}>{cover}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Landcover Type</label>
              <select
                name="landcoverType"
                value={formData.landcoverType}
                onChange={handleInputChange}
              >
                <option value="">Select landcover type</option>
                {FOREST_DATA.LANDCOVER_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Forest Progression</label>
              <select
                name="forestProgression"
                value={formData.forestProgression}
                onChange={handleInputChange}
              >
                <option value="">Select progression type</option>
                {FOREST_DATA.PROGRESSION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'threat':
        return (
          <>
            <div className="form-group">
              <label>Threat Type</label>
              <select
                name="threatType"
                value={formData.threatType}
                onChange={handleInputChange}
              >
                <option value="">Select threat type</option>
                {THREAT_DATA.TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select
                name="threatSeverity"
                value={formData.threatSeverity}
                onChange={handleInputChange}
              >
                <option value="">Select severity</option>
                {THREAT_DATA.SEVERITY.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="threatStatus"
                value={formData.threatStatus}
                onChange={handleInputChange}
              >
                <option value="">Select status</option>
                {THREAT_DATA.STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'disaster':
        return (
          <>
            <div className="form-group">
              <label>Disaster Type</label>
              <select
                name="disasterType"
                value={formData.disasterType}
                onChange={handleInputChange}
              >
                <option value="">Select disaster type</option>
                {DISASTER_DATA.TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select
                name="disasterSeverity"
                value={formData.disasterSeverity}
                onChange={handleInputChange}
              >
                <option value="">Select severity</option>
                {DISASTER_DATA.SEVERITY.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Impact</label>
              <select
                name="disasterImpact"
                value={formData.disasterImpact}
                onChange={handleInputChange}
              >
                <option value="">Select impact level</option>
                {DISASTER_DATA.IMPACT.map(impact => (
                  <option key={impact} value={impact}>{impact}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'weather':
        return (
          <>
            <div className="form-group">
              <label>Weather Condition</label>
              <select
                name="weatherCondition"
                value={formData.weatherCondition}
                onChange={handleInputChange}
              >
                <option value="">Select weather condition</option>
                {WEATHER_DATA.CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Rain Intensity</label>
              <select
                name="rainIntensity"
                value={formData.rainIntensity}
                onChange={handleInputChange}
              >
                <option value="">Select rain intensity</option>
                {WEATHER_DATA.RAIN.INTENSITY.map(intensity => (
                  <option key={intensity} value={intensity}>{intensity}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Rain Duration</label>
              <select
                name="rainDuration"
                value={formData.rainDuration}
                onChange={handleInputChange}
              >
                <option value="">Select rain duration</option>
                {WEATHER_DATA.RAIN.DURATION.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Wind Strength</label>
              <select
                name="windStrength"
                value={formData.windStrength}
                onChange={handleInputChange}
              >
                <option value="">Select wind strength</option>
                {WEATHER_DATA.WIND.STRENGTH.map(strength => (
                  <option key={strength} value={strength}>{strength}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'wildlife':
        return (
          <>
            <div className="form-group">
              <label>Species</label>
              <input
                type="text"
                name="wildlifeSpecies"
                value={formData.wildlifeSpecies}
                onChange={handleInputChange}
                placeholder="Enter wildlife species"
              />
            </div>
            <div className="form-group">
              <label>Health Status</label>
              <select
                name="wildlifeHealth"
                value={formData.wildlifeHealth}
                onChange={handleInputChange}
              >
                <option value="">Select health status</option>
                {WILDLIFE_DATA.HEALTH_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Endemism</label>
              <select
                name="wildlifeEndemism"
                value={formData.wildlifeEndemism}
                onChange={handleInputChange}
              >
                <option value="">Select endemism status</option>
                {WILDLIFE_DATA.ENDEMISM.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Conservation Status</label>
              <select
                name="wildlifeConservation"
                value={formData.wildlifeConservation}
                onChange={handleInputChange}
              >
                <option value="">Select conservation status</option>
                {WILDLIFE_DATA.CONSERVATION_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Activity</label>
              <select
                name="wildlifeActivity"
                value={formData.wildlifeActivity}
                onChange={handleInputChange}
              >
                <option value="">Select activity</option>
                {WILDLIFE_DATA.ACTIVITIES.map(activity => (
                  <option key={activity} value={activity}>{activity}</option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="environmental-monitor-container">
      <h2>Environmental Monitoring</h2>
      
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}

      <form onSubmit={handleSubmit} className="monitoring-form">
        <div className="form-group">
          <label>Monitoring Type</label>
          <select
            name="monitoringType"
            value={formData.monitoringType}
            onChange={handleInputChange}
          >
            <option value="">Select monitoring type</option>
            {monitoringTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {formData.monitoringType && renderMonitoringFields()}

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter location"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter detailed description"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-section">
          <h3>Media Documentation</h3>
          <GeoMedia
            onPhotoCapture={handlePhotoCapture}
            onAudioCapture={handleAudioCapture}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || !connected}
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
          >
            {isSubmitting ? 'Recording...' : 'Record Observation'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EnvironmentalMonitor;
