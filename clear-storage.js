/**
 * Utility script to clear localStorage
 * Run this in browser console if storage gets full
 */

// Clear all black box data
function clearBlackBoxStorage() {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('blackbox_'));
  console.log(`Found ${keys.length} black box storage keys`);
  
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ Black box storage cleared!');
  console.log('Refresh the page to start fresh.');
}

// Get storage usage
function getStorageUsage() {
  let totalSize = 0;
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      totalSize += item.length;
    }
  });
  
  const sizeInKB = (totalSize / 1024).toFixed(2);
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  const estimatedLimit = 5 * 1024 * 1024; // 5MB
  const percentage = ((totalSize / estimatedLimit) * 100).toFixed(1);
  
  console.log('📊 LocalStorage Usage:');
  console.log(`Total Size: ${sizeInKB} KB (${sizeInMB} MB)`);
  console.log(`Percentage: ${percentage}% of ~5MB limit`);
  console.log(`Total Keys: ${keys.length}`);
  
  // Show black box specific usage
  const blackboxKeys = keys.filter(key => key.startsWith('blackbox_'));
  let blackboxSize = 0;
  blackboxKeys.forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      blackboxSize += item.length;
    }
  });
  
  const blackboxKB = (blackboxSize / 1024).toFixed(2);
  console.log(`\n📝 Black Box Data:`);
  console.log(`Keys: ${blackboxKeys.length}`);
  console.log(`Size: ${blackboxKB} KB`);
  
  return {
    totalSize,
    totalKeys: keys.length,
    blackboxKeys: blackboxKeys.length,
    blackboxSize,
    percentage: parseFloat(percentage)
  };
}

// Export functions to window for console access
if (typeof window !== 'undefined') {
  window.clearBlackBoxStorage = clearBlackBoxStorage;
  window.getStorageUsage = getStorageUsage;
  
  console.log('🔧 Storage utilities loaded!');
  console.log('Available commands:');
  console.log('  - clearBlackBoxStorage() : Clear all black box data');
  console.log('  - getStorageUsage()      : Check storage usage');
}

// Auto-run storage check
if (typeof window !== 'undefined') {
  const usage = getStorageUsage();
  if (usage.percentage > 80) {
    console.warn('⚠️ Storage is getting full! Consider running clearBlackBoxStorage()');
  }
}
