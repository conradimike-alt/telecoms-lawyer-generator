import { useState, useEffect } from 'react';

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('scenario');
    if (p) { setScenario(p); generate(p); }
  }, []);

  async function generate(customScen) {
    const s = customScen || scenario;
    if (!s.trim()) return alert("Type a scenario!");
    setLoading(true);
    setImage(null);
    const url = new URL(window.location);
    url.searchParams.set('scenario', s);
    window.history.replaceState({}, '', url);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: s })
    });
    const data = await res.json();
    if(data.imageUrl){ setImage(data.imageUrl); } else { alert("Error: "+(data.error||'unknown')); }
    setLoading(false);
  }

  return (
    <div style={{fontFamily:'Arial Black', background:'#fefefe', minHeight:'100vh'}}>
      <header style={{background:'#1e88e5', color:'#fff', padding:'20px', textAlign:'center', borderBottom:'5px solid #000'}}>
        <h1 style={{margin:0, textShadow:'2px 2px 0 #000'}}>⚡ TELECOMS LAWYER: HERO OF CONNECTIVITY ⚡</h1>
        <div style={{fontFamily:'sans-serif', fontWeight:'normal', marginTop:'6px'}}>Same hero, any scenario - auto-generated</div>
      </header>
      <div style={{maxWidth:'900px', margin:'20px auto', padding:'16px'}}>
        <div style={{border:'3px solid #000', borderRadius:'14px', padding:'18px', background:'#fff', boxShadow:'6px 6px 0 #000'}}>
          <label>What should he face next?</label>
          <textarea value={scenario} onChange={e=>setScenario(e.target.value)} rows={3} style={{width:'100%', padding:'14px', border:'3px solid #000', borderRadius:'10px', fontSize:'16px'}} placeholder="e.g. client needs submarine cable JBA in 2 weeks" />
          <button onClick={()=>generate()} disabled={loading} style={{marginTop:'12px', width:'100%', background:'#ffeb3b', border:'3px solid #000', padding:'14px', fontWeight:900, fontSize:'1.1rem', borderRadius:'10px'}}>
            {loading? '⚡ GENERATING...' : '🎨 GENERATE CARTOON NOW'}
          </button>
        </div>
        {loading && <div style={{textAlign:'center', padding:'30px', fontSize:'1.3rem'}}>Generating your hero... same style as approved comic...</div>}
        {image && (
          <div style={{border:'3px solid #000', borderRadius:'14px', padding:'18px', background:'#fff', boxShadow:'6px 6px 0 #000', marginTop:'18px'}}>
            <h2 style={{textAlign:'center', marginTop:0}}>{scenario.toUpperCase()}</h2>
            <img src={image} style={{width:'100%', border:'3px solid #000', borderRadius:'12px'}} />
            <div style={{background:'#ffeb3b', border:'3px solid #000', padding:'8px', textAlign:'center', fontWeight:900, marginTop:'10px', borderRadius:'8px'}}>{scenario.toUpperCase()}</div>
            <div style={{display:'flex', gap:'10px', marginTop:'12px'}}>
              <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert('Link copied!')}} style={{flex:1, background:'#fff', border:'3px solid #000', padding:'10px', fontWeight:900}}>🔗 COPY SHARE LINK</button>
              <a href={image} target="_blank" style={{flex:1, textAlign:'center', background:'#90caf9', border:'3px solid #000', padding:'10px', fontWeight:900, textDecoration:'none', color:'#000', borderRadius:'10px'}}>⬇️ DOWNLOAD</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
