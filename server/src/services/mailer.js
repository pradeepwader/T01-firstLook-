const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;
if (env.mail.host) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  });
}

// Best-effort: never lets a mail failure break the request. Logs to console when SMTP is not configured.
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`[T01][email disabled] to=${to} subject="${subject}"\n${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.mail.from, to, subject, html });
  } catch (err) {
    console.error('[T01] Email failed:', err.message);
  }
};

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const wrap = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#F5F0E6;padding:24px">
    <div style="background:#101B2D;padding:18px 24px;border-radius:10px 10px 0 0">
      <span style="color:#FCFAF5;font-size:26px;font-weight:800">T01<span style="color:#F4A340">.</span></span>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 10px 10px;color:#17243B">
      <h2 style="margin-top:0">${title}</h2>${body}
    </div>
  </div>`;

const templates = {
  welcome: (name) => wrap(`Welcome, ${esc(name)}!`, '<p>Your T01 account is ready. Explore career roadmaps, guides and resources built for students and young professionals.</p>'),
  resetPassword: (name, url) => wrap('Reset your password', `<p>Hi ${esc(name)}, use the button below to set a new password. The link expires in 15 minutes.</p><p><a href="${url}" style="background:#F4A340;color:#17243B;padding:12px 24px;border-radius:7px;text-decoration:none;font-weight:700">Reset password</a></p>`),
  orderConfirmed: (name, product, amount, orderId, dashboardUrl) => wrap('Order confirmed', `<p>Hi ${esc(name)}, thank you for your purchase.</p><p><strong>${esc(product)}</strong><br>Amount: ₹${amount}<br>Order ID: ${orderId}</p><p><a href="${dashboardUrl}" style="background:#F4A340;color:#17243B;padding:12px 24px;border-radius:7px;text-decoration:none;font-weight:700">Open my dashboard</a></p>`),
};

module.exports = { sendEmail, templates };
