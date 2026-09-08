const nodemailer = require('nodemailer');

/**
 * Send an email function.
 * Brevo SMTP is currently DISABLED as requested. All emails are routed via n8n Webhooks.
 */
const sendEmail = async ({ to, subject, html, text }) => {
    console.log(`[Email Notice] Brevo SMTP is DISABLED. Bypass email send to: ${to} | Subject: ${subject}`);
    
    /* ── Un-comment below block if Brevo SMTP is needed in future ──
    const fromSender = process.env.BREVO_SMTP_FROM || 'aotms.marketing@gmail.com';
    const apiKey = process.env.BREVO_SMTP_PASS;

    if (!apiKey) {
        console.error('[Brevo Error] BREVO_SMTP_PASS key is not configured.');
        throw new Error('Email credentials are not configured.');
    }

    const preferredPort = process.env.BREVO_SMTP_PORT ? parseInt(process.env.BREVO_SMTP_PORT, 10) : 2525;
    const smtpHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';

    const mailOptions = {
        from: `"Academy of Tech Masters" <${fromSender}>`,
        to,
        subject,
        text,
        html
    };

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: preferredPort,
        secure: preferredPort === 465,
        auth: {
            user: process.env.BREVO_SMTP_USER || 'b46190001@smtp-brevo.com',
            pass: apiKey
        },
        connectionTimeout: 10000
    });

    return await transporter.sendMail(mailOptions);
    */

    return { messageId: 'disabled_brevo_smtp' };
};

module.exports = {
    sendEmail
};
