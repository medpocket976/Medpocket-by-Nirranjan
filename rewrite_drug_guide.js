const fs = require('fs');

let content = fs.readFileSync('artifacts/mobile/app/drug-guide/index.tsx', 'utf8');

// 1. Add Imports
if (!content.includes('GlassBackground')) {
  content = content.replace(
    'import { useSafeAreaInsets } from "react-native-safe-area-context";',
    'import { useSafeAreaInsets } from "react-native-safe-area-context";\nimport { GlassBackground } from "@/components/GlassBackground";\nimport { GlassView } from "@/components/GlassView";'
  );
}

if (!content.includes('Animated,')) {
  content = content.replace('FlatList,', 'Animated,\n  FlatList,');
  content = content.replace('useMemo, useState', 'useEffect, useMemo, useRef, useState');
}

// 2. Wrap DrugRow
content = content.replace(
  /style=\{\(\{ pressed \}\) => \[\n\s*styles\.row,\n\s*\{ backgroundColor: pressed \? colors\.muted : colors\.card \},\n\s*\]\}/g,
  `style={({ pressed }) => [\n        styles.row,\n        { backgroundColor: pressed ? colors.glassBgStrong : colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1, borderRadius: 16, marginHorizontal: 16, marginBottom: 12 }\n      ]}`
);

// 3. Main Return replacement
content = content.replace(
  /<View style=\{\{ flex: 1, backgroundColor: colors\.background \}\}>/g,
  '<GlassBackground>'
);
content = content.replace(
  /<\/View>\s*$/g,
  '</GlassBackground>\n'
);

// 4. Header Replacement
content = content.replace(
  /<View style=\{\[styles\.navHeader, \{ paddingTop: topPad \+ 8, backgroundColor: colors\.card, borderBottomWidth: StyleSheet\.hairlineWidth, borderBottomColor: colors\.border \}\]\}>/g,
  '<GlassView radius={0} style={[styles.navHeader, { paddingTop: topPad + 8, paddingBottom: 12 }]}>'
);
content = content.replace(
  /<\/View>\n\n\s*\{\/\* Search bar \*\/\}/g,
  '</GlassView>\n\n      {/* Search bar */}'
);

// 5. Search Bar Replacement
content = content.replace(
  /<View style=\{\[styles\.searchWrap, \{ backgroundColor: colors\.card \}\]\}>/g,
  '<View style={styles.searchWrap}>'
);
content = content.replace(
  /<View style=\{\[styles\.searchBar, \{ backgroundColor: colors\.muted \}\]\}>/g,
  '<GlassView radius={16} style={styles.searchBar}>'
);
content = content.replace(
  /<\/View>\n\s*<\/View>\n\n\s*\{\/\* Category filter chips \*\/\}/g,
  '</GlassView>\n      </View>\n\n      {/* Category filter chips */}'
);

// 6. Category Filter Wrapper
content = content.replace(
  /<View style=\{\[styles\.categoryWrap, \{ backgroundColor: colors\.card, borderBottomWidth: StyleSheet\.hairlineWidth, borderBottomColor: colors\.border \}\]\}>/g,
  '<View style={styles.categoryWrap}>'
);

// 7. Category Chips
content = content.replace(
  /style=\{\[\n\s*styles\.catChip,\n\s*active\n\s*\? \{ backgroundColor: accent \+ "20", borderColor: accent \}\n\s*: \{ backgroundColor: colors\.muted, borderColor: colors\.border \},\n\s*\]\}\n\s*accessibilityRole="button"\n\s*accessibilityState=\{\{ selected: active \}\}\n\s*>\n\s*\{cat !== "All" && \(\n\s*<View style=\{\[styles\.catDot, \{ backgroundColor: accent \}\]\} \/>\n\s*\)\}\n\s*<Text style=\{\[styles\.catText, \{ color: active \? accent : colors\.foreground \}\]\}>\{cat\}<\/Text>\n\s*<\/Pressable>/g,
  `accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <GlassView
                  radius={20}
                  bgColor={active ? accent : undefined}
                  borderColor={active ? accent + "60" : undefined}
                  style={styles.catChip}
                >
                  {cat !== "All" && (
                    <View style={[styles.catDot, { backgroundColor: accent }]} />
                  )}
                  <Text style={[styles.catText, { color: active ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
                </GlassView>
              </Pressable>`
);

// 8. Add Animations
content = content.replace(
  /const goBack = useCallback\(\(\) => router\.back\(\), \[\]\);/g,
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

content = content.replace(
  /<FlatList/g,
  '<Animated.FlatList\n        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}'
);

fs.writeFileSync('artifacts/mobile/app/drug-guide/index.tsx', content);
