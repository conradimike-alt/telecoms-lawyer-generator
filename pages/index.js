import { useState, useEffect } from 'react';

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('scenario');
    if (p) {
      const decoded = decodeURIComponent(p.replace(/\+/g, ' '));
      setScenario(decoded);
      generate(decoded);
    }
  }, []);

  async function generate(customScen) {
    const s = customScen || scenario;
    if (!s.trim()) return;
    setLoading(true); setImage(null);
    const url = new URL(window.location); url.searchParams.set('scenario', s);
    window.history.replaceState({}, '', url);
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: s }) });
      const { id } = await res.json();
      let tries = 0;
      while (tries < 40) {
        await new Promise(r => setTimeout(r, 1500));
        const poll = await fetch(`/api/status?id=${id}`);
        const data = await poll.json();
        if (data.status === 'succeeded') { setImage(data.output?.[0] || data.output); setLoading(false); return; }
        if (data.status === 'failed') throw new Error(data.error);
        tries++;
      }
    } catch (e) { alert(e.message); setLoading(false); }
  }

  return (
    <div style={{fontFamily:'Arial Black, Arial', background:'#fefefe', minHeight:'100vh', padding:'0'}}>

      {/* === PAGE HEADER - NOW USING YOUR BANNER IMAGE === */}
      <div style={{background:'#fff', padding:'15px 10px 10px', textAlign:'center', borderBottom:'4px solid #000'}}>
        <img
          src="/header.png"
          alt="TELECOMS LAWYER: HERO OF CONNECTIVITY"
          style={{ maxWidth: '100%', height: 'auto', maxHeight: '140px', display: 'inline-block' }}
        />
      </div>

      <div style={{maxWidth:'680px', margin:'20px auto', padding:'16px'}}>
        {/* Input */}
        <div style={{border:'3px solid #000', borderRadius:'14px', padding:'16px', background:'#fff', boxShadow:'6px 6px 0 #000'}}>
          <input value={scenario} onChange={e=>setScenario(e.target.value)} placeholder="e.g. saves cat from a tree" style={{width:'100%', padding:'14px', border:'3px solid #000', borderRadius:'10px', fontSize:'16px'}} />
          <button onClick={()=>generate()} disabled={loading} style={{width:'100%', marginTop:'12px', background:'#ffeb3b', border:'3px solid #000', padding:'14px', fontWeight:900, fontSize:'1.1rem', borderRadius:'10px', cursor:'pointer'}}>
            {loading? '⚡ GENERATING...' : '🎨 GENERATE CARTOON NOW'}
          </button>
        </div>

        {/* === IMAGE CARD - BANNERS ON TOP OF IMAGE === */}
        {image && (
          <div style={{marginTop:'24px', border:'4px solid #000', borderRadius:'12px', overflow:'hidden', boxShadow:'6px 6px 0 #000', position:'relative', lineHeight:0}}>
            <img src={image} style={{width:'100%', display:'block'}} />

            {/* Blue banner ON TOP OF IMAGE */}
            <div style={{
              position:'absolute', top:0, left:0, right:0,
              background:'#1e88e5', color:'#fff',
              padding:'12px', textAlign:'center', fontWeight:900, fontSize:'18px',
              letterSpacing:'1px', textShadow:'2px 2px 0 #000',
              borderBottom:'4px solid #000', lineHeight:1.2
            }}>
              TELECOMS LAWYER..
            </div>

            {/* Yellow banner ON TOP OF IMAGE at bottom */}
            <div style={{
              position:'absolute', bottom:0, left:0, right:0,
              background:'#ffeb3b', padding:'14px',
              textAlign:'center', fontWeight:900, fontSize:'16px',
              textTransform:'uppercase', borderTop:'4px solid #000', lineHeight:1.2
            }}>
              {scenario}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
