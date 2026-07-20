const fs = require('fs');
let profile = fs.readFileSync('artifacts/mobile/app/(tabs)/profile.tsx', 'utf8');
if (profile.includes('1.3.0')) console.log('Version is 1.3.0 in profile');
let privacy = fs.readFileSync('artifacts/mobile/app/privacy-policy.tsx', 'utf8');
if (privacy.includes('1.3.0')) console.log('Version is 1.3.0 in privacy');
