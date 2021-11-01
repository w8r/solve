const Mailer = require('nodemailer');
const config = require('../config/development');

const emailSender = Mailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.username,
        pass: config.email.password
    }
});

/**
 * 
 * @param {string} toEmail 
 * @param {string} verificationCode 
 * @returns Promise<SMTPTransport.SentMessageInfo>
 */
module.exports.sendVerificationEmail = (toEmail, verificationCode) => {
    return emailSender.sendMail({
        from: config.email.username,
        to: toEmail,
        subject: 'Solve App - Verify your e-mail',
        text: 'Please enter code "' + verificationCode + '" in the application' 
    });
}