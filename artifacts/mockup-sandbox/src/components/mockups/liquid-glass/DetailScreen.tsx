import './_group.css';

const tabs = ['Overview', 'Dosing', 'Interactions', 'Pearls'];

export function DetailScreen() {
  return (
    <div style={{
      width:390, minHeight:844,
      background:'linear-gradient(160deg, #e4f4ff 0%, #d8f0f8 45%, #d0eaff 100%)',
      position:'relative', overflow:'hidden', fontFamily:'var(--font-base)',
    }}>
      {/* Ambient blobs */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:340,
        background:'linear-gradient(180deg, rgba(0,157,181,0.22) 0%, transparent 100%)',
        zIndex:0 }} />
      <div style={{ position:'absolute', top:80, right:-40, width:220, height:220,
        background:'radial-gradient(circle, rgba(0,198,216,0.30) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(20px)', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Status bar */}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 24px 0',
          fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>
          <span>9:41</span>
          <div style={{ display:'flex', gap:6 }}><span>📶</span><span>🔋</span></div>
        </div>

        {/* Back nav */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px 0' }}>
          <div style={{
            width:36, height:36, borderRadius:12,
            background:'rgba(255,255,255,0.40)', backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.60)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 10px rgba(0,0,0,0.10)',
          }}>‹</div>
          <span style={{ fontSize:15, fontWeight:600, color:'rgba(10,22,40,0.75)' }}>Drug Guide</span>
          <div style={{ marginLeft:'auto',
            width:36, height:36, borderRadius:12,
            background:'rgba(255,255,255,0.40)', backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.60)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 10px rgba(0,0,0,0.10)',
          }}>🔖</div>
        </div>

        {/* Drug hero card */}
        <div style={{ margin:'16px 20px 0' }}>
          <div style={{
            background:'rgba(255,255,255,0.52)', backdropFilter:'blur(28px)',
            WebkitBackdropFilter:'blur(28px)',
            border:'1px solid rgba(255,255,255,0.72)',
            borderRadius:26, padding:'20px',
            boxShadow:'0 12px 40px rgba(0,157,181,0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{
                width:60, height:60, borderRadius:18,
                background:'linear-gradient(135deg, rgba(0,157,181,0.20), rgba(0,198,216,0.15))',
                border:'1.5px solid rgba(0,198,216,0.30)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0,
              }}>💊</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#0a1628', letterSpacing:-0.4 }}>Metformin</div>
                <div style={{ fontSize:13, color:'#009DB5', fontWeight:600, marginTop:2 }}>Biguanide · Antidiabetic</div>
                <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                  {['Oral', 'PO', 'BNF 86'].map(tag => (
                    <span key={tag} style={{
                      fontSize:10, fontWeight:700, color:'#007A8C',
                      background:'rgba(0,157,181,0.12)', borderRadius:8, padding:'3px 8px',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              marginTop:16, padding:'12px 14px',
              background:'rgba(0,157,181,0.08)', borderRadius:14,
              border:'1px solid rgba(0,157,181,0.15)',
            }}>
              <p style={{ fontSize:13, color:'#0a1628', lineHeight:1.6, fontWeight:500 }}>
                First-line oral hypoglycaemic for T2DM. Reduces hepatic glucose production and improves insulin sensitivity without causing hypoglycaemia.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs — glass pill row */}
        <div style={{ display:'flex', gap:6, padding:'16px 20px', overflowX:'auto' }}>
          {tabs.map((t, i) => (
            <div key={t} style={{
              flexShrink:0, padding:'8px 16px', borderRadius:20,
              fontSize:13, fontWeight:600,
              background: i===0
                ? 'linear-gradient(135deg, #009DB5, #00C6D8)'
                : 'rgba(255,255,255,0.48)',
              backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
              border: i===0 ? 'none' : '1px solid rgba(255,255,255,0.65)',
              color: i===0 ? '#fff' : 'rgba(26,58,74,0.60)',
              boxShadow: i===0 ? '0 4px 14px rgba(0,157,181,0.32)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}>{t}</div>
          ))}
        </div>

        {/* Content cards */}
        <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:12 }}>
          {/* Mechanism */}
          <div style={{
            background:'rgba(255,255,255,0.48)', backdropFilter:'blur(20px)',
            WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.68)',
            borderRadius:22, padding:'16px',
            boxShadow:'0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#009DB5', textTransform:'uppercase',
              letterSpacing:1, marginBottom:8 }}>⚙️ Mechanism</div>
            <p style={{ fontSize:14, color:'#0a1628', lineHeight:1.65, fontWeight:500 }}>
              Activates AMPK → ↓ hepatic gluconeogenesis · ↑ peripheral glucose uptake · ↓ intestinal glucose absorption
            </p>
          </div>

          {/* Standard Dose */}
          <div style={{
            background:'rgba(255,255,255,0.48)', backdropFilter:'blur(20px)',
            WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.68)',
            borderRadius:22, padding:'16px',
            boxShadow:'0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#10B981', textTransform:'uppercase',
              letterSpacing:1, marginBottom:10 }}>💉 Standard Dosing</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'Initial', value:'500 mg BD or 850 mg OD with meals' },
                { label:'Maintenance', value:'1500–2000 mg/day in 2–3 divided doses' },
                { label:'Maximum', value:'3000 mg/day' },
              ].map(d => (
                <div key={d.label} style={{
                  display:'flex', gap:10, padding:'9px 12px',
                  background:'rgba(16,185,129,0.08)', borderRadius:12,
                  border:'1px solid rgba(16,185,129,0.15)',
                }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#10B981', minWidth:80 }}>{d.label}</span>
                  <span style={{ fontSize:12, color:'#0a1628', fontWeight:500 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Pearl */}
          <div style={{
            background:'linear-gradient(135deg, rgba(0,157,181,0.15), rgba(0,198,216,0.10))',
            backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            border:'1px solid rgba(0,198,216,0.28)',
            borderRadius:22, padding:'16px',
            boxShadow:'0 4px 20px rgba(0,157,181,0.12)',
          }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#007A8C', textTransform:'uppercase',
              letterSpacing:1, marginBottom:8 }}>💡 Clinical Pearl</div>
            <p style={{ fontSize:14, color:'#0a1628', lineHeight:1.65, fontWeight:500 }}>
              Hold metformin 48 hrs before contrast procedures and restart only after confirming normal renal function (eGFR &gt; 60).
            </p>
          </div>

          {/* Contraindications */}
          <div style={{
            background:'rgba(239,68,68,0.08)', backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(239,68,68,0.18)',
            borderRadius:22, padding:'16px',
          }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#EF4444', textTransform:'uppercase',
              letterSpacing:1, marginBottom:8 }}>🚫 Contraindications</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {['eGFR < 30 mL/min', 'Active hepatic disease', 'Lactic acidosis history', 'Excessive alcohol use'].map(c => (
                <div key={c} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444', flexShrink:0 }} />
                  <span style={{ fontSize:13, color:'#0a1628', fontWeight:500 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height:24 }} />
      </div>
    </div>
  );
}
