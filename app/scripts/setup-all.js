const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function setupAll() {
  try {
    console.log('🚀 Starting complete setup process...');

    // 1. Vercel Project Setup
    console.log('\n📦 Setting up Vercel project...');
    try {
      execSync('vercel link --yes', { stdio: 'inherit' });
    } catch (error) {
      console.log('Please complete Vercel login first');
      return;
    }

    // 2. Environment Variables
    console.log('\n🔐 Setting up environment variables...');
    const envVars = {
      'REACT_APP_WS_URL': 'wss://soulsanctuary.cloud',
      'REACT_APP_SOLANA_NETWORK': 'mainnet-beta',
      'REACT_APP_API_URL': 'https://soulsanctuary.cloud',
      'REACT_APP_SOLANA_RPC_HOST': 'https://api.mainnet-beta.solana.com'
    };

    for (const [key, value] of Object.entries(envVars)) {
      try {
        execSync(`vercel env add ${key} production`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`Error setting ${key}:`, error);
      }
    }

    // 3. Domain Setup
    console.log('\n🌐 Setting up domain...');
    try {
      execSync('vercel domains add soulsanctuary.io', { stdio: 'inherit' });
      execSync('vercel domains add www.soulsanctuary.io', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error in domain setup:', error);
    }

    // 4. Production Build
    console.log('\n🏗️ Creating production build...');
    try {
      execSync('npm run build:production', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error in production build:', error);
      return;
    }

    // 5. Deploy
    console.log('\n🚀 Deploying to production...');
    try {
      execSync('vercel --prod', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error in deployment:', error);
      return;
    }

    console.log('\n✅ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Configure your domain\'s DNS settings according to Vercel\'s instructions');
    console.log('2. Set up your Sentry DSN in the Vercel dashboard');
    console.log('3. Visit your deployment URL to verify everything is working');

  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setupAll();
