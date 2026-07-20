const fs = require('fs');

function revertInner(file) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');

  // Replace accidental <GlassBackground> tags inside the file
  text = text.replace(/<GlassBackground[^>]*>/g, (match, offset) => {
    // If it's the very first one, keep it
    if (offset < text.indexOf('return (')) return match; 
    
    // Find index of 'return ('
    const returnIdx = text.indexOf('return (');
    const firstGlassIdx = text.indexOf('<GlassBackground', returnIdx);
    
    if (offset === firstGlassIdx) return match;
    
    // Replace with View
    if (match === '<GlassBackground>') return '<View>';
    return match.replace('<GlassBackground', '<View');
  });

  text = text.replace(/<\/GlassBackground>/g, (match, offset) => {
    // If it's the very last one, keep it
    const lastGlassIdx = text.lastIndexOf('</GlassBackground>');
    if (offset === lastGlassIdx) return match;
    
    return '</View>';
  });

  // Make sure the last closing tag is GlassBackground
  if (text.includes('<GlassBackground')) {
    const lastViewIdx = text.lastIndexOf('</View>');
    const lastGlassIdx = text.lastIndexOf('</GlassBackground>');
    if (lastViewIdx > lastGlassIdx) {
      text = text.substring(0, lastViewIdx) + '</GlassBackground>' + text.substring(lastViewIdx + 7);
    } else if (lastGlassIdx > -1 && text.lastIndexOf('</GlassBackground>', lastGlassIdx - 1) > -1) {
      // Multiple closing GlassBackgrounds. Make all but last into </View>
    }
  }

  fs.writeFileSync(file, text);
}

revertInner('artifacts/mobile/app/anaesthesia-calc.tsx');
revertInner('artifacts/mobile/app/emergency/[id].tsx');
revertInner('artifacts/mobile/app/medical-calculators/[id].tsx');

// quiz-history.tsx
let qh = fs.readFileSync('artifacts/mobile/app/quiz-history.tsx', 'utf8');
qh = qh.replace(/<GlassBackground>/g, (m, offset) => offset === qh.indexOf('<GlassBackground') ? m : '<View>');
qh = qh.replace(/<\/GlassBackground>/g, (m, offset) => offset === qh.lastIndexOf('</GlassBackground>') ? m : '</View>');
if (qh.lastIndexOf('</View>') > qh.lastIndexOf('</GlassBackground>')) {
  qh = qh.replace(/<\/View>\n\s*\);\n\}/, '</GlassBackground>\n  );\n}');
}
// check specific lines in quiz history
qh = qh.replace(/<\/GlassBackground>\s*<\/GlassBackground>/g, '</GlassBackground>');
fs.writeFileSync('artifacts/mobile/app/quiz-history.tsx', qh);
