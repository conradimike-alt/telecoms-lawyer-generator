export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({error:'no id'});
  try {
    const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
