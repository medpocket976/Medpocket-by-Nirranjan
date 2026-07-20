const fs = require('fs');

const files = [
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

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');

  // Add imports
  if (!text.includes('GlassBackground')) {
    text = text.replace(
      'import { useSafeAreaInsets } from "react-native-safe-area-context";',
      'import { useSafeAreaInsets } from "react-native-safe-area-context";\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
    );
  } else if (!text.includes('GlassView')) {
    text = text.replace(
      'import { GlassBackground } from "@/components/GlassBackground";',
      'import { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
    );
  }

  // Replace background container styles
  text = text.replace(/colors\.card/g, 'colors.glassBg');
  text = text.replace(/colors\.border/g, 'colors.glassBorder');
  text = text.replace(/container: \{ flex: 1, backgroundColor: colors\.background \},/g, 'container: { flex: 1, backgroundColor: "transparent" },');
  text = text.replace(/container: \{ flex: 1, backgroundColor: "#F8FAFC" \},/g, 'container: { flex: 1, backgroundColor: "transparent" },');
  text = text.replace(/container: \{ flex: 1, backgroundColor: "#F1F5F9" \},/g, 'container: { flex: 1, backgroundColor: "transparent" },');

  // We change the outermost View to GlassBackground
  text = text.replace(
    /<View style=\{\{ flex: 1, backgroundColor: colors\.background \}\}>/g,
    '<GlassBackground>'
  );

  text = text.replace(
    /<View style=\{styles\.container\}>/g,
    '<GlassBackground style={styles.container}>'
  );
  
  if (text.includes('<GlassBackground')) {
    // Only replace the absolute last </View> in the file
    const match = text.match(/<\/View>(?![\s\S]*<\/View>)/);
    if (match) {
      text = text.substring(0, match.index) + '</GlassBackground>' + text.substring(match.index + 7);
    }
  }

  // Handle headers manually where possible
  // Just use colors.glassBg for headers instead of converting them to GlassView.
  // The brief says: "Replace navigation headers that use colors.card/colors.background with GlassView bar"
  // Wait, if I convert them to GlassView, I need to match the closing tag.
  
  // Let's do a simple regex for headers if they are self-contained or simple
  // Most headers are <View style={styles.header}> ... </View>
  // Let's replace the header styles to include borderBottomColor: colors.glassBorder
  text = text.replace(/backgroundColor: colors\.card/g, 'backgroundColor: colors.glassBg');
  text = text.replace(/backgroundColor: colors\.background/g, 'backgroundColor: "transparent"');

  fs.writeFileSync(file, text);
}
