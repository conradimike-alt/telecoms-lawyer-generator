import { useState, useEffect } from 'react';
export default function Home() {
  const [scenario, setScenario] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

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
    if (!s.trim()) return alert("Type a scenario!");
    setLoading(true); setImage(null); setStatusText("Starting hero...");
    const url = new URL(window.location); url.searchParams.set('scenario', s);
    window.history.replaceState({}, '', url);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: s })
      });
      const { id, error } = await res.json();
      if (error) throw new Error(error);

      setStatusText("Drawing... 5-10 seconds");
      let tries = 0;
      while (tries < 40) {
        await new Promise(r => setTimeout(r, 1500));
        const poll = await fetch(`/api/status?id=${id}`);
        const data = await poll.json();
        if (data.status === 'succeeded') {
          setImage(data.output?.[0] || data.output);
          setStatusText(""); setLoading(false); return;
        }
        if (data.status === 'failed') throw new Error(data.error || 'failed');
        tries++;
      }
      throw new Error("Timed out");
    } catch (e) {
      alert("Error: " + e.message); setLoading(false); setStatusText("");
    }
  }

  const displayScenario = scenario ? decodeURIComponent(scenario.replace(/\+/g, ' ')) : "";

  return (
    <div style={{fontFamily:'Arial Black, Arial, sans-serif', background:'#fefefe', minHeight:'100vh'}}>
      <header style={{background:'#1e88e5', color:'#fff', padding:'20px', textAlign:'center', borderBottom:'5px solid #000'}}>
        <h1 style={{margin:0, textShadow:'2px 2px 0 #000'}}>⚡ TELECOMS LAWYER: HERO OF CONNECTIVITY ⚡</h1>
      </header>
      <div style={{maxWidth:'900px', margin:'20px auto', padding:'16px'}}>
        <div style={{border:'3px solid #000', borderRadius:'14px', padding:'18px', background:'#fff', boxShadow:'6px 6px 0 #000'}}>
          <label style={{fontWeight:900}}>What should he face next?</label>
          <textarea value={scenario} onChange={e=>setScenario(e.target.value)} rows={3} style={{width:'100%', padding:'14px', border:'3px solid #000', borderRadius:'10px', fontSize:'16px', fontFamily:'Arial'}} placeholder="e.g. client needs milk from the shops" />
          <button onClick={()=>generate()} disabled={loading} style={{marginTop:'12px', width:'100%', background:'#ffeb3b', border:'3px solid #000', padding:'14px', fontWeight:900, fontSize:'1.1rem', borderRadius:'10px', cursor:'pointer'}}>
            {loading? `⚡ ${statusText}` : '🎨 GENERATE CARTOON NOW'}
          </button>
        </div>
        
        {image && (
          <div style={{border:'3px solid #000', borderRadius:'14px', padding:'0', overflow:'hidden', background:'#fff', boxShadow:'6px 6px 0 #000', marginTop:'20px'}}>
            {/* FIXED TITLE ON TOP OF EVERY IMAGE */}
            <div style={{background:'#1e88e5', color:'#fff', padding:'14px', textAlign:'center', borderBottom:'3px solid #000', textShadow:'1px 1px 0 #000'}}>
              <h2 style={{margin:0, fontSize:'1.5rem', letterSpacing:'1px'}}>TELECOMS LAWYER..</h2>
            </div>
            <img src={image} style={{width:'100%', display:'block'}} />
            {/* YELLOW CAPTION = PROMPT */}
            <div style={{background:'#ffeb3b', padding:'16px', textAlign:'center', fontWeight:900, fontSize:'1.3rem', textTransform:'uppercase', borderTop:'3px solid #000'}}>
              {displayScenario}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
