const fs = require('fs');
const path = require('path');

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
  'artifacts/mobile/app/privacy-policy.tsx',
  'artifacts/mobile/components/Onboarding.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Basic replacements for Glass
    if (!content.includes('GlassBackground') && file !== 'artifacts/mobile/components/Onboarding.tsx') {
      content = content.replace(
        'import { useSafeAreaInsets } from "react-native-safe-area-context";',
        'import { useSafeAreaInsets } from "react-native-safe-area-context";\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
      );
    } else if (file !== 'artifacts/mobile/components/Onboarding.tsx' && !content.includes('GlassView')) {
      content = content.replace(
        'import { GlassBackground } from "@/components/GlassBackground";',
        'import { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
      );
    }
    
    // Replace outer View with GlassBackground
    if (file !== 'artifacts/mobile/components/Onboarding.tsx') {
      content = content.replace(
        /<View style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*colors\.background\s*\}\}>/g,
        '<GlassBackground>'
      );
      content = content.replace(
        /<View style=\{styles\.container\}>/g,
        '<GlassBackground style={styles.container}>'
      );
      
      // If we replaced something, ensure closing tags match. 
      // But simple regex for closing View to GlassBackground is risky without AST.
      // Let's rely on string replacement for specific patterns.
    }
    
    fs.writeFileSync(file, content);
  }
}
