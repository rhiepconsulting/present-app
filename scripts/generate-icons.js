import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f1a17"/>
      <stop offset="50%" stop-color="#2c2722"/>
      <stop offset="100%" stop-color="#151210"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf3cd"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#e6c666"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffdfa"/>
      <stop offset="100%" stop-color="#f4efe6"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background base rounded rectangle -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)"/>
  
  <!-- Outer golden ornamental border -->
  <rect x="24" y="24" width="464" height="464" rx="90" fill="none" stroke="url(#goldGrad)" stroke-width="3" opacity="0.6"/>
  <rect x="36" y="36" width="440" height="440" rx="78" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4"/>

  <!-- Centered Luxury Card Element -->
  <g filter="url(#shadow)">
    <!-- Slanted Luxury Card -->
    <rect x="116" y="116" width="280" height="280" rx="36" fill="url(#cardGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
    
    <!-- Card Inner Gold Border -->
    <rect x="130" y="130" width="252" height="252" rx="26" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.5"/>
    
    <!-- Gift Ribbon Cross in Gold -->
    <path d="M 116 236 L 396 236" stroke="url(#goldGrad)" stroke-width="24" opacity="0.9"/>
    <path d="M 236 116 L 236 396" stroke="url(#goldGrad)" stroke-width="24" opacity="0.9"/>
    
    <!-- Ribbon Highlight Inner Lines -->
    <path d="M 116 248 L 396 248" stroke="#fdf3cd" stroke-width="2" opacity="0.8"/>
    <path d="M 248 116 L 248 396" stroke="#fdf3cd" stroke-width="2" opacity="0.8"/>

    <!-- Center Bow / Sparkle Crest -->
    <circle cx="248" cy="248" r="46" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="4" filter="url(#glow)"/>
    <circle cx="248" cy="248" r="38" fill="url(#goldGrad)"/>

    <!-- Sparkling 4-point star in center -->
    <path d="M 248 218 Q 248 248 218 248 Q 248 248 248 278 Q 248 248 278 248 Q 248 248 248 218 Z" fill="#ffffff"/>
    <circle cx="248" cy="248" r="5" fill="#aa7c11"/>

    <!-- Delicate 4-corner clover/star accents inside the card -->
    <path d="M 152 144 Q 152 152 144 152 Q 152 152 152 160 Q 152 152 160 152 Q 152 152 152 144 Z" fill="url(#goldGrad)"/>
    <path d="M 360 144 Q 360 152 352 152 Q 360 152 360 160 Q 360 152 368 152 Q 360 152 360 144 Z" fill="url(#goldGrad)"/>
    <path d="M 152 352 Q 152 360 144 360 Q 152 360 152 368 Q 152 360 160 360 Q 152 360 152 352 Z" fill="url(#goldGrad)"/>
    <path d="M 360 352 Q 360 360 352 360 Q 360 360 360 368 Q 360 360 368 360 Q 360 360 360 352 Z" fill="url(#goldGrad)"/>
  </g>

  <!-- Sparkles around the card -->
  <g fill="url(#goldGrad)" filter="url(#glow)">
    <path d="M 86 160 Q 86 172 74 172 Q 86 172 86 184 Q 86 172 98 172 Q 86 172 86 160 Z"/>
    <path d="M 426 330 Q 426 342 414 342 Q 426 342 426 354 Q 426 342 438 342 Q 426 342 426 330 Z"/>
    <circle cx="106" cy="360" r="4" fill="#fdf3cd"/>
    <circle cx="406" cy="140" r="4" fill="#fdf3cd"/>
  </g>
</svg>`;

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f1a17"/>
      <stop offset="50%" stop-color="#2c2722"/>
      <stop offset="100%" stop-color="#151210"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf3cd"/>
      <stop offset="35%" stop-color="#d4af37"/>
      <stop offset="70%" stop-color="#aa7c11"/>
      <stop offset="100%" stop-color="#e6c666"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffdfa"/>
      <stop offset="100%" stop-color="#f4efe6"/>
    </linearGradient>
  </defs>

  <!-- Full Bleed Background for Maskable Icon -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  
  <!-- Safe zone scaled group (80% scale centered) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <rect x="24" y="24" width="464" height="464" rx="90" fill="none" stroke="url(#goldGrad)" stroke-width="3" opacity="0.6"/>
    
    <rect x="116" y="116" width="280" height="280" rx="36" fill="url(#cardGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
    <rect x="130" y="130" width="252" height="252" rx="26" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.5"/>
    
    <path d="M 116 236 L 396 236" stroke="url(#goldGrad)" stroke-width="24" opacity="0.9"/>
    <path d="M 236 116 L 236 396" stroke="url(#goldGrad)" stroke-width="24" opacity="0.9"/>
    <path d="M 116 248 L 396 248" stroke="#fdf3cd" stroke-width="2" opacity="0.8"/>
    <path d="M 248 116 L 248 396" stroke="#fdf3cd" stroke-width="2" opacity="0.8"/>

    <circle cx="248" cy="248" r="46" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
    <circle cx="248" cy="248" r="38" fill="url(#goldGrad)"/>
    <path d="M 248 218 Q 248 248 218 248 Q 248 248 248 278 Q 248 248 278 248 Q 248 248 248 218 Z" fill="#ffffff"/>
    <circle cx="248" cy="248" r="5" fill="#aa7c11"/>
  </g>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

  // 2. Generate PNGs using sharp
  const svgBuffer = Buffer.from(svgContent);
  const maskableBuffer = Buffer.from(maskableSvg);

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // favicon 32x32
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated all PWA icons!');
}

main().catch(console.error);
