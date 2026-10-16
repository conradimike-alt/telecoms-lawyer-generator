export default async function handler(req, res) {
  const { scenario } = req.body;
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "your-model-version-id-here", // <-- KEEP YOUR EXISTING VERSION ID
      input: {
        prompt: `Cartoon style superhero Telecoms Lawyer, bald with glasses, brown cape, TL yellow shield, white shirt black tie, scenario: ${scenario}, comic book, white background`,
      },
    }),
  });
  const prediction = await response.json();
  if (response.status !== 201) return res.status(500).json({ error: prediction.detail || "Failed" });
  res.status(200).json({ id: prediction.id });
}
