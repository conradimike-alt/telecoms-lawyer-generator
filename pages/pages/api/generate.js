import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({error:'POST only'});
  const { scenario } = req.body;
  if (!scenario) return res.status(400).json({error:'no scenario'});

  const HERO_PROMPT = `Single panel comic book cartoon, bald telecoms lawyer hero with black glasses, white shirt, black tie, brown superhero cape flowing, TL shield badge on chest that says TL, expressive comic face, SAME CHARACTER IN EVERY IMAGE, bright comic book style, bold black outlines, vibrant flat colors, heroic pose, holding legal documents, consistent character design, facing: ${scenario}, speech bubble with funny heroic line about telecoms law, background scene of ${scenario}, bottom yellow banner text that says "${scenario.toUpperCase()}", style: TELECOMS LAWYER HERO OF CONNECTIVITY, flat colors, fun detailed, 4k`;

  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = await replicate.run(
      "black-forest-labs/flux-dev",
      { input: { prompt: HERO_PROMPT, width: 1280, height: 896, num_outputs: 1, guidance: 3.5 } }
    );
    const imageUrl = Array.isArray(output)? output[0] : output;
    res.status(200).json({ imageUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
