const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const initTransporter = () => {
    if (!transporter && process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        logger.info('Email transporter initialized');
    }
};

const sendEmail = async ({ to, subject, html, text, template, data }) => {
    try {
        initTransporter();
        
        if (!transporter && process.env.NODE_ENV === 'production') {
            throw new Error('Email transporter not configured');
        }
        
        let emailContent = html;
        
        if (template && !html) {
            emailContent = renderTemplate(template, data);
        }
        
        if (process.env.NODE_ENV === 'development') {
            logger.info(`Email would be sent to: ${to}`);
            logger.info(`Subject: ${subject}`);
            logger.info(`Content: ${emailContent || text}`);
            return { success: true, messageId: 'dev-mode' };
        }
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@smarttender.com',
            to,
            subject,
            text: text || stripHtml(emailContent),
            html: emailContent
        };
        
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

const renderTemplate = (template, data) => {
    const templates = {
        'email-verification': `
            <!DOCTYPE html>
            <html>
            <head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}</style></head>
            <body>
                <h2>Verify Your Email Address</h2>
                <p>Hello ${data.name},</p>
                <p>Thank you for registering with Smart Tender Platform. Please verify your email address by clicking the link below:</p>
                <p><a href="${data.verificationLink}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Verify Email</a></p>
                <p>Or copy this link: ${data.verificationLink}</p>
                <p>This link expires in ${data.expiresIn || '24 hours'}.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Smart Tender Platform Team</p>
            </body>
            </html>
        `,
        'password-reset': `
            <!DOCTYPE html>
            <html>
            <head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}</style></head>
            <body>
                <h2>Password Reset Request</h2>
                <p>Hello ${data.name},</p>
                <p>We received a request to reset your password. Click the link below to create a new password:</p>
                <p><a href="${data.resetLink}" style="display:inline-block;padding:10px 20px;background:#2196F3;color:white;text-decoration:none;border-radius:5px;">Reset Password</a></p>
                <p>Or copy this link: ${data.resetLink}</p>
                <p>This link expires in ${data.expiresIn || '1 hour'}.</p>
                <p>If you didn't request this, please ignore this email or contact support.</p>
                <p>Request details:</p>
                <ul>
                    <li>IP Address: ${data.ipAddress || 'Unknown'}</li>
                    <li>Browser: ${data.userAgent || 'Unknown'}</li>
                </ul>
                <br>
                <p>Best regards,<br>Smart Tender Platform Team</p>
            </body>
            </html>
        `
    };
    
    return templates[template] || `<p>${JSON.stringify(data)}</p>`;
};

const stripHtml = (html) => {
    return html?.replace(/<[^>]*>/g, '') || '';
};

const sendVerificationEmail = async (user, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Smart Tender Platform',
        template: 'email-verification',
        data: {
            name: user.name,
            verificationLink,
            expiresIn: '24 hours'
        }
    });
};

const sendPasswordResetEmail = async (user, token, req) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    return await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - Smart Tender Platform',
        template: 'password-reset',
        data: {
            name: user.name,
            resetLink,
            expiresIn: '1 hour',
            ipAddress: req?.ip,
            userAgent: req?.headers['user-agent']
        }
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};