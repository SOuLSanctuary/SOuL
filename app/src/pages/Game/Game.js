import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import { generateTrees } from '../../utils/gameUtils';
import treeMarkerIcon from '../../assets/icons/tree-marker.svg';
import 'leaflet/dist/leaflet.css';
import './Game.css';

const treeIcon = new L.Icon({
  iconUrl: treeMarkerIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const playerIcon = new L.Icon({
  iconUrl: `${L.Icon.Default.imagePath}/marker-icon.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});

function Game() {
  const { position, error } = useGeolocation();
  const [trees, setTrees] = useState([]);
  const [playerXP, setPlayerXP] = useState(0);
  const [gameStats, setGameStats] = useState({
    forest: 0,
    wildlife: 0,
    weather: 0,
    disaster: 0,
    threat: 0
  });
  const defaultPosition = { lat: 1.3521, lng: 103.8198 };
  const mapRef = useRef(null);
  const [showError, setShowError] = useState(true);

  // Initialize game stats
  useEffect(() => {
    setGameStats({
      forest: Math.floor(Math.random() * 10),
      wildlife: Math.floor(Math.random() * 8),
      weather: Math.floor(Math.random() * 5),
      disaster: Math.floor(Math.random() * 3),
      threat: Math.floor(Math.random() * 4)
    });
  }, []);

  // Handle location error and disaster increment
  useEffect(() => {
    if (error) {
      setShowError(true);
      const errorTimer = setTimeout(() => {
        setShowError(false);
        // Increment disaster count after error message disappears
        setGameStats(prev => ({
          ...prev,
          disaster: prev.disaster + 1
        }));
      }, 4000);
      return () => clearTimeout(errorTimer);
    }
  }, [error]);

  // Custom map style configuration
  const mapStyle = {
    filter: 'brightness(0.8) saturate(1.5)',
    backgroundColor: '#1a1a1a'
  };

  useEffect(() => {
    if (position) {
      const nearbyTrees = generateTrees(position, 5);
      setTrees(nearbyTrees);
    }
  }, [position]);

  useEffect(() => {
    // Apply custom styling to map container and add game grid
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      mapContainer.style.filter = mapStyle.filter;
      mapContainer.style.backgroundColor = mapStyle.backgroundColor;
      
      // Add game grid overlay
      const gridOverlay = document.createElement('div');
      gridOverlay.className = 'game-grid-overlay';
      mapContainer.appendChild(gridOverlay);
    }
  }, []);

  const mapCenter = position || defaultPosition;

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomOut();
    }
  };

  const handleLocate = () => {
    const map = mapRef.current;
    if (map && position) {
      map.setView([position.lat, position.lng], 17);
    }
  };

  return (
    <div className="game-container">
      {/* Game Content Wrapper */}
      <div className="game-content">
        {/* Error Message */}
        {error && showError && (
          <div className="notification-container">
            <div className="notification error">
              <span className="notification-icon">⚠️</span>
              <span className="notification-message">
                Unable to find your location. Some features may be limited.
              </span>
              <button 
                className="notification-close"
                onClick={() => setShowError(false)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Level Progress Bar */}
        <div className="level-progress">
          <div className="level-info">
            <span className="level-number">LVL 1</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '45%' }}></div>
            </div>
            <span className="xp-needed">2,500 XP to LVL 2</span>
          </div>
        </div>

        {/* Game Stats HUD */}
        <div className="game-hud">
          <div className="stat-container">
            <div className="stat-item">
              <span>XP ✨</span>
              <span>{playerXP}</span>
            </div>
            <div className="stat-item">
              <span>Trees 🌳</span>
              <span>{trees.length}</span>
            </div>
            <div className="stat-item">
              <span>Forest 🌿</span>
              <span>{gameStats.forest}</span>
            </div>
            <div className="stat-item">
              <span>Wildlife 🦊</span>
              <span>{gameStats.wildlife}</span>
            </div>
            <div className="stat-item">
              <span>Weather 🌤️</span>
              <span>{gameStats.weather}</span>
            </div>
            <div className="stat-item">
              <span>Disaster 🌋</span>
              <span>{gameStats.disaster}</span>
            </div>
            <div className="stat-item">
              <span>Threat ⚠️</span>
              <span>{gameStats.threat}</span>
            </div>
          </div>
        </div>

        {/* Mini Map */}
        <div className="mini-map">
          <div className="mini-map-header">Area Map</div>
          <div className="mini-map-content">
            <div className="player-indicator"></div>
          </div>
        </div>

        <MapContainer
          center={mapCenter}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />
          
          {position && (
            <Marker position={position} icon={playerIcon}>
              <Popup className="game-popup player-popup">
                <div className="popup-content">
                  <h3>Forest Guardian</h3>
                  <div className="player-stats">
                    <div className="stat">
                      <span className="stat-icon">👤</span>
                      <span>Level 1 Guardian</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">🏆</span>
                      <span>Trees Protected: 0</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {trees.map((tree, index) => (
            <Marker
              key={index}
              position={tree.position}
              icon={treeIcon}
            >
              <Popup className="game-popup tree-popup">
                <div className="popup-content">
                  <h3>{tree.name}</h3>
                  <div className="tree-stats">
                    <div className="stat">
                      <span className="stat-icon">🌿</span>
                      <span>Type: {tree.type}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">❤️</span>
                      <div className="health-bar">
                        <div 
                          className="health-fill" 
                          style={{ width: `${tree.health}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">✨</span>
                      <span>+{tree.xpValue} XP</span>
                    </div>
                  </div>
                  <button className="interact-button glow-effect">
                    <span className="button-icon">🛡️</span>
                    Protect Tree
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Game Controls */}
        <div className="game-controls">
          <button className="control-button zoom-in glow-effect" onClick={handleZoomIn} aria-label="Zoom in">
            <span>+</span>
          </button>
          <button className="control-button zoom-out glow-effect" onClick={handleZoomOut} aria-label="Zoom out">
            <span>-</span>
          </button>
          <button className="control-button locate glow-effect" onClick={handleLocate} aria-label="Center on player">
            <span>⌖</span>
          </button>
        </div>

        {/* Compass */}
        <div className="compass">
          <div className="compass-arrow"></div>
          <div className="compass-labels">
            <span className="compass-n">N</span>
            <span className="compass-e">E</span>
            <span className="compass-s">S</span>
            <span className="compass-w">W</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
