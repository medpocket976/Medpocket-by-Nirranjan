const fs = require('fs');

function updateFile(file, replacer) {
  if (fs.existsSync(file)) {
    const original = fs.readFileSync(file, 'utf8');
    const updated = replacer(original);
    if (original !== updated) {
      fs.writeFileSync(file, updated, 'utf8');
      console.log('Updated ' + file);
    }
  }
}

// 1. Profile
updateFile('artifacts/mobile/app/(tabs)/profile.tsx', (text) => {
  text = text.replace(/v1\.1\.0/g, 'v1.3.0');
  
  // Remove "Replay Introduction" block if present
  // Search for the Pressable that contains replayIntro
  const replayRegex = /<Pressable\s+onPress=\{replayIntro\}[^>]*>[\s\S]*?<\/Pressable>/g;
  text = text.replace(replayRegex, '');
  
  return text;
});

// 2. Privacy Policy
updateFile('artifacts/mobile/app/privacy-policy.tsx', (text) => {
  text = text.replace(/v1\.1\.0/g, 'v1.3.0');
  
  // We also need to apply Glass background to Privacy Policy
  if (!text.includes('GlassBackground')) {
    text = text.replace('import { useSafeAreaInsets } from "react-native-safe-area-context";', 
    'import { useSafeAreaInsets } from "react-native-safe-area-context";\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";');
  }
  
  text = text.replace(/<View style=\{s\.container\}>/, '<GlassBackground style={s.container}>');
  text = text.replace(/<\/ScrollView>\n\s*<\/View>\n\s*\);\n\s*\}/, '</ScrollView>\n    </GlassBackground>\n  );\n}');
  
  text = text.replace(/container:\s*\{\s*flex:\s*1,\s*backgroundColor:\s*colors\.background\s*\}/, 
    'container: { flex: 1, backgroundColor: "transparent" }');
    
  text = text.replace(/backgroundColor:\s*colors\.card/g, 'backgroundColor: colors.glassBg');
  
  return text;
});
