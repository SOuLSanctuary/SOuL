import React, { useState, useRef } from 'react';
import '../styles/GeoMedia.css';

const GeoMedia = ({ onPhotoCapture, onAudioCapture }) => {
  const [location, setLocation] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [showCamera, setShowCamera] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString()
            };
            setLocation(locationData);
            resolve(locationData);
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Please enable location services to geotag your media.');
            reject(error);
          }
        );
      });
    } else {
      alert('Geolocation is not supported by your browser.');
      return Promise.reject('Geolocation not supported');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setShowCamera(true);
      await getLocation(); // Start getting location as soon as camera opens
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Please enable camera access to capture photos.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setShowCamera(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !streamRef.current) return;

    try {
      const locationData = await getLocation();
      
      // Create a canvas to capture the video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const photoUrl = URL.createObjectURL(blob);
        setPhotoPreview(photoUrl);

        // Create metadata object
        const metadata = {
          blob: blob,
          preview: photoUrl,
          location: locationData,
          timestamp: new Date().toISOString()
        };

        onPhotoCapture && onPhotoCapture(metadata);
        stopCamera();
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('Error capturing photo. Please try again.');
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Create metadata object
        const metadata = {
          blob: audioBlob,
          url: audioUrl,
          location: location,
          timestamp: new Date().toISOString()
        };

        onAudioCapture && onAudioCapture(metadata);
        chunksRef.current = [];
      };

      await getLocation();
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please enable microphone access to record audio.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
      if (isRecording) {
        stopAudioRecording();
      }
    };
  }, [isRecording]);

  return (
    <div className="geo-media-container">
      <div className="media-section">
        <h4>Geotagged Photo</h4>
        <div className="photo-capture">
          {!showCamera && !photoPreview && (
            <button 
              type="button"
              onClick={startCamera} 
              className="capture-button"
            >
              Open Camera
            </button>
          )}
          
          {showCamera && (
            <div className="camera-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="camera-preview"
              />
              <div className="camera-controls">
                <button 
                  type="button"
                  onClick={capturePhoto} 
                  className="capture-button"
                >
                  Capture Photo
                </button>
                <button 
                  type="button"
                  onClick={stopCamera} 
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {photoPreview && (
            <div className="preview-container">
              <img src={photoPreview} alt="Captured" className="photo-preview" />
              {location && (
                <div className="location-info">
                  <p>📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="media-section">
        <h4>Geotagged Audio</h4>
        <div className="audio-capture">
          <button
            type="button"
            onClick={isRecording ? stopAudioRecording : startAudioRecording}
            className={`record-button ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {audioURL && (
            <div className="audio-preview">
              <audio ref={audioRef} src={audioURL} controls className="audio-player" />
              {location && (
                <div className="location-info">
                  <p>📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeoMedia;
