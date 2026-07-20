const fs = require('fs');
let text = fs.readFileSync('artifacts/mobile/app/quiz-history.tsx', 'utf8');

// The main view is not closed because of the fix scripts. We need to correctly wrap it.
// At the end, there is:
//     </View>
//   );
// }
// Let's replace the last </View> with </GlassBackground> because we added <GlassBackground> at the start.
// Actually, in quiz-history.tsx:
// 118:   return (
// 119:     <GlassBackground>
// Then at the end it's `</View>\n  );\n}`. It should be `</GlassBackground>`.
text = text.replace(/<\/View>\n  \);\n}/, '</GlassBackground>\n  );\n}');

fs.writeFileSync('artifacts/mobile/app/quiz-history.tsx', text);
