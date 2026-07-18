import './_group.css';

const modules = [
  { id: 'drug-guide',    label: 'Drug Guide',       icon: '💊', color: '#009DB5', bg: 'rgba(0,157,181,0.15)' },
  { id: 'clinical-exam', label: 'Clinical Exam',    icon: '🩺', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  { id: 'emergency',     label: 'Emergency',        icon: '🚨', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  { id: 'lab-values',    label: 'Lab Values',       icon: '🔬', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { id: 'calculators',   label: 'Calculators',      icon: '🧮', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { id: 'anaesthesia',   label: 'Anaesthesia',      icon: '💉', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
  { id: 'quiz',          label: 'Quiz',             icon: '❓', color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
  { id: 'search',        label: 'Search All',       icon: '🔍', color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
];

const stats = [
  { label: 'Day Streak', value: '12', icon: '🔥' },
  { label: 'Saved',      value: '34', icon: '🔖' },
  { label: 'Quizzes',    value: '28', icon: '✅' },
  { label: 'Study Days', value: '21', icon: '📅' },
];

export function HomeScreen() {
  return (
    <div style={{
      width: 390, minHeight: 844,
      background: 'linear-gradient(160deg, #e8f8fb 0%, #d0f0f7 35%, #b8e8f5 65%, #cce8ff 100%)',
      position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-base)',
    }}>
      {/* Ambient blobs */}
      <div style={{ position:'absolute', top:-60, right:-40, width:280, height:280,
        background:'radial-gradient(circle, rgba(0,198,216,0.35) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(20px)', zIndex:0 }} />
      <div style={{ position:'absolute', top:200, left:-80, width:240, height:240,
        background:'radial-gradient(circle, rgba(0,157,181,0.25) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(24px)', zIndex:0 }} />
      <div style={{ position:'absolute', bottom:180, right:-60, width:260, height:260,
        background:'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        borderRadius:'50%', filter:'blur(28px)', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, paddingBottom:100 }}>
        {/* Status bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'14px 24px 0', fontSize:12, fontWeight:600, color:'#1a3a4a' }}>
          <span>9:41</span>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span>📶</span><span>WiFi</span><span>🔋</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ padding:'20px 24px 16px' }}>
          <p style={{ fontSize:13, fontWeight:500, color:'rgba(26,58,74,0.6)', marginBottom:4 }}>
            Good morning 👋
          </p>
          <h1 style={{ fontSize:30, fontWeight:800, color:'#0a1628', lineHeight:1.1, letterSpacing:-0.5 }}>
            MedPocket
          </h1>
        </div>

        {/* Search bar — glass */}
        <div style={{ margin:'0 20px 20px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: 20,
            padding: '13px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 20px rgba(0,157,181,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}>
            <span style={{ fontSize:16, opacity:0.5 }}>🔍</span>
            <span style={{ fontSize:15, color:'rgba(26,58,74,0.45)', fontWeight:500 }}>
              Search drugs, labs, procedures…
            </span>
          </div>
        </div>

        {/* Stats row — glass cards */}
        <div style={{ display:'flex', gap:10, padding:'0 20px', marginBottom:20, overflowX:'auto' }}>
          {stats.map(s => (
            <div key={s.label} style={{
              flex:'0 0 auto',
              background: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.65)',
              borderRadius: 18,
              padding: '12px 16px',
              textAlign: 'center', minWidth: 78,
              boxShadow: '0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:800, color:'#009DB5', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:10, fontWeight:600, color:'rgba(26,58,74,0.55)', marginTop:3, whiteSpace:'nowrap' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Daily Pearl — accent glass card */}
        <div style={{ margin:'0 20px 20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,157,181,0.18) 0%, rgba(0,198,216,0.12) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,198,216,0.30)',
            borderRadius: 22,
            padding: '16px 18px',
            boxShadow: '0 6px 24px rgba(0,157,181,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:16 }}>💡</span>
              <span style={{ fontSize:11, fontWeight:700, color:'#007A8C', textTransform:'uppercase', letterSpacing:1 }}>
                Daily Clinical Pearl
              </span>
            </div>
            <p style={{ fontSize:15, fontWeight:600, color:'#0a1628', lineHeight:1.5 }}>
              GCS ≤ 8 → Intubate. Airway protection is the priority before imaging in obtunded patients.
            </p>
            <p style={{ fontSize:11, color:'rgba(0,122,140,0.7)', marginTop:6, fontWeight:500 }}>Harrison's 21e · Emergency Medicine</p>
          </div>
        </div>

        {/* Quick access grid */}
        <div style={{ padding:'0 20px' }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#0a1628', marginBottom:12, letterSpacing:-0.3 }}>
            Quick Access
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {modules.map(m => (
              <div key={m.id} style={{
                background: 'rgba(255,255,255,0.50)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.70)',
                borderRadius: 20,
                padding: '14px 8px 12px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                cursor: 'pointer',
              }}>
                <div style={{
                  width:44, height:44, borderRadius:14,
                  background: m.bg,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 8px', fontSize:20,
                  border: `1px solid ${m.color}22`,
                }}>
                  {m.icon}
                </div>
                <div style={{ fontSize:10, fontWeight:700, color:'#1a3a4a', lineHeight:1.3 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ padding:'20px 20px 0' }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#0a1628', marginBottom:12, letterSpacing:-0.3 }}>
            Recent Activity
          </h2>
          {[
            { title:'Pharmacology Quiz', score:'8/10', time:'2h ago', icon:'🧠', pass:true },
            { title:'Drug Guide: Metformin', score:'Read', time:'Yesterday', icon:'💊', pass:null },
            { title:'Cardiovascular Quiz', score:'6/10', time:'2d ago', icon:'❤️', pass:false },
          ].map((a,i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:12,
              background: 'rgba(255,255,255,0.42)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.60)',
              borderRadius: 18,
              padding: '13px 16px',
              marginBottom: 10,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width:40, height:40, borderRadius:12,
                background:'rgba(0,157,181,0.12)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, flexShrink:0,
              }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'#0a1628' }}>{a.title}</div>
                <div style={{ fontSize:12, color:'rgba(26,58,74,0.5)', marginTop:2 }}>{a.time}</div>
              </div>
              <div style={{
                fontSize:12, fontWeight:700,
                color: a.pass === null ? '#6366F1' : a.pass ? '#10B981' : '#EF4444',
                background: a.pass === null ? 'rgba(99,102,241,0.12)' : a.pass ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                borderRadius:10, padding:'4px 8px',
              }}>
                {a.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating glass tab bar */}
      <div style={{
        position:'absolute', bottom:16, left:16, right:16,
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.80)',
        borderRadius: 28,
        padding: '10px 8px 10px',
        display: 'flex', justifyContent: 'space-around',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.9)',
        zIndex: 10,
      }}>
        {[
          { icon:'🏠', label:'Home', active:true },
          { icon:'📚', label:'Explore', active:false },
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
            <span style={{
              fontSize:10, fontWeight:700,
              color: t.active ? '#fff' : 'rgba(26,58,74,0.5)',
            }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
