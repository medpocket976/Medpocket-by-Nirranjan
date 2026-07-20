const fs = require('fs');

let content = fs.readFileSync('artifacts/mobile/app/(tabs)/profile.tsx', 'utf8');

// Remove Replay Introduction from Settings
// Look for handleResetName, cycleTheme, etc.
content = content.replace(
  /<Pressable onPress=\{handleResetName\}.*?<\/Pressable>/s,
  ''
);

content = content.replace(
  /const handleResetName =.*?\}, \[resetName\]\);/s,
  ''
);

content = content.replace(
  /resetName,/g,
  ''
);

fs.writeFileSync('artifacts/mobile/app/(tabs)/profile.tsx', content);
