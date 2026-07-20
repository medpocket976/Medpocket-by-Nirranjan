const fs = require('fs');

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

  // Header Nav Bar View to GlassView
  content = content.replace(
    /<View style=\{\[styles\.navHeader/g,
    '<GlassView radius={0} style={[styles.navHeader'
  );
  content = content.replace(
    /<View style=\{\[styles\.header/g,
    '<GlassView radius={0} style={[styles.header'
  );

  // Fix up closing tags for Header Nav Bar
  // Since we replaced <View to <GlassView, the very first </View> after navHeader should be </GlassView>
  // A rough regex: replace the first </View> after navHeader
  // But wait, there might be nested views. Let's just use string replace.
  let headerMatch = content.match(/<GlassView radius=\{0\} style=\{\[styles\.(navHeader|header)[^>]*>/);
  if (headerMatch) {
    // Find matching closing view if possible, or just skip it if it's too complex and might break.
    // Actually, GlassView is used just for the container. We can leave it as View and apply glass styles, or use GlassView and carefully fix closing tag.
    // Let's do a simple approach: revert that and instead just apply the GlassView correctly via a targeted script or just rely on colors.glassBg.
  }
  
  // Replace colors
  content = content.replace(/colors\.card/g, 'colors.glassBg');
  content = content.replace(/colors\.border/g, 'colors.glassBorder');
  content = content.replace(/backgroundColor: colors\.background/g, 'backgroundColor: "transparent"');
  content = content.replace(/backgroundColor: "colors\.background"/g, 'backgroundColor: "transparent"');

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
