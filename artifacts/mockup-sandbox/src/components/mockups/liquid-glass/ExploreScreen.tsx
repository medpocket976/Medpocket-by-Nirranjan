import './_group.css';

const sections = [
  {
    title: 'Clinical Reference',
    badge: 'Updated Jun 2026',
    items: [
      { label: 'Drug Guide', icon: '💊', color: '#009DB5', desc: 'Pharmacopeia with mechanisms, dosing & pearls', source: 'BNF 86 · WHO · UpToDate' },
      { label: 'Lab Values', icon: '🔬', color: '#10B981', desc: 'Normal ranges, critical values & interpretation', source: "Harrison's 21e · RCPA" },
      { label: 'Emergency', icon: '🚨', color: '#EF4444', desc: 'Step-by-step emergency algorithms', source: 'WHO · ACLS · AHA 2023' },
    ],
  },
  {
    title: 'Anaesthesia & OT',
    badge: 'Updated Jun 2026',
    items: [
      { label: 'Anaesthesia Equipment', icon: '💉', color: '#7C3AED', desc: '100+ OT equipment, airway devices & monitoring', source: "Miller's 9e · DAS Guidelines" },
    ],
  },
  {
    title: 'Clinical Skills',
    badge: 'Updated May 2026',
    items: [
      { label: 'Clinical Examination', icon: '🩺', color: '#8B5CF6', desc: 'Systematic guides for all major systems', source: "Talley & O'Connor · Macleod's" },
    ],
  },
  {
    title: 'Tools & Calculators',
    badge: 'Updated May 2026',
    items: [
      { label: 'Medical Calculators', icon: '🧮', color: '#F59E0B', desc: 'BMI, GCS, CURB-65, APGAR, Wells & more', source: 'NICE · ESC · RCOG' },
    ],
  },
];

export function ExploreScreen() {
  return (
    <div style={{
      width: 390, minHeight: 844,
      background: 'linear-gradient(160deg, #e8f8fb 0%, #d4f0f8 40%, #cce4ff 100%)',
      position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-base)',
    }}>
      {/* Ambient blobs */}
      <div style={{ position:'absolute', top:-40, left:-60, width:260, height:260,
        background:'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(24px)', zIndex:0 }} />
      <div style={{ position:'absolute', bottom:200, right:-50, width:220, height:220,
        background:'radial-gradient(circle, rgba(0,157,181,0.28) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(20px)', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, paddingBottom:100 }}>
        {/* Status bar */}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 24px 0',
          fontSize:12, fontWeight:600, color:'#1a3a4a' }}>
          <span>9:41</span>
          <div style={{ display:'flex', gap:6 }}><span>📶</span><span>🔋</span></div>
        </div>

        {/* Header */}
        <div style={{ padding:'18px 24px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, color:'#0a1628', letterSpacing:-0.5 }}>Library</h1>
            <p style={{ fontSize:13, color:'rgba(26,58,74,0.55)', marginTop:2, fontWeight:500 }}>
              Clinical reference & tools
            </p>
          </div>
          <div style={{
            width:40, height:40, borderRadius:14,
            background:'rgba(255,255,255,0.55)',
            backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.70)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
          }}>🔖</div>
        </div>

        {/* Search */}
        <div style={{ margin:'0 20px 20px' }}>
          <div style={{
            background:'rgba(255,255,255,0.55)', backdropFilter:'blur(24px)',
            WebkitBackdropFilter:'blur(24px)',
            border:'1px solid rgba(255,255,255,0.75)', borderRadius:18,
            padding:'12px 18px', display:'flex', alignItems:'center', gap:10,
            boxShadow:'0 4px 16px rgba(0,157,181,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}>
            <span style={{ fontSize:15, opacity:0.45 }}>🔍</span>
            <span style={{ fontSize:14, color:'rgba(26,58,74,0.4)', fontWeight:500 }}>
              Search library…
            </span>
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display:'flex', gap:8, padding:'0 20px', marginBottom:20, overflowX:'auto' }}>
          {['All', 'Clinical', 'Anaesthesia', 'Skills', 'Tools'].map((c, i) => (
            <div key={c} style={{
              flexShrink:0, padding:'8px 16px', borderRadius:20, fontSize:13, fontWeight:600,
              background: i===0
                ? 'linear-gradient(135deg, #009DB5, #00C6D8)'
                : 'rgba(255,255,255,0.50)',
              backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
              border: i===0 ? 'none' : '1px solid rgba(255,255,255,0.70)',
              color: i===0 ? '#fff' : 'rgba(26,58,74,0.65)',
              boxShadow: i===0
                ? '0 4px 14px rgba(0,157,181,0.32)'
                : '0 2px 8px rgba(0,0,0,0.06)',
            }}>{c}</div>
          ))}
        </div>

        {/* Sections */}
        {sections.map(sec => (
          <div key={sec.title} style={{ marginBottom:24, padding:'0 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#0a1628', letterSpacing:-0.2 }}>{sec.title}</h2>
              <span style={{
                fontSize:10, fontWeight:700, color:'#009DB5',
                background:'rgba(0,157,181,0.10)', borderRadius:8, padding:'3px 8px',
              }}>{sec.badge}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {sec.items.map(item => (
                <div key={item.label} style={{
                  background:'rgba(255,255,255,0.48)',
                  backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                  border:'1px solid rgba(255,255,255,0.70)',
                  borderRadius:22, padding:'16px',
                  boxShadow:'0 4px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                  display:'flex', alignItems:'center', gap:14,
                }}>
                  <div style={{
                    width:52, height:52, borderRadius:16, flexShrink:0,
                    background:`${item.color}18`,
                    border:`1.5px solid ${item.color}30`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
                  }}>{item.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'#0a1628', marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:12, color:'rgba(26,58,74,0.55)', lineHeight:1.4, marginBottom:5 }}>{item.desc}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:item.color, background:`${item.color}12`,
                      borderRadius:6, padding:'2px 7px', display:'inline-block' }}>{item.source}</div>
                  </div>
                  <div style={{ color:'rgba(26,58,74,0.3)', fontSize:18, flexShrink:0 }}>›</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating tab bar */}
      <div style={{
        position:'absolute', bottom:16, left:16, right:16,
        background:'rgba(255,255,255,0.60)', backdropFilter:'blur(32px)',
        WebkitBackdropFilter:'blur(32px)', border:'1px solid rgba(255,255,255,0.80)',
        borderRadius:28, padding:'10px 8px',
        display:'flex', justifyContent:'space-around',
        boxShadow:'0 8px 32px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
        zIndex:10,
      }}>
        {[
          { icon:'🏠', label:'Home', active:false },
          { icon:'📚', label:'Explore', active:true },
          { icon:'❓', label:'Quiz', active:false },
          { icon:'👤', label:'Profile', active:false },
        ].map(t => (
          <div key={t.label} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            padding:'6px 16px', borderRadius:20,
            background: t.active ? 'linear-gradient(135deg, #009DB5, #00C6D8)' : 'transparent',
            boxShadow: t.active ? '0 4px 16px rgba(0,157,181,0.35)' : 'none',
          }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, color: t.active ? '#fff' : 'rgba(26,58,74,0.5)' }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
