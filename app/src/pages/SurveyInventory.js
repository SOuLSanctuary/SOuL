import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import '../styles/Collectors.css';
import GeoMedia from '../components/GeoMedia';

function SurveyInventory() {
  const { wallet, sendTransaction } = useWallet();
  const [formData, setFormData] = useState({
    surveyType: '',
    location: '',
    surveyMethod: '',
    speciesObserved: [],
    habitatType: '',
    weatherConditions: '',
    equipmentUsed: '',
    notes: '',
    timestamp: '2024-12-07T14:36:57+08:00',
    photos: [],
    audios: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await sendTransaction({
        type: 'SURVEY_INVENTORY_RECORD',
        data: formData,
        fee: 0.001
      });
      alert('Survey and Inventory record submitted successfully!');
    } catch (error) {
      console.error('Error submitting survey record:', error);
      alert('Failed to submit survey record');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSpeciesAdd = (species) => {
    setFormData({
      ...formData,
      speciesObserved: [...formData.speciesObserved, {
        name: species,
        count: 0,
        timestamp: '2024-12-07T14:36:57+08:00'
      }]
    });
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

  return (
    <div className="survey-inventory-container">
      <h1>Survey and Inventory Collection</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Survey Type</label>
          <select 
            name="surveyType" 
            value={formData.surveyType}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="biodiversity">Biodiversity Survey</option>
            <option value="population">Population Count</option>
            <option value="habitat">Habitat Assessment</option>
            <option value="vegetation">Vegetation Survey</option>
            <option value="wildlife">Wildlife Inventory</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Survey Method</label>
          <select
            name="surveyMethod"
            value={formData.surveyMethod}
            onChange={handleChange}
            required
          >
            <option value="">Select Method</option>
            <option value="transect">Line Transect</option>
            <option value="quadrat">Quadrat Sampling</option>
            <option value="capture">Capture-Mark-Recapture</option>
            <option value="observation">Direct Observation</option>
            <option value="camera">Camera Trapping</option>
          </select>
        </div>

        <div className="form-group">
          <label>Habitat Type</label>
          <input
            type="text"
            name="habitatType"
            value={formData.habitatType}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Weather Conditions</label>
          <input
            type="text"
            name="weatherConditions"
            value={formData.weatherConditions}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Equipment Used</label>
          <textarea
            name="equipmentUsed"
            value={formData.equipmentUsed}
            onChange={handleChange}
            placeholder="List all equipment used in the survey"
            required
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional observations or notes"
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
          <button type="submit" className="submit-button">
            Submit Survey Record
          </button>
        </div>
      </form>
    </div>
  );
}

export default SurveyInventory;
