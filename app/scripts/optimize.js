const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Compression and optimization settings
const optimizeBuild = () => {
  const buildPath = path.join(__dirname, '../build');

  // Ensure the build directory exists
  if (!fs.existsSync(buildPath)) {
    console.error('Build directory not found. Run build first.');
    process.exit(1);
  }

  console.log('🔧 Optimizing production build...');

  try {
    // Remove source maps if they exist
    const sourceMapFiles = fs.readdirSync(buildPath)
      .filter(file => file.endsWith('.map'));
    
    sourceMapFiles.forEach(file => {
      fs.unlinkSync(path.join(buildPath, file));
    });

    console.log('✅ Source maps removed');
    console.log('✅ Build optimization complete');
  } catch (error) {
    console.error('Error during optimization:', error);
    process.exit(1);
  }
};

optimizeBuild();
