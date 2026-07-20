const fs = require('fs');

let content = fs.readFileSync('artifacts/mobile/components/Onboarding.tsx', 'utf8');

// Add imports
if (!content.includes('BlurView')) {
  content = content.replace(
    'import { Feather } from "@expo/vector-icons";',
    'import { BlurView } from "expo-blur";\nimport { LinearGradient } from "expo-linear-gradient";\nimport { Feather } from "@expo/vector-icons";'
  );
}

// Background gradient and glow blobs
content = content.replace(
  /<KeyboardAvoidingView\n\s*style=\{\{ flex: 1, backgroundColor: colors\.background \}\}\n\s*behavior=\{Platform\.OS === "ios" \? "padding" : undefined\}\n\s*>/,
  `<KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#060F1E", "#0B2447", "#19376D"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow1} />
      <View style={styles.glow2} />`
);

// Remove topBand background color
content = content.replace(
  /<View style=\{\[styles\.topBand, \{ paddingTop: insets\.top \+ 16, backgroundColor: colors\.primary \}\]\}>/,
  '<View style={[styles.topBand, { paddingTop: insets.top + 16 }]}>'
);

// Text colors to white / rgba
content = content.replace(/color: colors\.foreground/g, 'color: "#ffffff"');
content = content.replace(/color: colors\.mutedForeground/g, 'color: "rgba(255,255,255,0.7)"');

// Inputs in Step 0
content = content.replace(
  /style=\{\[styles\.input, \{ backgroundColor: colors\.card, color: colors\.foreground, borderColor: colors\.border, \.\.\.shadow \}\]\}/g,
  'style={[styles.input, { borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.09)", color: "#fff", padding: 16, fontSize: 16 }]}'
);

// Feature hint
content = content.replace(
  /style=\{\[styles\.featureHint, \{ color: colors\.mutedForeground, backgroundColor: colors\.muted \}\]\}/g,
  'style={[styles.featureHint, { color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)" }]}'
);

// Step 1 Cards
content = content.replace(
  /style=\{\[\n\s*styles\.catCard,\n\s*\{ backgroundColor: colors\.card, borderColor: colors\.border, \.\.\.shadow \},\n\s*active && \{ borderColor: cat\.color, backgroundColor: cat\.color \+ "12" \},\n\s*\]\}/g,
  `style={[
                      styles.catCard,
                      { backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)" },
                      active && { backgroundColor: cat.color + "22", borderColor: cat.color },
                    ]}`
);

// Step 2 Year List
content = content.replace(
  /style=\{\[styles\.yearList, \{ backgroundColor: colors\.card, \.\.\.shadow \}\]\}/g,
  'style={[styles.yearList, { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", borderRadius: 20 }]}'
);

content = content.replace(
  /style=\{\[\n\s*styles\.yearRow,\n\s*i > 0 && \{ borderTopWidth: StyleSheet\.hairlineWidth, borderTopColor: colors\.border \},\n\s*\{ backgroundColor: active \? currentCat\.color \+ "10" : "transparent" \},\n\s*\]\}/g,
  `style={[
                      styles.yearRow,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.10)" },
                      active ? { backgroundColor: currentCat.color + "18", borderColor: currentCat.color + "40" } : { backgroundColor: "transparent", borderColor: "transparent" },
                      active && { borderWidth: 1, borderRadius: 12 }
                    ]}`
);

// Footer
content = content.replace(
  /<View style=\{\[styles\.footer, \{ paddingBottom: insets\.bottom \+ 16, backgroundColor: colors\.background, borderTopColor: colors\.border \}\]\}>/g,
  '<View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: "transparent", borderTopColor: "rgba(255,255,255,0.10)" }]}>'
);

content = content.replace(
  /style=\{\(\{ pressed \}\) => \[styles\.backBtn, \{ backgroundColor: colors\.muted, opacity: pressed \? 0\.7 : 1 \}\]\}/g,
  'style={({ pressed }) => [styles.backBtn, { backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", opacity: pressed ? 0.7 : 1 }]}'
);

content = content.replace(
  /<Pressable\n\s*style=\{\(\{ pressed \}\) => \[\n\s*styles\.nextBtn,\n\s*\{ backgroundColor: currentCat\.color, flex: step === 0 \? 1 : undefined, opacity: pressed \? 0\.85 : 1 \},\n\s*\]\}\n\s*onPress=\{\(\) => \{\n\s*if \(step < 2\) \{\n\s*animateTo\(step \+ 1\);\n\s*\} else \{\n\s*finish\(\);\n\s*\}\n\s*\}\}\n\s*>\n\s*<Text style=\{styles\.nextBtnText\}>\{step === 2 \? "Get Started" : "Continue"\}<\/Text>\n\s*<Feather name=\{step === 2 \? "check" : "arrow-right"\} size=\{18\} color="#fff" \/>\n\s*<\/Pressable>/,
  `<Pressable
          style={({ pressed }) => [
            { flex: step === 0 ? 1 : undefined, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            if (step < 2) {
              animateTo(step + 1);
            } else {
              finish();
            }
          }}
        >
          <LinearGradient
            colors={step === 2 ? ["#2563EB", "#1D4ED8"] : [currentCat.color, currentCat.color + "90"]}
            style={[styles.nextBtn, { borderRadius: 16 }]}
          >
            <Text style={styles.nextBtnText}>{step === 2 ? "Get Started" : "Continue"}</Text>
            <Feather name={step === 2 ? "check" : "arrow-right"} size={18} color="#fff" />
          </LinearGradient>
        </Pressable>`
);

// Glow styles
content = content.replace(
  /const styles = StyleSheet\.create\(\{/,
  `const styles = StyleSheet.create({
  glow1: {
    position: "absolute", borderRadius: 9999,
    width: 600, height: 600, top: -200, left: -200,
    backgroundColor: "rgba(37,99,235,0.22)",
  },
  glow2: {
    position: "absolute", borderRadius: 9999,
    width: 400, height: 400, bottom: -100, right: -100,
    backgroundColor: "rgba(20,184,166,0.18)",
  },`
);

fs.writeFileSync('artifacts/mobile/components/Onboarding.tsx', content);
