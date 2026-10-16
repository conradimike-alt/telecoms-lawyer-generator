export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({error:'POST only'});
  const { scenario } = req.body;

  const HERO_PROMPT = `Single panel comic book cartoon, bald telecoms lawyer hero with black glasses, white shirt, black tie, brown superhero cape flowing, TL shield badge on chest that says TL, expressive comic face, SAME CHARACTER, bright comic book style, bold black outlines, vibrant flat colors, heroic pose, background scene of ${scenario}, bottom yellow banner text "${scenario.toUpperCase()}"`;

  try {
    const startRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input: { prompt: HERO_PROMPT, go_fast: true } })
    });
    const data = await startRes.json();
    if (!data.id) throw new Error(JSON.stringify(data));
    res.status(200).json({ id: data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
