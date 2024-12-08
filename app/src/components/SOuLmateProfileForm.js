import React, { useState, useEffect, useCallback } from 'react';
import { FaCamera } from 'react-icons/fa';
import ImageCropper from './ImageCropper';
import { checkUsernameAvailability } from '../api/profile';
import '../styles/SOuLmateProfileForm.css';

const defaultFormData = {
  username: '',
  preferredName: '',
  xAccount: '',
  profilePicture: null
};

const SOuLmateProfileForm = ({ existingProfile, onSubmit }) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Initialize form data with existing profile
  useEffect(() => {
    if (existingProfile) {
      setFormData(prev => ({
        ...defaultFormData,
        ...existingProfile
      }));
      // If we have an existing profile, username is already taken by this user
      setUsernameAvailable(true);
    }
  }, [existingProfile]);

  const handleInputChange = useCallback(async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'username' && !existingProfile) {
      // Only check availability for new profiles
      setIsCheckingUsername(true);
      try {
        // Simulated username check - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setUsernameAvailable(value.length >= 3);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }
  }, [existingProfile]);

  const handleImageSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTempImage(e.target.result);
          setShowCropper(true);
        };
        reader.readAsDataURL(file);
      } else {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select an image file'
        }));
      }
    }
  }, []);

  const handleCroppedImage = useCallback(async (croppedData) => {
    try {
      if (croppedData?.blob) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            profilePicture: reader.result
          }));
          setShowCropper(false);
          setTempImage(null);
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          setErrors(prev => ({
            ...prev,
            profilePicture: 'Error processing image'
          }));
        };
        reader.readAsDataURL(croppedData.blob);
      }
    } catch (error) {
      console.error('Error handling cropped image:', error);
      setErrors(prev => ({
        ...prev,
        profilePicture: 'Error processing image'
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Submit form data including the base64 image
      await onSubmit(formData);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Error submitting form'
      }));
      setIsSubmitting(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.username?.trim()) {
      errors.username = 'Username is required';
    }
    if (!data.preferredName?.trim()) {
      errors.preferredName = 'Preferred name is required';
    }
    return errors;
  };

  const getProfilePictureUrl = useCallback(() => {
    if (tempImage) return tempImage;
    if (!formData.profilePicture) return null;
    
    return formData.profilePicture instanceof Blob 
      ? URL.createObjectURL(formData.profilePicture)
      : formData.profilePicture;
  }, [formData.profilePicture, tempImage]);

  return (
    <div className="profile-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group profile-picture-group">
          <label>Profile Picture</label>
          <div className="profile-picture-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              id="profile-picture"
            />
            <div 
              className="profile-picture-preview"
              style={{
                backgroundImage: getProfilePictureUrl() ? `url(${getProfilePictureUrl()})` : 'none'
              }}
            >
              {!getProfilePictureUrl() && (
                <>
                  <FaCamera className="upload-icon" />
                  <span>Upload Photo</span>
                </>
              )}
            </div>
          </div>
          {errors.profilePicture && (
            <span className="error-message">{errors.profilePicture}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          {errors.username && (
            <span className="error-message">{errors.username}</span>
          )}
          {isCheckingUsername && <span>Checking username...</span>}
          {!usernameAvailable && (
            <span className="error-message">Username is not available</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="preferredName">Preferred Name</label>
          <input
            type="text"
            id="preferredName"
            name="preferredName"
            value={formData.preferredName}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          {errors.preferredName && (
            <span className="error-message">{errors.preferredName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="xAccount">X Account (Optional)</label>
          <input
            type="text"
            id="xAccount"
            name="xAccount"
            value={formData.xAccount}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !usernameAvailable || isCheckingUsername}
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}
      </form>

      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          aspect={1}
          onCropComplete={handleCroppedImage}
          onCancel={() => {
            setShowCropper(false);
            setTempImage(null);
          }}
        />
      )}
    </div>
  );
};

export default SOuLmateProfileForm;
