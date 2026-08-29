import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicons() {
  const inputLogo = path.resolve('img/logo.png');
  const imgDir = path.resolve('img');
  
  console.log('Generating favicon icons from', inputLogo);
  
  // Generate PNG icons of multiple sizes
  await sharp(inputLogo).resize(16, 16).png().toFile(path.join(imgDir, 'favicon-16x16.png'));
  await sharp(inputLogo).resize(32, 32).png().toFile(path.join(imgDir, 'favicon-32x32.png'));
  await sharp(inputLogo).resize(48, 48).png().toFile(path.join(imgDir, 'favicon-48x48.png'));
  await sharp(inputLogo).resize(180, 180).png().toFile(path.join(imgDir, 'apple-touch-icon.png'));
  await sharp(inputLogo).resize(192, 192).png().toFile(path.join(imgDir, 'android-chrome-192x192.png'));
  await sharp(inputLogo).resize(512, 512).png().toFile(path.join(imgDir, 'android-chrome-512x512.png'));
  
  // Generate root favicon.ico (standard 32x32 png is accepted by modern browsers as favicon.ico or 48x48)
  await sharp(inputLogo).resize(32, 32).toFile(path.resolve('favicon.ico'));
  
  console.log('Favicons generated successfully!');
}

generateFavicons().catch(console.error);
