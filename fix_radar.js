const fs = require('fs');
const content = fs.readFileSync('globals.txt', 'utf8');
const start = content.indexOf('.so-radar-card {');
const end = content.indexOf('/* ===========================================================\n     CRYPTO EVENTS');
if (start > 0 && end > start) {
  const radarCSS = content.substring(start, end);
  fs.appendFileSync('src/app/special-offer/SpecialOffer.module.css', "\n\n/* --- RESTORED RADAR 3D CSS --- */\n" + radarCSS);
  console.log('Successfully recovered Airdrop Radar CSS!');
} else {
  console.log('Failed to find bounds for radar CSS.');
}
