const fs = require('fs');
const glob = require('glob'); // Need to find all files

const globSync = function(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = dir + '/' + file;
    if (fs.statSync(filePath).isDirectory()) {
      globSync(filePath, fileList);
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
};

const allFiles = globSync('artifacts/mobile/app');

for (const file of allFiles) {
  if (file.includes('(tabs)') || file.includes('+html') || file.includes('+not-found') || file.includes('onboarding.tsx')) {
    continue; // Skip tabs and special files
  }

  let content = fs.readFileSync(file, 'utf8');

  // Replace background container view
  content = content.replace(/<View style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*colors\.background\s*\}\}>/g, '<GlassBackground>');
  content = content.replace(/<View style=\{styles\.container\}>/g, '<GlassBackground style={styles.container}>');
  
  if (content.includes('<GlassBackground')) {
    const lastViewIndex = content.lastIndexOf('</View>');
    if (lastViewIndex > -1 && !content.substring(lastViewIndex).includes('</GlassBackground>')) {
      content = content.substring(0, lastViewIndex) + '</GlassBackground>' + content.substring(lastViewIndex + 7);
    }
  }

  // Common UI replacements
  // Search Bar
  content = content.replace(
    /<View style=\{\[styles\.searchBar, \{ backgroundColor: colors\.muted \}\]\}>/g,
    '<GlassView radius={16} style={styles.searchBar}>'
  );
  
  // Cards (generic)
  content = content.replace(
    /backgroundColor: colors\.card/g,
    'backgroundColor: colors.glassBg'
  );
  content = content.replace(
    /borderColor: colors\.border/g,
    'borderColor: colors.glassBorder'
  );
  
  // Specifically for list rows that are Pressable
  // We can't safely regex everything without breaking some layout, but we can change colors.card to colors.glassBg in styles
  content = content.replace(/colors\.card/g, 'colors.glassBg');
  content = content.replace(/colors\.border/g, 'colors.glassBorder');
  content = content.replace(/colors\.background/g, '"transparent"');

  // Header Nav Bar
  content = content.replace(
    /<View style=\{\[styles\.navHeader/g,
    '<GlassView radius={0} style={[styles.navHeader'
  );
  content = content.replace(
    /<View style=\{\[styles\.header/g,
    '<GlassView radius={0} style={[styles.header'
  );

  // Re-check imports
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

  fs.writeFileSync(file, content);
}

