export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({error:'POST only'});
  const { scenario } = req.body;
  if (!scenario) return res.status(400).json({error:'no scenario'});

  const HERO_PROMPT = `Single panel comic book cartoon, bald telecoms lawyer hero with black glasses, white shirt, black tie, brown superhero cape flowing, TL shield badge on chest that says TL, expressive comic face, SAME CHARACTER IN EVERY IMAGE, bright comic book style, bold black outlines, vibrant flat colors, heroic pose, holding legal documents, facing: ${scenario}, speech bubble funny heroic line, background scene of ${scenario}, bottom yellow banner text "${scenario.toUpperCase()}", style: TELECOMS LAWYER HERO OF CONNECTIVITY`;

  try {
    // Start prediction on Replicate
    const startRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-dev",
        input: { prompt: HERO_PROMPT, width: 1280, height: 896, guidance: 3.5 }
      })
    });
    const startData = await startRes.json();
    let prediction = startData;

    // Poll until done
    while (prediction.status!== "succeeded" && prediction.status!== "failed") {
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      prediction = await pollRes.json();
    }

    if (prediction.status === "failed") throw new Error("Generation failed");
    const imageUrl = prediction.output?.[0] || prediction.output;
    res.status(200).json({ imageUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
