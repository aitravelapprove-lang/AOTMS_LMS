const nodemailer = require('nodemailer');

// Setup SMTP Transporter using Brevo credentials
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
    secure: false, // 587 uses STARTTLS
    auth: {
        user: process.env.BREVO_SMTP_USER || 'b46190001@smtp-brevo.com',
        pass: process.env.BREVO_SMTP_PASS
    }
});

/**
 * Send an email directly using Brevo SMTP
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @returns {Promise<any>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
    const fromSender = process.env.BREVO_SMTP_FROM || 'ramanadhamjayaveer@gmail.com';

    const mailOptions = {
        from: `"Academy of Tech Masters" <${fromSender}>`,
        to,
        subject,
        text,
        html
    };

    try {
        console.log(`[Brevo SMTP] Sending email to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Brevo SMTP] Sent successfully. Message ID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`[Brevo SMTP Error] Failed to send email to ${to}:`, err.message);
        throw err;
    }
};

module.exports = {
    sendEmail
};
