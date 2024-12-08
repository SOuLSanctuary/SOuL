// Calculate distance between two points in kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generate random trees around a given position
export const generateTrees = (centerLat, centerLng) => {
  const trees = [];
  const treeTypes = ['Oak', 'Pine', 'Maple', 'Birch', 'Cedar', 'Redwood'];
  const treeNames = [
    'Ancient Guardian',
    'Whispering Willow',
    'Mighty Oak',
    'Sacred Elder',
    'Forest Sentinel',
    'Wise Elder',
    'Nature\'s Keeper',
    'Living Legacy',
    'Green Giant',
    'Earth Protector'
  ];

  for (let i = 0; i < 10; i++) {
    // Generate random position within ~100m radius
    // 0.001 degree is approximately 111 meters
    const randomLat = centerLat + (Math.random() - 0.5) * 0.002;
    const randomLng = centerLng + (Math.random() - 0.5) * 0.002;

    const tree = {
      lat: randomLat,
      lng: randomLng,
      type: treeTypes[Math.floor(Math.random() * treeTypes.length)],
      name: treeNames[Math.floor(Math.random() * treeNames.length)],
      xpValue: Math.floor(Math.random() * 50) + 10, // Random XP between 10-60
      health: Math.floor(Math.random() * 100),
    };

    trees.push(tree);
  }

  return trees;
};
