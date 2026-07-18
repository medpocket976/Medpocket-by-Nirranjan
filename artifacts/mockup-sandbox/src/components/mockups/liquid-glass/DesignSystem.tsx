import './_group.css';

function Swatch({ color, label, hex }: { color: string; label: string; hex: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <div style={{ width:52, height:52, borderRadius:16, background:color,
        boxShadow:`0 4px 16px ${color}55, inset 0 1px 0 rgba(255,255,255,0.35)` }} />
      <div style={{ fontSize:10, fontWeight:700, color:'#0a1628', textAlign:'center' }}>{label}</div>
      <div style={{ fontSize:9, color:'rgba(26,58,74,0.5)', fontFamily:'monospace' }}>{hex}</div>
    </div>
  );
}

function GlassCard({ title, children, accent = '#009DB5' }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.48)', backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.70)',
      borderRadius:22, padding:'16px',
      boxShadow:'0 4px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
      marginBottom:12,
    }}>
      <div style={{ fontSize:11, fontWeight:700, color:accent, textTransform:'uppercase',
        letterSpacing:1, marginBottom:12 }}>{title}</div>
      {children}
    </div>
  );
}

export function DesignSystem() {
  return (
    <div style={{
      width:390, minHeight:844,
      background:'linear-gradient(160deg, #e8f8fb 0%, #d8f2f8 40%, #cce4ff 100%)',
      position:'relative', overflow:'hidden', fontFamily:'var(--font-base)',
    }}>
      <div style={{ position:'absolute', top:-40, right:-40, width:240, height:240,
        background:'radial-gradient(circle, rgba(0,198,216,0.28) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(24px)', zIndex:0 }} />
      <div style={{ position:'absolute', bottom:200, left:-60, width:200, height:200,
        background:'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(20px)', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, padding:'0 20px 40px' }}>
        {/* Status */}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 4px 0',
          fontSize:12, fontWeight:600, color:'#1a3a4a' }}>
          <span>9:41</span>
          <div style={{ display:'flex', gap:6 }}><span>📶</span><span>🔋</span></div>
        </div>

        <div style={{ padding:'18px 4px 20px' }}>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#0a1628', letterSpacing:-0.5 }}>Design System</h1>
          <p style={{ fontSize:13, color:'rgba(26,58,74,0.55)', marginTop:4, fontWeight:500 }}>
            MedPocket · Liquid Glass Tokens
          </p>
        </div>

        {/* Color Palette */}
        <GlassCard title="🎨 Color Palette">
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <Swatch color="#009DB5" label="Primary" hex="#009DB5" />
            <Swatch color="#00C6D8" label="Accent" hex="#00C6D8" />
            <Swatch color="#007A8C" label="Dark Teal" hex="#007A8C" />
            <Swatch color="#10B981" label="Success" hex="#10B981" />
            <Swatch color="#F59E0B" label="Warning" hex="#F59E0B" />
            <Swatch color="#EF4444" label="Critical" hex="#EF4444" />
          </div>
        </GlassCard>

        {/* Glass Layers */}
        <GlassCard title="🪟 Glass Surfaces">
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'Light Glass', bg:'rgba(255,255,255,0.14)', border:'rgba(255,255,255,0.18)' },
              { label:'Medium Glass', bg:'rgba(255,255,255,0.22)', border:'rgba(255,255,255,0.28)' },
              { label:'Strong Glass', bg:'rgba(255,255,255,0.50)', border:'rgba(255,255,255,0.70)' },
              { label:'Tinted Glass', bg:'rgba(0,157,181,0.15)', border:'rgba(0,198,216,0.30)' },
            ].map(g => (
              <div key={g.label} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', borderRadius:14,
                background:g.bg, backdropFilter:'blur(12px)',
                WebkitBackdropFilter:'blur(12px)',
                border:`1px solid ${g.border}`,
              }}>
                <span style={{ fontSize:13, fontWeight:600, color:'#0a1628' }}>{g.label}</span>
                <span style={{ fontSize:10, color:'rgba(26,58,74,0.5)', fontFamily:'monospace' }}>{g.bg}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Typography */}
        <GlassCard title="✏️ Typography (Inter / SF Pro)">
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:28, fontWeight:800, color:'#0a1628', letterSpacing:-0.5, lineHeight:1 }}>Display · 28 / 800</div>
            <div style={{ fontSize:22, fontWeight:700, color:'#0a1628', letterSpacing:-0.4 }}>Heading · 22 / 700</div>
            <div style={{ fontSize:17, fontWeight:600, color:'#0a1628' }}>Subhead · 17 / 600</div>
            <div style={{ fontSize:15, fontWeight:500, color:'#1a3a4a' }}>Body · 15 / 500</div>
            <div style={{ fontSize:13, fontWeight:500, color:'rgba(26,58,74,0.65)' }}>Secondary · 13 / 500</div>
            <div style={{ fontSize:10, fontWeight:700, color:'#009DB5', textTransform:'uppercase', letterSpacing:1 }}>
              Label · 10 / 700 · uppercase · tracked
            </div>
          </div>
        </GlassCard>

        {/* Components */}
        <GlassCard title="🧩 Components">
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* Primary button */}
            <div style={{
              padding:'13px 20px', borderRadius:20, textAlign:'center',
              background:'linear-gradient(135deg, #009DB5, #00C6D8)',
              color:'#fff', fontSize:15, fontWeight:700,
              boxShadow:'0 6px 20px rgba(0,157,181,0.35)',
            }}>Primary Button</div>

            {/* Ghost button */}
            <div style={{
              padding:'13px 20px', borderRadius:20, textAlign:'center',
              background:'rgba(255,255,255,0.45)', backdropFilter:'blur(16px)',
              WebkitBackdropFilter:'blur(16px)',
              border:'1.5px solid rgba(0,157,181,0.35)',
              color:'#009DB5', fontSize:15, fontWeight:700,
              boxShadow:'0 4px 12px rgba(0,0,0,0.06)',
            }}>Ghost Button</div>

            {/* Floating chip */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['BNF 86', 'WHO', 'Oral', 'First-line'].map(chip => (
                <div key={chip} style={{
                  padding:'6px 12px', borderRadius:20,
                  background:'rgba(0,157,181,0.12)', border:'1px solid rgba(0,157,181,0.20)',
                  color:'#007A8C', fontSize:12, fontWeight:700,
                }}>{chip}</div>
              ))}
            </div>

            {/* Input */}
            <div style={{
              padding:'12px 16px', borderRadius:18,
              background:'rgba(255,255,255,0.55)', backdropFilter:'blur(20px)',
              WebkitBackdropFilter:'blur(20px)',
              border:'1px solid rgba(255,255,255,0.75)',
              boxShadow:'0 4px 12px rgba(0,0,0,0.06)',
              color:'rgba(26,58,74,0.4)', fontSize:14, fontWeight:500,
            }}>Search drugs, labs, procedures…</div>
          </div>
        </GlassCard>

        {/* Radius & Spacing */}
        <GlassCard title="📐 Radius & Shadows">
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
            {[
              { r:14, label:'r-sm', size:40 },
              { r:20, label:'r-md', size:48 },
              { r:28, label:'r-lg', size:56 },
              { r:36, label:'r-xl', size:64 },
            ].map(({ r, label, size }) => (
              <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{
                  width:size, height:size, borderRadius:r,
                  background:'rgba(0,157,181,0.20)', border:'1.5px solid rgba(0,157,181,0.30)',
                  boxShadow:'0 4px 16px rgba(0,157,181,0.18)',
                }} />
                <div style={{ fontSize:10, fontWeight:700, color:'#007A8C', fontFamily:'monospace' }}>{label}</div>
                <div style={{ fontSize:9, color:'rgba(26,58,74,0.5)', fontFamily:'monospace' }}>{r}px</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Dark mode preview chip */}
        <div style={{
          background:'rgba(10,22,40,0.82)', backdropFilter:'blur(24px)',
          WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.10)',
          borderRadius:22, padding:'16px',
          boxShadow:'0 8px 30px rgba(0,0,0,0.30)',
        }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#00D4E5', textTransform:'uppercase',
            letterSpacing:1, marginBottom:10 }}>🌙 Dark Mode Preview</div>
          <div style={{ display:'flex', gap:10 }}>
            {[
              { bg:'rgba(15,33,64,0.90)', border:'rgba(255,255,255,0.10)', label:'Card' },
              { bg:'rgba(255,255,255,0.08)', border:'rgba(255,255,255,0.12)', label:'Glass' },
              { bg:'linear-gradient(135deg,#009DB5,#00C6D8)', border:'none', label:'Primary' },
            ].map(s => (
              <div key={s.label} style={{ flex:1, padding:'10px', borderRadius:14,
                background:s.bg, border:`1px solid ${s.border}`, textAlign:'center',
                color: s.label==='Primary' ? '#fff' : 'rgba(232,248,251,0.80)',
                fontSize:11, fontWeight:700 }}>{s.label}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
