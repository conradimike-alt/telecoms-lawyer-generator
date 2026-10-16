export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
  const { scenario } = req.body;
  if (!scenario) return res.status(400).json({error:'no scenario'});

  const HERO_PROMPT = `Single panel comic book cartoon, bald telecoms lawyer hero with black glasses, white shirt, black tie, brown superhero cape flowing, TL shield badge on chest that says TL, expressive comic face, SAME CHARACTER IN EVERY IMAGE, bright comic book style, bold black outlines, vibrant flat colors, heroic pose, background scene of ${scenario}, bottom yellow banner text "${scenario.toUpperCase()}"`;

  try {
    const startRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: { prompt: HERO_PROMPT, go_fast: true, num_outputs: 1 }
      })
    });
    const startData = await startRes.json();
    let prediction = startData;

    let tries = 0;
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && tries < 30) {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      prediction = await pollRes.json();
      tries++;
    }

    if (prediction.status === "failed") throw new Error(JSON.stringify(prediction.error));
    const imageUrl = prediction.output?.[0] || prediction.output;
    res.status(200).json({ imageUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
