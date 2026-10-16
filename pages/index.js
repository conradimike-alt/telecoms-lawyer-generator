import { useState, useEffect } from 'react';
export default function Home() {
  const [scenario, setScenario] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('scenario');
    if (p) { setScenario(p); generate(p); }
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

  return (
    <div style={{fontFamily:'Arial Black', background:'#fefefe', minHeight:'100vh'}}>
      <header style={{background:'#1e88e5', color:'#fff', padding:'20px', textAlign:'center', borderBottom:'5px solid #000'}}>
        <h1 style={{margin:0, textShadow:'2px 2px 0 #000'}}>⚡ TELECOMS LAWYER: HERO OF CONNECTIVITY ⚡</h1>
      </header>
      <div style={{maxWidth:'900px', margin:'20px auto', padding:'16px'}}>
        <div style={{border:'3px solid #000', borderRadius:'14px', padding:'18px', background:'#fff', boxShadow:'6px 6px 0 #000'}}>
          <label>What should he face next?</label>
          <textarea value={scenario} onChange={e=>setScenario(e.target.value)} rows={3} style={{width:'100%', padding:'14px', border:'3px solid #000', borderRadius:'10px', fontSize:'16px'}} placeholder="e.g. clients needs some milk from the shops" />
          <button onClick={()=>generate()} disabled={loading} style={{marginTop:'12px', width:'100%', background:'#ffeb3b', border:'3px solid #000', padding:'14px', fontWeight:900, fontSize:'1.1rem', borderRadius:'10px'}}>
            {loading? `⚡ ${statusText}` : '🎨 GENERATE CARTOON NOW'}
          </button>
        </div>
        {image && (
          <div style={{border:'3px solid #000', borderRadius:'14px', padding:'18px', background:'#fff', boxShadow:'6px 6px 0 #000', marginTop:'18px'}}>
            <h2 style={{textAlign:'center'}}>{scenario.toUpperCase()}</h2>
            <img src={image} style={{width:'100%', border:'3px solid #000', borderRadius:'12px'}} />
          </div>
        )}
      </div>
    </div>
  );
}
