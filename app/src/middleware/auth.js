const jwt = require('jsonwebtoken');

const verifySignature = (message, signature, publicKey) => {
  try {
    // Verify the signature using the Solana web3.js library
    const encodedMessage = new TextEncoder().encode(message);
    const signatureUint8 = new Uint8Array(Buffer.from(signature, 'base64'));
    const publicKeyUint8 = new Uint8Array(Buffer.from(publicKey, 'base64'));
    
    return nacl.sign.detached.verify(
      encodedMessage,
      signatureUint8,
      publicKeyUint8
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // For wallet authentication, verify the signature
    if (decoded.signature && decoded.message && decoded.publicKey) {
      const isValid = verifySignature(
        decoded.message,
        decoded.signature,
        decoded.publicKey
      );
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;
