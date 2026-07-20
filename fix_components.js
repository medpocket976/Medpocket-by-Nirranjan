const fs = require('fs');

function processFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Add imports
  if (!content.includes('GlassBackground')) {
    content = content.replace(
      'import { useSafeAreaInsets } from "react-native-safe-area-context";',
      'import { useSafeAreaInsets } from "react-native-safe-area-context";\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
    );
  } else if (!content.includes('GlassView')) {
    content = content.replace(
      'import { GlassBackground } from "@/components/GlassBackground";',
      'import { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
    );
  }

  // Replace wrapper view
  content = content.replace(/<View style=\{styles\.container\}>/, '<GlassBackground style={styles.container}>');
  // Find the matching closing View. This is hard with regex, so we'll just replace the last </View>
  const lastViewIndex = content.lastIndexOf('</View>');
  if (lastViewIndex !== -1 && content.includes('<GlassBackground')) {
    content = content.substring(0, lastViewIndex) + '</GlassBackground>' + content.substring(lastViewIndex + 7);
  }

  fs.writeFileSync(file, content);
}

const files = [
  'artifacts/mobile/app/drug-guide/[id].tsx',
  'artifacts/mobile/app/search.tsx',
  'artifacts/mobile/app/emergency/index.tsx',
  'artifacts/mobile/app/emergency/[id].tsx',
  'artifacts/mobile/app/lab-values/index.tsx',
  'artifacts/mobile/app/calculators/index.tsx',
  'artifacts/mobile/app/calculators/[id].tsx',
  'artifacts/mobile/app/medical-calculators/index.tsx',
  'artifacts/mobile/app/medical-calculators/[id].tsx',
  'artifacts/mobile/app/clinical-exam/index.tsx',
  'artifacts/mobile/app/clinical-exam/[id].tsx',
  'artifacts/mobile/app/anaesthesia-equipment/index.tsx',
  'artifacts/mobile/app/anaesthesia-equipment/[id].tsx',
  'artifacts/mobile/app/anaesthesia-calc.tsx',
  'artifacts/mobile/app/notes/[id].tsx',
  'artifacts/mobile/app/quiz/[subject].tsx',
  'artifacts/mobile/app/quiz-history.tsx',
  'artifacts/mobile/app/privacy-policy.tsx'
];

files.forEach(processFile);
