export default async function handler(req, res) {
  const { id } = req.query;
  const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json" },
  });
  const prediction = await response.json();
  res.status(200).json(prediction);
}
