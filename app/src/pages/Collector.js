import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import '../styles/Collectors.css';
import GeoMedia from '../components/GeoMedia';

function Collector() {
  const { wallet, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    activityType: '',
    location: '',
    quantity: '',
    unit: '',
    description: '',
    participants: '',
    impact: '',
    timestamp: '2024-12-07T14:44:11+08:00',
    photos: [],
    audios: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    try {
      await sendTransaction({
        type: 'COLLECTIVE_ACTIVITY',
        data: formData,
        fee: 0.001
      });
      setMessage({ type: 'success', text: 'Action recorded successfully!' });
      setFormData({
        activityType: '',
        location: '',
        quantity: '',
        unit: '',
        description: '',
        participants: '',
        impact: '',
        timestamp: '2024-12-07T14:44:11+08:00',
        photos: [],
        audios: []
      });
    } catch (error) {
      console.error('Error submitting action:', error);
      setMessage({ type: 'error', text: 'Failed to record action' });
    }
    setLoading(false);
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
    <div className="collector-container">
      <header className="collector-header">
        <h1>SOuL Collector</h1>
        <p>Record and track SOuL-driven actions and their impact on our shared environment</p>
      </header>

      {message && (
        <div className={`${message.type}-message`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="collector-form">
        <div className="form-grid">
          <div className="form-section">
            <h3>SOuLful Dedicated Efforts</h3>
            <div className="form-group">
              <label>Action Type</label>
              <select 
                name="activityType" 
                value={formData.activityType}
                onChange={handleChange}
                required
              >
                <option value="">Select Action Type</option>
                <optgroup label="Waste Management">
                  <option value="recycling">Recycling</option>
                  <option value="composting">Composting</option>
                  <option value="plastic_reduction">Plastic Reduction</option>
                  <option value="food_waste">Food Waste Reduction</option>
                  <option value="ewaste">E-Waste Collection</option>
                  <option value="upcycling">Upcycling Projects</option>
                </optgroup>

                <optgroup label="Energy & Resources">
                  <option value="renewable">Renewable Energy Usage</option>
                  <option value="energy_saving">Energy Conservation</option>
                  <option value="water_conservation">Water Conservation</option>
                  <option value="rainwater">Rainwater Harvesting</option>
                  <option value="solar">Solar Panel Installation</option>
                </optgroup>

                <optgroup label="Transportation">
                  <option value="sustainable">Sustainable Transportation</option>
                  <option value="ev_charging">EV Charging Station Usage</option>
                  <option value="bike_sharing">Bike Sharing</option>
                  <option value="carpooling">Carpooling Initiative</option>
                </optgroup>

                <optgroup label="Ecosystem Restoration">
                  <option value="tree_planting">Tree Planting</option>
                  <option value="garden">Community Garden</option>
                  <option value="native_plants">Native Plant Cultivation</option>
                  <option value="pollinator">Pollinator Garden</option>
                  <option value="soil_restoration">Soil Restoration</option>
                </optgroup>

                <optgroup label="Cleanup Activities">
                  <option value="beach_cleanup">Beach Cleanup</option>
                  <option value="river_cleanup">River Cleanup</option>
                  <option value="trail_cleanup">Trail Cleanup</option>
                  <option value="neighborhood">Neighborhood Cleanup</option>
                  <option value="park_cleanup">Park Cleanup</option>
                </optgroup>

                <optgroup label="Education & Awareness">
                  <option value="workshop">Environmental Workshop</option>
                  <option value="education">Environmental Education</option>
                  <option value="awareness">Awareness Campaign</option>
                  <option value="training">Sustainability Training</option>
                  <option value="eco_tour">Eco-Tourism Guide</option>
                </optgroup>

                <optgroup label="Conservation">
                  <option value="wildlife_protection">Wildlife Protection</option>
                  <option value="habitat_protection">Habitat Protection</option>
                  <option value="species_monitoring">Species Monitoring</option>
                  <option value="conservation_work">Conservation Work</option>
                  <option value="sanctuary">Wildlife Sanctuary Support</option>
                </optgroup>

                <optgroup label="Sustainable Living">
                  <option value="zero_waste">Zero Waste Practice</option>
                  <option value="local_food">Local Food Production</option>
                  <option value="sustainable_fashion">Sustainable Fashion</option>
                  <option value="eco_products">Eco-Product Development</option>
                  <option value="green_building">Green Building Practice</option>
                </optgroup>

                <optgroup label="Community Initiatives">
                  <option value="community_project">Community Project</option>
                  <option value="eco_committee">Eco-Committee Leadership</option>
                  <option value="green_school">Green School Program</option>
                  <option value="local_advocacy">Local Environmental Advocacy</option>
                  <option value="partnership">Environmental Partnership</option>
                </optgroup>

                <optgroup label="Research & Innovation">
                  <option value="research">Environmental Research</option>
                  <option value="monitoring">Environmental Monitoring</option>
                  <option value="innovation">Eco-Innovation Project</option>
                  <option value="technology">Green Technology Development</option>
                  <option value="documentation">Environmental Documentation</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Action location"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Measurement</h3>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Amount"
                required
              />
            </div>

            <div className="form-group">
              <label>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Select Unit</option>
                <optgroup label="Weight & Volume">
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tons">Metric Tons</option>
                  <option value="liters">Liters</option>
                  <option value="cubic_meters">Cubic Meters</option>
                </optgroup>

                <optgroup label="Energy">
                  <option value="kWh">Kilowatt Hours (kWh)</option>
                  <option value="MWh">Megawatt Hours (MWh)</option>
                  <option value="panels">Solar Panels</option>
                </optgroup>

                <optgroup label="Distance & Area">
                  <option value="km">Kilometers (km)</option>
                  <option value="sqm">Square Meters (m²)</option>
                  <option value="hectares">Hectares (ha)</option>
                  <option value="acres">Acres</option>
                </optgroup>

                <optgroup label="Time">
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="sessions">Sessions</option>
                  <option value="visits">Visits</option>
                </optgroup>

                <optgroup label="Count">
                  <option value="items">Items</option>
                  <option value="trees">Trees</option>
                  <option value="plants">Plants</option>
                  <option value="species">Species</option>
                  <option value="devices">Devices</option>
                </optgroup>

                <optgroup label="People">
                  <option value="people">People Engaged</option>
                  <option value="participants">Participants</option>
                  <option value="volunteers">Volunteers</option>
                  <option value="beneficiaries">Beneficiaries</option>
                </optgroup>

                <optgroup label="Resources">
                  <option value="documents">Documents</option>
                  <option value="reports">Reports</option>
                  <option value="projects">Projects</option>
                  <option value="initiatives">Initiatives</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the action and its significance"
              required
            />
          </div>

          <div className="form-group">
            <label>Number of Participants</label>
            <input
              type="number"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              placeholder="Number of people involved"
              required
            />
          </div>

          <div className="form-group">
            <label>Environmental Impact</label>
            <textarea
              name="impact"
              value={formData.impact}
              onChange={handleChange}
              placeholder="Describe the environmental impact of this action"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Media Documentation</h3>
          <GeoMedia
            onPhotoCapture={handlePhotoCapture}
            onAudioCapture={handleAudioCapture}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || !wallet}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              <span>Recording Action...</span>
            </>
          ) : (
            'Record Action'
          )}
        </button>
      </form>
    </div>
  );
}

export default Collector;
