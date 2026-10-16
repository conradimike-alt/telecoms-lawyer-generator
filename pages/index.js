import { useState, useEffect } from 'react';

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

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
    setLoading(true); setImage(null); setEmailStatus("");
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

  async function emailToMike() {
    if (!image) return;
    setEmailStatus("Sending...");
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: image, scenario })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailStatus(`✅ Sent! Attached + view link: ${data.viewLink || window.location.href}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setEmailStatus(`❌ Failed: ${err.message}. Opening manual email as backup...`);
      // fallback to mailto with view link
      const subject = encodeURIComponent("Here's my Telecoms Lawyer image");
      const viewUrl = window.location.href;
      const body = encodeURIComponent(`Scenario: ${scenario}\n\nView link: ${viewUrl}\nDirect image: ${image}`);
      window.location.href = `mailto:mike.conradi@dlapiper.com?subject=${subject}&body=${body}`;
    }
  }

  return (
    <div style={{fontFamily:'Arial Black, Arial', background:'#fefefe', minHeight:'100vh', padding:'0'}}>
      <div style={{background:'transparent', padding:'15px 10px 15px', textAlign:'center'}}>
        <img src="/header.png" alt="TELECOMS LAWYER: HERO OF CONNECTIVITY" style={{ maxWidth: '100%', height: 'auto', maxHeight: '140px', display: 'inline-block' }} />
      </div>

      <div style={{maxWidth:'680px', margin:'10px auto', padding:'16px'}}>
        <div style={{border:'3px solid #000', borderRadius:'14px', padding:'16px', background:'#fff', boxShadow:'6px 6px 0 #000'}}>
          <input value={scenario} onChange={e=>setScenario(e.target.value)} placeholder="e.g. saves cat from a tree" style={{width:'100%', padding:'14px', border:'3px solid #000', borderRadius:'10px', fontSize:'16px'}} />
          <button onClick={()=>generate()} disabled={loading} style={{width:'100%', marginTop:'12px', background:'#ffeb3b', border:'3px solid #000', padding:'14px', fontWeight:900, fontSize:'1.1rem', borderRadius:'10px', cursor:'pointer'}}>
            {loading? '⚡ GENERATING...' : '🎨 GENERATE CARTOON NOW'}
          </button>
        </div>

        {image && (
          <>
            <div style={{marginTop:'24px', border:'4px solid #000', borderRadius:'12px', overflow:'hidden', boxShadow:'6px 6px 0 #000', position:'relative', lineHeight:0}}>
              <img src={image} style={{width:'100%', display:'block'}} />
              <div style={{ position:'absolute', top:0, left:0, right:0, background:'#1e88e5', color:'#fff', padding:'12px', textAlign:'center', fontWeight:900, fontSize:'18px', letterSpacing:'1px', textShadow:'2px 2px 0 #000', borderBottom:'4px solid #000', lineHeight:1.2 }}>
                TELECOMS LAWYER..
              </div>
              <div style={{ position:'absolute', bottom:'18px', left:'50%', transform:'translateX(-50%)', filter:'drop-shadow(3px 3px 0 #000)', maxWidth:'90%', lineHeight:1.2 }}>
                <div style={{ background:'#ffeb3b', border:'3px solid #000', padding:'10px 36px', fontWeight:900, fontSize:'17px', textTransform:'uppercase', textAlign:'center', whiteSpace:'nowrap', clipPath:'polygon(0 0, 100% 0, 92% 50%, 100% 100%, 0 100%, 8% 50%)' }}>
                  {scenario}
                </div>
              </div>
            </div>

            <button onClick={emailToMike} style={{ width:'100%', marginTop:'16px', background:'#1e88e5', color:'#fff', border:'3px solid #000', padding:'14px', fontWeight:900, fontSize:'1.05rem', borderRadius:'10px', cursor:'pointer', boxShadow:'5px 5px 0 #000', textShadow:'1px 1px 0 #000' }}>
              📧 EMAIL THIS TO MIKE (auto-attached + link)
            </button>
            {emailStatus && <p style={{textAlign:'center', fontSize:'13px', marginTop:'10px', fontFamily:'Arial', fontWeight:'bold'}}>{emailStatus}</p>}
          </>
        )}
      </div>
    </div>
  );
}
