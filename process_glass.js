const fs = require('fs');

function applyGlass(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports if missing
  if (!content.includes('GlassBackground')) {
    content = content.replace(
      'import React',
      'import { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";\nimport React'
    );
  } else if (!content.includes('GlassView')) {
    content = content.replace(
      'import { GlassBackground }',
      'import { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView }'
    );
  }

  // Common replacements
  content = content.replace(/<View style=\{\{\s*flex: 1,\s*backgroundColor: colors\.background\s*\}\}>/g, '<GlassBackground>');
  content = content.replace(/<View style=\{styles\.container\}>/g, '<GlassBackground style={styles.container}>');
  content = content.replace(/<\/View>\s*$/g, '</GlassBackground>\n'); // Rough replacement for the wrapper

  fs.writeFileSync(filePath, content);
}
