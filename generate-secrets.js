const crypto = require('crypto');

function generateSecret() {
    return crypto.randomBytes(64).toString('hex');
}

console.log('JWT_SECRET=' + generateSecret());
console.log('SESSION_SECRET=' + generateSecret());
console.log('COOKIE_SECRET=' + generateSecret());
