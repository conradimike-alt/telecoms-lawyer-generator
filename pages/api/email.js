import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageUrl, scenario } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });

  try {
    // Fetch the generated cartoon
    const imgRes = await fetch(imageUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Public view link = your page with the scenario
    const viewLink = `${process.env.VERCEL_URL? `https://${process.env.VERCEL_URL}` : ''}/?scenario=${encodeURIComponent(scenario)}`;

    await resend.emails.send({
      from: 'Telecoms Lawyer <onboarding@resend.dev>', // change after you verify your domain in Resend
      to: 'mike.conradi@dlapiper.com',
      subject: "Here's my Telecoms Lawyer image",
      html: `
        <p><strong>Scenario:</strong> ${scenario}</p>
        <p><strong>View it as a webpage:</strong> <a href="${viewLink}">${viewLink}</a></p>
        <p><strong>Direct image:</strong> <a href="${imageUrl}">${imageUrl}</a></p>
        <p>Image is also attached to this email.</p>
      `,
      attachments: [
        {
          filename: `telecoms-lawyer-${scenario.replace(/\s+/g, '-').slice(0,50)}.png`,
          content: buffer,
        }
      ]
    });

    return res.status(200).json({ success: true, viewLink });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
