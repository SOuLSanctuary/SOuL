// Regular expressions for validation
const PATTERNS = {
  username: /^[a-zA-Z0-9_]+$/,
  preferredName: /^[a-zA-Z0-9\s-]+$/,
  discord: /^.{3,32}#[0-9]{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  website: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  telegram: /^@[a-zA-Z0-9_]{5,32}$/,
  bio: /^[\s\S]{0,500}$/, // Allow any character but limit to 500
};

export const validateUsername = (username) => {
  if (!username) {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  if (!PATTERNS.username.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

export const validatePreferredName = (name) => {
  if (!name) {
    return 'Preferred name is required';
  }
  if (name.length < 2) {
    return 'Preferred name must be at least 2 characters';
  }
  if (name.length > 30) {
    return 'Preferred name must be less than 30 characters';
  }
  if (!PATTERNS.preferredName.test(name)) {
    return 'Preferred name can only contain letters, numbers, spaces, and hyphens';
  }
  return null;
};

export const validateXAccount = (account) => {
  if (!account) {
    return null; // X account is optional
  }
  if (!account.startsWith('@')) {
    return 'X account must start with @';
  }
  account = account.slice(1); // Remove @ for length check
  if (account.length < 4) {
    return 'X account must be at least 4 characters (excluding @)';
  }
  if (account.length > 15) {
    return 'X account must be less than 15 characters (excluding @)';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(account)) {
    return 'X account can only contain letters, numbers, and underscores';
  }
  return null;
};

export const validateDiscord = (discord) => {
  if (!discord) {
    return null; // Discord is optional
  }
  if (!PATTERNS.discord.test(discord)) {
    return 'Invalid Discord username format (e.g., Username#1234)';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) {
    return null; // Email is optional
  }
  if (!PATTERNS.email.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validateWebsite = (website) => {
  if (!website) {
    return null; // Website is optional
  }
  if (!PATTERNS.website.test(website)) {
    return 'Invalid website URL format';
  }
  return null;
};

export const validateTelegram = (telegram) => {
  if (!telegram) {
    return null; // Telegram is optional
  }
  if (!PATTERNS.telegram.test(telegram)) {
    return 'Invalid Telegram username format (must start with @ and be 5-32 characters)';
  }
  return null;
};

export const validateBio = (bio) => {
  if (!bio) {
    return null; // Bio is optional
  }
  if (!PATTERNS.bio.test(bio)) {
    return 'Bio must be less than 500 characters';
  }
  return null;
};

export const validateProfilePicture = (file) => {
  if (!file) {
    return null; // Profile picture is optional
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxDimension = 4096; // Max 4096x4096 pixels

  if (file.size > maxSize) {
    return 'Image must be less than 5MB';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Only JPG, PNG, GIF, and WebP images are allowed';
  }

  // Check image dimensions
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width > maxDimension || img.height > maxDimension) {
        resolve('Image dimensions must be 4096x4096 pixels or smaller');
      }
      resolve(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve('Invalid image file');
    };
    img.src = URL.createObjectURL(file);
  });
};

export const validateProfileData = async (data) => {
  const errors = {};

  // Required fields
  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;

  const preferredNameError = validatePreferredName(data.preferredName);
  if (preferredNameError) errors.preferredName = preferredNameError;

  // Optional fields with validation
  const xAccountError = validateXAccount(data.xAccount);
  if (xAccountError) errors.xAccount = xAccountError;

  const discordError = validateDiscord(data.discord);
  if (discordError) errors.discord = discordError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const websiteError = validateWebsite(data.website);
  if (websiteError) errors.website = websiteError;

  const telegramError = validateTelegram(data.telegram);
  if (telegramError) errors.telegram = telegramError;

  const bioError = validateBio(data.bio);
  if (bioError) errors.bio = bioError;

  // Profile picture validation
  if (data.profilePicture) {
    const profilePictureError = await validateProfilePicture(data.profilePicture);
    if (profilePictureError) errors.profilePicture = profilePictureError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
