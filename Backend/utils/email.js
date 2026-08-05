const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Send an email directly using Brevo API (rest endpoint bypasses Render port blocks) with SMTP as fallback
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

    try {
        console.log(`[Brevo API] Sending email to ${to} via REST API...`);
        const payload = {
            sender: { name: "Academy of Tech Masters", email: fromSender },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html || text
        };
        if (text && !html) {
            payload.textContent = text;
        }

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        console.log(`[Brevo API] Sent successfully. Message ID: ${response.data.messageId || 'REST_API_SUCCESS'}`);
        return response.data;
    } catch (err) {
        console.warn(`[Brevo API Failed] Falling back to standard SMTP transport: ${err.message}`);

        // Fallback to Nodemailer SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
            port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
            secure: false, // 587 uses STARTTLS
            auth: {
                user: process.env.BREVO_SMTP_USER || 'b46190001@smtp-brevo.com',
                pass: apiKey
            }
        });

        const mailOptions = {
            from: `"Academy of Tech Masters" <${fromSender}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Brevo SMTP Fallback] Sent successfully. Message ID: ${info.messageId}`);
        return info;
    }
};

module.exports = {
    sendEmail
};
