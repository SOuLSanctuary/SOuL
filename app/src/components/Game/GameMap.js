import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { useWallet } from '@solana/wallet-adapter-react';
import './GameMap.css';

const COLLECTIBLE_TYPES = {
    TREE: { icon: '🌳', color: '#2ecc71', radius: 50 },
    WATER: { icon: '💧', color: '#3498db', radius: 40 },
    WILDLIFE: { icon: '🦁', color: '#f1c40f', radius: 60 },
    ENERGY: { icon: '⚡', color: '#e67e22', radius: 45 },
    ECOSYSTEM: { icon: '🌿', color: '#27ae60', radius: 55 },
    RARE: { icon: '✨', color: '#9b59b6', radius: 30 }
};

const GameMap = () => {
    const { publicKey } = useWallet();
    const [userLocation, setUserLocation] = useState(null);
    const [collectibles, setCollectibles] = useState([]);
    const [selectedCollectible, setSelectedCollectible] = useState(null);
    const [playerStats, setPlayerStats] = useState({
        level: 1,
        experience: 0,
        energy: 100,
        inventory: []
    });
    const [showingCatchModal, setShowingCatchModal] = useState(false);
    const [catchingCollectible, setCatchingCollectible] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });

    // Watch user's location
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error('Error getting location:', error),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Generate collectibles around user
    useEffect(() => {
        if (userLocation) {
            generateCollectibles();
        }
    }, [userLocation]);

    const generateCollectibles = () => {
        if (!userLocation) return;

        const newCollectibles = [];
        const types = Object.keys(COLLECTIBLE_TYPES);

        // Generate 10 random collectibles around the user
        for (let i = 0; i < 10; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const radius = 0.01; // Roughly 1km
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius;

            const lat = userLocation.lat + r * Math.cos(angle);
            const lng = userLocation.lng + r * Math.sin(angle);

            newCollectibles.push({
                id: Date.now() + i,
                type,
                position: { lat, lng },
                power: Math.floor(Math.random() * 1000) + 100,
                rarity: Math.random() < 0.1 ? 'LEGENDARY' : 
                        Math.random() < 0.3 ? 'RARE' : 'COMMON'
            });
        }

        setCollectibles(newCollectibles);
    };

    const handleCollectibleClick = (collectible) => {
        if (!userLocation) return;

        // Calculate distance between user and collectible
        const distance = getDistance(
            userLocation.lat,
            userLocation.lng,
            collectible.position.lat,
            collectible.position.lng
        );

        // Only allow interaction if within 100 meters
        if (distance <= 0.1) {
            setSelectedCollectible(collectible);
            setShowingCatchModal(true);
            setCatchingCollectible(collectible);
        } else {
            alert('Too far away! Move closer to interact with this collectible.');
        }
    };

    const handleCatchAttempt = async () => {
        if (!catchingCollectible || !publicKey) return;

        try {
            // Simulate catch mechanics
            const catchProbability = catchingCollectible.rarity === 'LEGENDARY' ? 0.1 :
                                   catchingCollectible.rarity === 'RARE' ? 0.3 : 0.7;

            const success = Math.random() < catchProbability;

            if (success) {
                // Update player inventory and stats
                setPlayerStats(prev => ({
                    ...prev,
                    experience: prev.experience + catchingCollectible.power,
                    inventory: [...prev.inventory, catchingCollectible]
                }));

                // Remove caught collectible from map
                setCollectibles(prev => 
                    prev.filter(c => c.id !== catchingCollectible.id)
                );

                alert('Successfully collected!');
            } else {
                alert('Collection failed! Try again!');
            }
        } catch (error) {
            console.error('Error during collection:', error);
            alert('Failed to collect. Please try again.');
        }

        setShowingCatchModal(false);
        setCatchingCollectible(null);
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI/180);
    };

    if (!isLoaded || !userLocation) {
        return <div className="loading">Loading map...</div>;
    }

    return (
        <div className="game-container">
            <div className="game-stats">
                <div className="stat">Level: {playerStats.level}</div>
                <div className="stat">XP: {playerStats.experience}</div>
                <div className="stat">Energy: {playerStats.energy}</div>
            </div>

            <GoogleMap
                mapContainerClassName="game-map"
                center={userLocation}
                zoom={17}
                options={{
                    disableDefaultUI: true,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                }}
            >
                {/* Player Marker */}
                <Marker
                    position={userLocation}
                    icon={{
                        url: '/player-marker.png',
                        scaledSize: new window.google.maps.Size(40, 40)
                    }}
                />

                {/* Collectibles */}
                {collectibles.map(collectible => (
                    <React.Fragment key={collectible.id}>
                        <Marker
                            position={collectible.position}
                            onClick={() => handleCollectibleClick(collectible)}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: COLLECTIBLE_TYPES[collectible.type].color,
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: 'white'
                            }}
                        />
                        <Circle
                            center={collectible.position}
                            radius={COLLECTIBLE_TYPES[collectible.type].radius}
                            options={{
                                fillColor: COLLECTIBLE_TYPES[collectible.type].color,
                                fillOpacity: 0.2,
                                strokeColor: COLLECTIBLE_TYPES[collectible.type].color,
                                strokeOpacity: 0.5,
                                strokeWeight: 1
                            }}
                        />
                    </React.Fragment>
                ))}
            </GoogleMap>

            {showingCatchModal && catchingCollectible && (
                <div className="catch-modal">
                    <div className="catch-content">
                        <h2>{COLLECTIBLE_TYPES[catchingCollectible.type].icon} {catchingCollectible.type}</h2>
                        <p>Power: {catchingCollectible.power}</p>
                        <p>Rarity: {catchingCollectible.rarity}</p>
                        <button onClick={handleCatchAttempt}>
                            Attempt Collection
                        </button>
                        <button onClick={() => setShowingCatchModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <button className="refresh-button" onClick={generateCollectibles}>
                Refresh Collectibles
            </button>
        </div>
    );
};

export default GameMap;
