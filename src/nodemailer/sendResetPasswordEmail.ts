import * as nodemailer from 'nodemailer';

export async function sendResetPasswordEmail(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    from: `"MicroPost" <${process.env.SMTP_USER}>`,
    to: to,
    subject: '【MicroPost】パスワード再設定のご案内',
    text: `以下のリンクからパスワードを再設定してください（10分以内に有効）:\n\n${resetLink}`,
    html: `
      <p>以下のリンクからパスワードを再設定してください。</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>このリンクは10分以内に有効です。</p>
    `,
  });
}
