const fs = require('fs');

function applyGlass(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;

  // 1. Add imports
  if (!content.includes('GlassBackground')) {
    content = content.replace(
      /import\s+React\b[^;]*;/,
      '$&\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
    );
    changed = true;
  } else if (!content.includes('GlassView')) {
    content = content.replace(
      'import { GlassBackground } from "@/components/GlassBackground";',
      'import { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
    );
    changed = true;
  }

  // Helper to replace opening tag and its exact matching closing tag
  function replaceTagPair(content, openTagRegex, newOpenTag, newCloseTag) {
    let match = content.match(openTagRegex);
    if (!match) return content;

    const startIdx = match.index;
    const endIdx = startIdx + match[0].length;
    
    // Find matching closing tag
    let depth = 1;
    let i = endIdx;
    while (i < content.length && depth > 0) {
      if (content.substring(i, i + 5) === '<View' && (content[i+5] === ' ' || content[i+5] === '>')) {
        depth++;
        i += 5;
      } else if (content.substring(i, i + 7) === '</View>') {
        depth--;
        if (depth === 0) {
          // Replace closing tag first to not mess up indices
          content = content.substring(0, i) + newCloseTag + content.substring(i + 7);
          content = content.substring(0, startIdx) + newOpenTag + content.substring(endIdx);
          return content;
        }
        i += 7;
      } else {
        i++;
      }
    }
    return content;
  }

  // 2. Replace container
  let prevContent = content;
  content = replaceTagPair(content, /<View style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*colors\.background\s*\}\}>/, '<GlassBackground>', '</GlassBackground>');
  if (content === prevContent) {
    content = replaceTagPair(content, /<View style=\{styles\.container\}>/, '<GlassBackground style={styles.container}>', '</GlassBackground>');
  }

  // 3. Headers
  // We can't do exact matching easily for all headers if they don't have nested Views, but replaceTagPair works perfectly!
  content = replaceTagPair(content, /<View style=\{\[styles\.navHeader[^>]*\]\}>/, '<GlassView radius={0} style={[styles.navHeader, { paddingBottom: 12 }]} /* injected */>', '</GlassView>');
  content = replaceTagPair(content, /<View style=\{\[styles\.header[^>]*\]\}>/, '<GlassView radius={0} style={[styles.header, { paddingBottom: 12 }]} /* injected */>', '</GlassView>');
  content = replaceTagPair(content, /<View style=\{styles\.searchHeader\}>/, '<GlassView radius={0} style={styles.searchHeader}>', '</GlassView>');
  
  // 4. Search bars
  content = replaceTagPair(content, /<View style=\{\[styles\.searchBar[^>]*\]\}>/, '<GlassView radius={16} style={[styles.searchBar, { backgroundColor: "transparent" }]}>', '</GlassView>');
  content = replaceTagPair(content, /<View style=\{styles\.searchBox\}>/, '<GlassView radius={12} style={styles.searchBox}>', '</GlassView>');

  // 5. Replace generic colors.card and colors.border in styles (and JSX)
  // Be careful with colors.card inside style arrays
  content = content.replace(/colors\.card/g, 'colors.glassBg');
  content = content.replace(/colors\.border/g, 'colors.glassBorder');
  content = content.replace(/backgroundColor: colors\.background/g, 'backgroundColor: "transparent"');
  content = content.replace(/backgroundColor: "#F8FAFC"/g, 'backgroundColor: "transparent"');
  content = content.replace(/backgroundColor: "#F1F5F9"/g, 'backgroundColor: "transparent"');

  // 6. Any other components replacing View with GlassView
  // In search.tsx results
  content = content.replace(/resultCard: \{\n\s*flexDirection:/g, 'resultCard: {\n      flexDirection:');

  // In drug-guide/index.tsx row
  content = content.replace(
    /style=\{\(\{ pressed \}\) => \[\n\s*styles\.row,\n\s*\{ backgroundColor: pressed \? colors\.muted : colors\.glassBg \},\n\s*\]\}/g,
    `style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.glassBgStrong : colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1, borderRadius: 16, marginHorizontal: 16, marginBottom: 12 }]}`
  );
  
  if (content !== prevContent || changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

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
  applyGlass(file);
}
