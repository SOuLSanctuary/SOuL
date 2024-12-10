const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function setupDomain() {
  try {
    console.log('🌐 Setting up domain configuration...');

    // Add domains to Vercel project
    console.log('Adding domains to Vercel...');
    exec('vercel domains add soulsanctuary.io', (error, stdout, stderr) => {
      if (error) {
        console.error('Error adding main domain:', error);
        return;
      }
      console.log('Main domain added:', stdout);
    });

    exec('vercel domains add www.soulsanctuary.io', (error, stdout, stderr) => {
      if (error) {
        console.error('Error adding www subdomain:', error);
        return;
      }
      console.log('WWW subdomain added:', stdout);
    });

    // Add SSL certificate
    console.log('Setting up SSL certificate...');
    exec('vercel certs add soulsanctuary.io', (error, stdout, stderr) => {
      if (error) {
        console.error('Error adding SSL certificate:', error);
        return;
      }
      console.log('SSL certificate added:', stdout);
    });

    console.log('✅ Domain setup complete!');
    console.log('\nNext steps:');
    console.log('1. Configure your domain\'s DNS settings according to Vercel\'s instructions');
    console.log('2. Wait for DNS propagation (may take up to 48 hours)');
    console.log('3. Verify SSL certificate is active');

  } catch (error) {
    console.error('Error during domain setup:', error);
    process.exit(1);
  }
}

setupDomain();
