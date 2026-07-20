const fs = require('fs');

const files = [
  'artifacts/mobile/app/clinical-exam/[id].tsx',
  'artifacts/mobile/app/clinical-exam/index.tsx',
  'artifacts/mobile/app/drug-guide/index.tsx',
  'artifacts/mobile/app/emergency/index.tsx',
  'artifacts/mobile/app/medical-calculators/index.tsx',
  'artifacts/mobile/app/quiz/[subject].tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');

  // Revert GlassBackground at the bottom if it was incorrectly added
  // Or fix the nested </View> issue.
  
  if (text.includes('</GlassBackground>')) {
     text = text.replace(/<\/GlassBackground>\s*$/g, '</View>\n');
  }

  // Also replace <GlassBackground> back to <View> if it was broken, 
  // and we'll apply it more carefully.
  // Actually, wait, it says: "Expected corresponding JSX closing tag for 'GlassBackground'."
  // This means <GlassBackground> exists but isn't closed.
  
  if (text.includes('<GlassBackground>')) {
     // Find the last </View> and replace it with </GlassBackground>
     const parts = text.split('</View>');
     if (parts.length > 1) {
       text = parts.slice(0, -1).join('</View>') + '</GlassBackground>' + parts[parts.length - 1];
     }
  }

  // Remove duplicate </GlassBackground>
  text = text.replace(/<\/GlassBackground>\s*<\/GlassBackground>/g, '</GlassBackground>');

  fs.writeFileSync(file, text);
}
