const fs = require('fs');

let content = fs.readFileSync('artifacts/mobile/app/drug-guide/index.tsx', 'utf8');

// Add imports
content = content.replace(
  'import { useSafeAreaInsets } from "react-native-safe-area-context";',
  'import { useSafeAreaInsets } from "react-native-safe-area-context";\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
);

// Add entrance animations
if (!content.includes('Animated,')) {
    content = content.replace('FlatList,', 'Animated,\n  FlatList,');
    content = content.replace('useMemo, useState', 'useMemo, useState, useRef, useEffect');
}

// In DrugGuideScreen
content = content.replace(
  'const goBack = useCallback(() => router.back(), []);',
  `const goBack = useCallback(() => router.back(), []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);`
);

// Replace wrapper
content = content.replace(
  '<View style={{ flex: 1, backgroundColor: colors.background }}>',
  '<GlassBackground>'
);
content = content.replace(
  /<\/View>\s*$/,
  '</GlassBackground>\n'
);

// Replace FlatList with Animated.FlatList wrapper
content = content.replace(
  '<FlatList',
  '<Animated.FlatList\n        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}'
);

// Replace Header
content = content.replace(
  '<View style={[styles.navHeader, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>',
  '<GlassView style={[styles.navHeader, { paddingTop: topPad + 8, paddingBottom: 12 }]} radius={0}>'
);
content = content.replace(
  '<Text style={[styles.navTitle, { color: colors.foreground }]}>Drug Guide</Text>',
  '<Text style={[styles.navTitle, { color: colors.foreground }]}>Drug Guide</Text>'
);
content = content.replace(
  /<\/View>\s*\{\/\* Search bar \*\/\}/,
  '</GlassView>\n\n      {/* Search bar */}'
);

// Search Bar
content = content.replace(
  '<View style={[styles.searchWrap, { backgroundColor: colors.card }]}>',
  '<View style={styles.searchWrap}>'
);
content = content.replace(
  '<View style={[styles.searchBar, { backgroundColor: colors.muted }]}>',
  '<GlassView style={styles.searchBar} radius={16}>'
);
content = content.replace(
  /<\/View>\s*<\/View>\s*\{\/\* Category filter chips \*\/\}/,
  '</GlassView>\n      </View>\n\n      {/* Category filter chips */}'
);

// Category filter chips
content = content.replace(
  '<View style={[styles.categoryWrap, { backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>',
  '<View style={styles.categoryWrap}>'
);
content = content.replace(
  'styles.catChip,\n                  active\n                    ? { backgroundColor: accent + "20", borderColor: accent }\n                    : { backgroundColor: colors.muted, borderColor: colors.border },',
  'styles.catChip'
);

// Replace catChip Pressable with Pressable + GlassView inside?
// Wait, replacing the category row
content = content.replace(
  /<Pressable[\s\S]*?accessibilityState=\{\{ selected: active \}\}\s*>/g,
  (match) => {
    return match.replace('<Pressable', '<Pressable') + '\n                <GlassView radius={20} bgColor={active ? accent : undefined} borderColor={active ? accent + "60" : undefined} style={[styles.catChip, active ? { backgroundColor: accent + "20", borderColor: accent } : { backgroundColor: "transparent" }]}>';
  }
);
content = content.replace(
  /<\/Pressable>/g,
  (match, offset, str) => {
    // Only replace the ones in the category list?
    return '</GlassView>\n              </Pressable>';
  }
);

fs.writeFileSync('artifacts/mobile/app/drug-guide/index.tsx.tmp', content);
