import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import './ImpactMap.css';

const ImpactMap = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const data = [
        { month: 'Jan', forestcover: 65, threats: 30, funds: 45, delegation: 20 },
        { month: 'Feb', forestcover: 68, threats: 28, funds: 48, delegation: 25 },
        { month: 'Mar', forestcover: 72, threats: 25, funds: 52, delegation: 30 },
        { month: 'Apr', forestcover: 75, threats: 22, funds: 55, delegation: 35 },
        { month: 'May', forestcover: 78, threats: 20, funds: 58, delegation: 40 },
        { month: 'Jun', forestcover: 82, threats: 18, funds: 62, delegation: 45 }
    ];

    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            // Initialize the map
            mapInstanceRef.current = L.map(mapRef.current, {
                minZoom: 2,
                maxZoom: 10,
                zoomControl: false
            });

            // Add dark theme map tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(mapInstanceRef.current);

            // Sample data for markers
            const markers = [
                { lat: 35.6762, lng: 139.6503, country: 'Japan' },
                { lat: 14.5995, lng: 120.9842, country: 'Philippines' },
                { lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
                { lat: 13.7563, lng: 100.5018, country: 'Thailand' }  // Bangkok, Thailand
            ];

            // Create bounds object to contain all markers
            const bounds = L.latLngBounds(markers.map(marker => [marker.lat, marker.lng]));

            // Custom icon for markers
            const customIcon = L.icon({
                iconUrl: '/SOuL.png',
                iconSize: [32, 32],  // size of the icon
                iconAnchor: [16, 16],  // point of the icon which will correspond to marker's location
                popupAnchor: [0, -16]  // point from which the popup should open relative to the iconAnchor
            });

            // Add markers to the map
            markers.forEach(marker => {
                L.marker([marker.lat, marker.lng], { icon: customIcon })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(marker.country);
            });

            // Fit the map to show all markers with some padding
            mapInstanceRef.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 5
            });
        }

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="impact-map-container">
            <div className="impact-map-content">
                <div className="sidebar-left">
                    <div className="sidebar-header">
                        <h2>IMPACT MAP</h2>
                        <h3>Transparent forest growing on Solana</h3>
                        <p>Verifiable anytime.</p>
                        <p style={{ fontStyle: 'italic', color: '#20B2AA' }}>Creating real socioeconomic impact to local forest, agricultural, and coastal communities.</p>
                    </div>

                    <div className="search-bar">
                        <input type="text" placeholder="Search wallet address and impact..." />
                    </div>

                    <div className="impact-bar">
                        <div className="impact-stat">
                            <span className="stat-label">Total Trees</span>
                            <span className="stat-value">10,000+</span>
                        </div>
                        <div className="impact-stat">
                            <span className="stat-label">Total Impact</span>
                            <span className="stat-value">$500K+</span>
                        </div>
                        <div className="impact-stat">
                            <span className="stat-label">Labor Employed</span>
                            <span className="stat-value">500+</span>
                        </div>
                        <div className="impact-stat">
                            <span className="stat-label">Income Increased</span>
                            <span className="stat-value">300%</span>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        padding: '16px',
                        margin: '16px 0'
                    }}>
                        <h4 style={{ color: '#fff', marginBottom: '16px' }}>Forest Impact Trends</h4>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={data}>
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#fff"
                                    />
                                    <YAxis 
                                        stroke="#fff"
                                    />
                                    <Line 
                                        dataKey="forestcover" 
                                        stroke="#4CAF50" 
                                        name="Forestcover Grown"
                                        dot
                                    />
                                    <Line 
                                        dataKey="threats" 
                                        stroke="#FF5252"
                                        name="Forest Threats"
                                        dot
                                    />
                                    <Line 
                                        dataKey="funds" 
                                        stroke="#2196F3"
                                        name="Fund Utilization"
                                        dot
                                    />
                                    <Legend />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        padding: '16px',
                        margin: '16px 0'
                    }}>
                        <h4 style={{ color: '#fff', marginBottom: '16px' }}>SOuL Co-owners Delegation</h4>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={data}>
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#fff"
                                    />
                                    <YAxis 
                                        stroke="#fff"
                                    />
                                    <Line 
                                        dataKey="delegation" 
                                        stroke="#9C27B0" 
                                        name="Co-owners Delegation"
                                        dot
                                    />
                                    <Legend />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div ref={mapRef} className="map-container"></div>

                <div className="sidebar-right">
                    <div className="filters">
                        <div className="filter-group">
                            <label>Country</label>
                            <select>
                                <option value="">All Countries</option>
                                <option value="japan">Japan</option>
                                <option value="philippines">Philippines</option>
                                <option value="nigeria">Nigeria</option>
                                <option value="indonesia">Indonesia</option>
                                <option value="malaysia">Malaysia</option>
                                <option value="thailand">Thailand</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Year Grown</label>
                            <div className="year-filter"></div>
                        </div>
                        <div className="filter-group">
                            <label>Forest Purpose</label>
                            <div className="purpose-filter"></div>
                        </div>
                        <div className="filter-group">
                            <label>Fruit Tree</label>
                            <div className="fruit-filter"></div>
                        </div>
                        <div className="filter-group">
                            <label>Agroindustrial Crops</label>
                            <div className="agroindustrial-filter"></div>
                        </div>
                        <div className="filter-group">
                            <label>Non-Timber Forest Products</label>
                            <div className="nt-forest-filter"></div>
                        </div>
                    </div>
                    <div className="rotating-gif">
                        <img src="/Rotating.gif" alt="Rotating Animation" />
                    </div>
                    <div className="action-buttons">
                        <button className="btn-free-data">Free Data</button>
                        <button className="btn-buy-data">Buy Data</button>
                        <button className="btn-publish">Publish Study</button>
                        <button className="btn-connect-wallet">Connect Solana Wallet</button>
                    </div>
                    <div className="store-badges">
                        <span>Soon in</span>
                        <img src="/AppStore.png" alt="App Store" />
                        <img src="/PlayStore.png" alt="Play Store" />
                    </div>
                    <div className="mobile-preview">
                        <img src="/SOuLCollector.png" alt="Mobile App Preview" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactMap;
