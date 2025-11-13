// Icon Generator Script for PWA
// Generates all required icon sizes from a source image

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceImage = 'public/logo.png'; // Change this to your logo path
const outputDir = 'public';

async function generateIcons() {
  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error(`❌ Source image not found: ${sourceImage}`);
    console.log('Please provide a logo.png file in the public folder (at least 512x512px)');
    return;
  }

  console.log('🎨 Generating PWA icons...\n');

  for (const size of sizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}.png`);
      
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate icon-${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('\nGenerated icons:');
  sizes.forEach(size => {
    console.log(`  - icon-${size}.png`);
  });
}

// Run the generator
generateIcons().catch(console.error);
