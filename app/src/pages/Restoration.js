import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import '../styles/Collectors.css';
import GeoMedia from '../components/GeoMedia';

function Restoration() {
  const { wallet, sendTransaction } = useWallet();
  const [formData, setFormData] = useState({
    restorationType: '',
    location: '',
    area: '',
    speciesInvolved: '',
    methodsUsed: '',
    successIndicators: '',
    challenges: '',
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
        type: 'RESTORATION_RECORD',
        data: formData,
        fee: 0.001
      });
      alert('Restoration record submitted successfully!');
    } catch (error) {
      console.error('Error submitting restoration record:', error);
      alert('Failed to submit restoration record');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
    <div className="restoration-container">
      <h1>Restoration Data Collection</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Restoration Type</label>
          <select 
            name="restorationType" 
            value={formData.restorationType}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="reforestation">Reforestation</option>
            <option value="rehabilitation">Habitat Rehabilitation</option>
            <option value="enhancement">Ecosystem Enhancement</option>
            <option value="reconstruction">Landscape Reconstruction</option>
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
          <label>Area (hectares)</label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Species Involved</label>
          <textarea
            name="speciesInvolved"
            value={formData.speciesInvolved}
            onChange={handleChange}
            placeholder="List the species being used in restoration"
            required
          />
        </div>

        <div className="form-group">
          <label>Methods Used</label>
          <textarea
            name="methodsUsed"
            value={formData.methodsUsed}
            onChange={handleChange}
            placeholder="Describe the restoration methods being used"
            required
          />
        </div>

        <div className="form-group">
          <label>Success Indicators</label>
          <textarea
            name="successIndicators"
            value={formData.successIndicators}
            onChange={handleChange}
            placeholder="Describe indicators of restoration success"
            required
          />
        </div>

        <div className="form-group">
          <label>Challenges</label>
          <textarea
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
            placeholder="Describe any challenges encountered"
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
            Submit Restoration Record
          </button>
        </div>
      </form>
    </div>
  );
}

export default Restoration;
