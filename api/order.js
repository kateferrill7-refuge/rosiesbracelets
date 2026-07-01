// /api/order.js
// Sends order emails via Gmail SMTP using nodemailer.
// Requires GMAIL_USER and GMAIL_PASS (app password) env vars in Vercel.

const nodemailer = require('nodemailer');

const ROSIE_EMAIL = process.env.ROSIE_EMAIL || 'rosierebecca771@icloud.com';
const GMAIL_USER  = process.env.GMAIL_USER;
const GMAIL_PASS  = process.env.GMAIL_PASS;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!GMAIL_USER || !GMAIL_PASS) {
    res.status(500).json({ error: 'Server is missing GMAIL_USER or GMAIL_PASS environment variables.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  const { name, email, total, items } = body || {};
  if (!name || !email || !total || !items) {
    res.status(400).json({ error: 'Missing order details.' });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS }
  });

  const orderDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  try {
    // Notification to Rosie
    await transporter.sendMail({
      from: '"Rosie\'s Bracelets" <' + GMAIL_USER + '>',
      to: ROSIE_EMAIL,
      subject: 'New order from ' + name + ' - $' + total,
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3a2e2e;">
          <h2 style="color:#b07b7b;font-size:1.4rem;margin-bottom:.5rem;">New Order Received!</h2>
          <p style="color:#888;font-size:.85rem;margin-top:0;">${orderDate}</p>
          <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
            <tr><td style="padding:.4rem 0;font-weight:600;width:120px;">Customer</td><td>${name}</td></tr>
            <tr><td style="padding:.4rem 0;font-weight:600;">Email</td><td><a href="mailto:${email}" style="color:#b07b7b;">${email}</a></td></tr>
            <tr><td style="padding:.4rem 0;font-weight:600;">Items</td><td>${items}</td></tr>
            <tr><td style="padding:.4rem 0;font-weight:600;">Total</td><td style="color:#b07b7b;font-size:1.1rem;">$${total}</td></tr>
          </table>
          <p style="font-size:.85rem;color:#888;">The customer has been sent a confirmation email. They are paying via PayPal to @katedesantis764.</p>
        </div>
      `
    });

    // Confirmation to customer
    await transporter.sendMail({
      from: '"Rosie\'s Bracelets" <' + GMAIL_USER + '>',
      to: email,
      subject: 'Your order from Rosie\'s Bracelets',
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3a2e2e;">
          <h2 style="color:#b07b7b;font-size:1.4rem;">Thanks for your order, ${name}!</h2>
          <p>Here is a summary of what you ordered:</p>
          <div style="background:#fdf6f0;border-radius:6px;padding:1rem 1.2rem;margin:1rem 0;">
            <p style="margin:.3rem 0;">${items}</p>
            <p style="margin:.6rem 0 0;font-weight:600;color:#b07b7b;font-size:1.05rem;">Total: $${total}</p>
          </div>
          <p>To complete your purchase, please send <strong>$${total}</strong> via PayPal to <strong>@katedesantis764</strong>. In the PayPal note, just mention your name so Rosie knows which order is yours.</p>
          <p>Once payment is received Rosie will be in touch to arrange shipping. Questions? Reply to this email or reach out at <a href="mailto:${ROSIE_EMAIL}" style="color:#b07b7b;">${ROSIE_EMAIL}</a>.</p>
          <p style="margin-top:2rem;font-size:.85rem;color:#888;">Made with love,<br><strong style="color:#b07b7b;">Rosie's Bracelets</strong></p>
        </div>
      `
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: err.message || 'Could not send confirmation email.' });
  }
};
