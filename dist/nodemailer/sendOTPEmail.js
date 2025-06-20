"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = sendOTPEmail;
const nodemailer = require("nodemailer");
async function sendOTPEmail(to, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const info = await transporter.sendMail({
        from: `"MicroPost" <${process.env.SMTP_USER}>`,
        to: to,
        subject: '【MicroPost】Your OTP Code',
        text: `Your one time password is: ${otp}. It is valid for 5 minutes.`,
    });
    console.log('Message sent: %s', info.messageId);
}
//# sourceMappingURL=sendOTPEmail.js.map