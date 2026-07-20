const fs = require('fs');

const files = [
  'artifacts/mobile/app/drug-guide/index.tsx',
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

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');

  // Add imports
  if (!text.includes('GlassBackground')) {
    text = text.replace(
      'import { useSafeAreaInsets } from "react-native-safe-area-context";',
      'import { useSafeAreaInsets } from "react-native-safe-area-context";\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
    );
  }

  // Replace background
  // Pattern 1
  text = text.replace(
    /<View style=\{\{ flex: 1, backgroundColor: colors\.background \}\}>/g,
    '<GlassBackground>'
  );
  // Pattern 2
  text = text.replace(
    /<View style=\{styles\.container\}>/g,
    '<GlassBackground style={styles.container}>'
  );
  
  // Closing tag for main view is the last </View> in the component. We can just replace the last </View> with </GlassBackground>
  if (text.includes('<GlassBackground')) {
    const lastIdx = text.lastIndexOf('</View>');
    if (lastIdx !== -1) {
      text = text.substring(0, lastIdx) + '</GlassBackground>' + text.substring(lastIdx + 7);
    }
  }

  // Headers (navHeader or header)
  text = text.replace(
    /<View style=\{\[styles\.navHeader, \{ paddingTop: topPad \+ 8, backgroundColor: colors\.card, borderBottomWidth: StyleSheet\.hairlineWidth, borderBottomColor: colors\.border \}\]\}>/g,
    '<GlassView radius={0} style={[styles.navHeader, { paddingTop: topPad + 8 }]}>'
  );
  text = text.replace(
    /<View style=\{\[styles\.header, \{ paddingTop: topPad \+ 12 \}\]\}>/g,
    '<GlassView radius={0} style={[styles.header, { paddingTop: topPad + 12 }]}>'
  );
  text = text.replace(
    /<View style=\{\[styles\.header, \{ paddingTop: topPad \+ 16 \}\]\}>/g,
    '<GlassView radius={0} style={[styles.header, { paddingTop: topPad + 16 }]}>'
  );
  text = text.replace(
    /<Animated\.View\n\s*style=\{\[styles\.header, \{ opacity: headerOpacity, transform: \[\{ translateY: headerY \}\] \}\]\}\n\s*>/g,
    '<Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerY }] }}><GlassView radius={0} style={styles.header}>'
  );
  
  // Headers in search.tsx
  text = text.replace(
    /<View style=\{styles\.searchHeader\}>/g,
    '<GlassView radius={0} style={styles.searchHeader}>'
  );

  // Headers closing tags
  if (text.includes('styles.navHeader')) {
    text = text.replace(/<\/View>\s*\{\/\* Search bar \*\/\}/g, '</GlassView>\n      {/* Search bar */}');
    text = text.replace(/<\/View>\s*\{\/\* Search Bar \*\/\}/g, '</GlassView>\n      {/* Search Bar */}');
  }
  if (text.includes('styles.header')) {
    text = text.replace(/<\/View>\s*\{\/\* Badges \*\/\}/g, '</GlassView>\n      {/* Badges */}');
    text = text.replace(/<\/View>\s*\{\/\* Warning Banner \*\/\}/g, '</GlassView>\n      {/* Warning Banner */}');
    text = text.replace(/<\/View>\s*\{\/\* Tabs \*\/\}/g, '</GlassView>\n      {/* Tabs */}');
  }
  if (text.includes('styles.searchHeader')) {
    text = text.replace(/<\/View>\n\n\s*\{query\.length > 0 \?/g, '</GlassView>\n\n      {query.length > 0 ?');
  }

  // Cards
  text = text.replace(/backgroundColor: colors\.card/g, 'backgroundColor: colors.glassBg');
  text = text.replace(/borderColor: colors\.border/g, 'borderColor: colors.glassBorder');
  text = text.replace(/colors: colors\.card/g, 'colors: colors.glassBg'); // Not sure if this exists
  
  // Fix background container in styles
  text = text.replace(/container: \{ flex: 1, backgroundColor: colors\.background \},/g, 'container: { flex: 1, backgroundColor: "transparent" },');
  text = text.replace(/container: \{ flex: 1, backgroundColor: "#F8FAFC" \},/g, 'container: { flex: 1, backgroundColor: "transparent" },');

  fs.writeFileSync(file, text);
}
