const fs = require('fs');

function processFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace container backgroundColor: colors.background
  content = content.replace(
    /container: \{ flex: 1, backgroundColor: colors\.background \},/g,
    'container: { flex: 1, backgroundColor: "transparent" },'
  );

  // Replace nav header
  content = content.replace(
    /<View style=\{\[styles\.header, \{ paddingTop: topPad \+ 12 \}\]\}>/g,
    '<GlassView radius={0} style={[styles.header, { paddingTop: topPad + 12 }]}>'
  );
  content = content.replace(
    /<\/View>\n\n\s*\{\/\* Badges/g,
    '</GlassView>\n\n      {/* Badges'
  );
  content = content.replace(
    /<\/View>\n\n\s*\{\/\* Tabs \*\/\}/g,
    '</GlassView>\n\n      {/* Tabs */}'
  );
  content = content.replace(
    /<\/View>\n\n\s*\{\/\* Warning Banner/g,
    '</GlassView>\n\n      {/* Warning Banner'
  );

  // Replace search bar in search.tsx
  if (file.includes('search.tsx')) {
    content = content.replace(
      /<View style=\{styles\.searchBox\}>/g,
      '<GlassView radius={12} style={styles.searchBox}>'
    );
    content = content.replace(
      /<\/View>\n\s*<\/View>\n\n\s*\{query\.length > 0 \?/g,
      '</GlassView>\n      </View>\n\n      {query.length > 0 ?'
    );
    content = content.replace(
      /searchBox: \{\n\s*flex: 1, flexDirection: "row", alignItems: "center", gap: 10,\n\s*backgroundColor: colors\.card, borderRadius: 12,\n\s*paddingHorizontal: 14, paddingVertical: 11,\n\s*borderWidth: 1, borderColor: colors\.border,\n\s*\}/g,
      'searchBox: {\n      flex: 1, flexDirection: "row", alignItems: "center", gap: 10,\n      paddingHorizontal: 14, paddingVertical: 11,\n    }'
    );
    content = content.replace(
      /resultCard: \{\n\s*flexDirection: "row", alignItems: "center", gap: 12,\n\s*backgroundColor: colors\.card, borderRadius: 14, padding: 14,\n\s*marginBottom: 8, borderWidth: 1, borderColor: colors\.border,\n\s*\}/g,
      'resultCard: {\n      flexDirection: "row", alignItems: "center", gap: 12,\n      backgroundColor: colors.glassBg, borderRadius: 14, padding: 14,\n      marginBottom: 8, borderWidth: 1, borderColor: colors.glassBorder,\n    }'
    );
  }

  // Replace InfoCard / ListCard in detail screens
  content = content.replace(
    /backgroundColor: highlight \? colors\.tealLight : colors\.card,/g,
    'backgroundColor: highlight ? colors.tealLight : colors.glassBg,'
  );
  content = content.replace(
    /borderColor: highlight \? colors\.primary \+ "40" : colors\.border,/g,
    'borderColor: highlight ? colors.primary + "40" : colors.glassBorder,'
  );
  content = content.replace(
    /<View style=\{\[infoStyles\.card, \{ backgroundColor: colors\.card, borderColor: colors\.border \}\]\}>/g,
    '<GlassView radius={14} style={infoStyles.card}>'
  );
  content = content.replace(
    /<\/View>\n\s*\);/g,
    '</GlassView>\n  );'
  );

  fs.writeFileSync(file, content);
}

const files = [
  'artifacts/mobile/app/drug-guide/[id].tsx',
  'artifacts/mobile/app/search.tsx',
  'artifacts/mobile/app/emergency/index.tsx',
  'artifacts/mobile/app/emergency/[id].tsx'
];

files.forEach(processFile);
