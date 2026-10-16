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
    <div style={{fontFamily:'Arial Black, Arial', background:'#eee', minHeight:'100vh', padding:'20px'}}>
      <div style={{maxWidth:'650px', margin:'0 auto'}}>
        <input value={scenario} onChange={e=>setScenario(e.target.value)} placeholder="e.g. saves cat from a tree" style={{width:'100%', padding:'12px', border:'3px solid #000', borderRadius:'8px'}} />
        <button onClick={()=>generate()} disabled={loading} style={{width:'100%', marginTop:'10px', background:'#ffeb3b', border:'3px solid #000', padding:'12px', fontWeight:900, cursor:'pointer'}}>
          {loading? 'GENERATING...' : 'GENERATE'}
        </button>

        {image && (
          <div style={{marginTop:'20px', border:'3px solid #000', borderRadius:'12px', overflow:'hidden', boxShadow:'5px 5px 0 #000', position:'relative', lineHeight:0}}>
            <img src={image} style={{width:'100%', display:'block'}} />

            {/* TOP BANNER - ON TOP OF IMAGE */}
            <div style={{position:'absolute', top:0, left:0, right:0, background:'#1e88e5', color:'#fff', padding:'12px', textAlign:'center', fontWeight:900, fontSize:'18px', letterSpacing:'0.5px', textShadow:'1px 1px 0 #000', borderBottom:'3px solid #000'}}>
              TELECOMS LAWYER..
            </div>

            {/* BOTTOM BANNER - ON TOP OF IMAGE */}
            <div style={{position:'absolute', bottom:0, left:0, right:0, background:'#ffeb3b', padding:'14px', textAlign:'center', fontWeight:900, fontSize:'16px', textTransform:'uppercase', borderTop:'3px solid #000', lineHeight:'1.2'}}>
              {scenario}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
