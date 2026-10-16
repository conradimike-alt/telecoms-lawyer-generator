export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({error:'POST only'});
  const { scenario } = req.body;

  // IMPORTANT: No text, no words, no letters — we add them with HTML later
  const HERO_PROMPT = `Single panel comic book cartoon, bald telecoms lawyer hero with black glasses, white shirt, black tie, brown superhero cape flowing, TL yellow shield badge on chest, heroic pose, background scene: ${scenario}, clean comic art, bold black outlines, vibrant flat colors, no text, no words, no letters, no captions, no banner`;

  try {
    const r = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ input: { prompt: HERO_PROMPT, go_fast: true } })
    });
    const data = await r.json();
    if (!data.id) throw new Error(JSON.stringify(data));
    res.status(200).json({ id: data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
