import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by your browser'));
      setLoading(false);
      return;
    }

    const successHandler = (position) => {
      setPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLoading(false);
      setError(null);
    };

    const errorHandler = (error) => {
      setError(error);
      setLoading(false);
      setPosition(null);
    };

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { position, error, loading };
};
