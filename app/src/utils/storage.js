const AWS = require('aws-sdk');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

class StorageService {
  async uploadProfilePicture(imageBuffer, walletAddress) {
    try {
      // Process image with sharp
      const processedImage = await sharp(imageBuffer)
        .resize(400, 400, { // Standard size for profile pictures
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 }) // Convert to JPEG with good quality
        .toBuffer();

      // Generate unique filename
      const filename = `profile-pictures/${walletAddress}/${uuidv4()}.jpg`;

      // Upload to S3
      const uploadResult = await s3.upload({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: processedImage,
        ContentType: 'image/jpeg',
        ACL: 'public-read' // Make the image publicly accessible
      }).promise();

      return uploadResult.Location; // Return the public URL
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  }

  async deleteProfilePicture(imageUrl) {
    try {
      // Extract key from URL
      const key = imageUrl.split('.com/')[1];

      await s3.deleteObject({
        Bucket: BUCKET_NAME,
        Key: key
      }).promise();
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      // Don't throw error as this is cleanup operation
    }
  }

  // Generate signed URL for direct browser upload
  async getSignedUploadUrl(walletAddress, contentType) {
    const key = `profile-pictures/${walletAddress}/${uuidv4()}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Expires: 300, // URL expires in 5 minutes
      ACL: 'public-read'
    };

    try {
      const signedUrl = await s3.getSignedUrlPromise('putObject', params);
      return {
        uploadUrl: signedUrl,
        publicUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
      };
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }
}

module.exports = new StorageService();
