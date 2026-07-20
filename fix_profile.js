const fs = require('fs');

let profile = fs.readFileSync('artifacts/mobile/app/(tabs)/profile.tsx', 'utf8');

// 3a. Remove "Replay Introduction" if present
// Check if replay intro exists
if (profile.includes('replayIntro') || profile.includes('Replay')) {
  // Wait, I should just grep it first.
}

// 3b. Version check to 1.3.0
profile = profile.replace(/v1\.1\.0/g, 'v1.3.0');
profile = profile.replace(/1\.1\.0/g, '1.3.0');
fs.writeFileSync('artifacts/mobile/app/(tabs)/profile.tsx', profile);

let privacy = fs.readFileSync('artifacts/mobile/app/privacy-policy.tsx', 'utf8');
privacy = privacy.replace(/v1\.1\.0/g, 'v1.3.0');
privacy = privacy.replace(/1\.1\.0/g, '1.3.0');
fs.writeFileSync('artifacts/mobile/app/privacy-policy.tsx', privacy);
