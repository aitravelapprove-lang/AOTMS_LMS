const nodemailer = require('nodemailer');

/**
 * Send an email directly using Brevo SMTP.
 * Bypasses Render port blocks by dynamically trying port 2525 (recommended for cloud hosts) and 587.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @returns {Promise<any>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
    const fromSender = process.env.BREVO_SMTP_FROM || 'aotms.marketing@gmail.com';
    const apiKey = process.env.BREVO_SMTP_PASS;

    if (!apiKey) {
        console.error('[Brevo Error] BREVO_SMTP_PASS key is not configured.');
        throw new Error('Email credentials are not configured.');
    }

    // Try port 2525 first (Render typically allows outbound on 2525 while blocking 587/465)
    // If process.env.BREVO_SMTP_PORT is defined, prioritize it, otherwise default to 2525
    const preferredPort = process.env.BREVO_SMTP_PORT ? parseInt(process.env.BREVO_SMTP_PORT, 10) : 2525;
    const smtpHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';

    const mailOptions = {
        from: `"Academy of Tech Masters" <${fromSender}>`,
        to,
        subject,
        text,
        html
    };

    const trySendWithPort = async (port) => {
        console.log(`[Brevo SMTP] Attempting send to ${to} on host: ${smtpHost}, port: ${port}...`);
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: port,
            secure: port === 465, // True for 465, false for others
            auth: {
                user: process.env.BREVO_SMTP_USER || 'b46190001@smtp-brevo.com',
                pass: apiKey
            },
            connectionTimeout: 10000 // 10 seconds timeout
        });

        return await transporter.sendMail(mailOptions);
    };

    try {
        const info = await trySendWithPort(preferredPort);
        console.log(`[Brevo SMTP] Sent successfully on port ${preferredPort}. Message ID: ${info.messageId}`);
        return info;
    } catch (err) {
        // Render or Brevo failed on the preferred port, try the alternative
        const alternativePort = preferredPort === 587 ? 2525 : 587;
        console.warn(`[Brevo SMTP Port ${preferredPort} Failed: ${err.message}]. Retrying with alternative port ${alternativePort}...`);
        try {
            const info = await trySendWithPort(alternativePort);
            console.log(`[Brevo SMTP Fallback] Sent successfully on port ${alternativePort}. Message ID: ${info.messageId}`);
            return info;
        } catch (fallbackErr) {
            console.error(`[Brevo SMTP Error] All port attempts (including standard and fallback) failed:`, fallbackErr.message);
            throw fallbackErr;
        }
    }
};

module.exports = {
    sendEmail
};
