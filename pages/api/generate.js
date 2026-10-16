export default async function handler(req, res) {
  const { scenario } = req.body;
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "8e7d1cc9c7e9f6c1a1a1a1a1a1a1a1a1", // <-- KEEP YOUR ORIGINAL WORKING VERSION ID HERE
      input: {
        prompt: `Cartoon superhero Telecoms Lawyer, bald with glasses, brown cape, yellow TL shield, white shirt black tie, scenario: ${scenario}, comic book style, white background`,
      },
    }),
  });
  const prediction = await response.json();
  console.log(prediction);
  if (response.status !== 201) {
    return res.status(500).json({ error: prediction.detail || JSON.stringify(prediction) });
  }
  res.status(200).json({ id: prediction.id });
}
