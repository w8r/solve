const Mailer = require('nodemailer');
const config = require('../config/development');
const hbs = require('handlebars');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

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
module.exports.sendVerificationEmail = async (toEmail, verificationCode) => {
  const templateSource = await readFile(
    path.join(__dirname, '../templates/verify_email.hbs'),
    'utf8'
  );
  const template = hbs.compile(templateSource);
  const emailbody = template({
    title: `${config.app.title}: Verify your email`,
    content: `Welcome to ${config.app.title}. Please verify your email by clicking the button below. Note: This verification link will expire in 1 hour.`,
    buttonText: 'Verify your email address',
    url: `${config.app.publicUrl}/verify-email/?token=${verificationCode}`,
    signature: config.email.signature,
    appTitle: config.app.title,
    publicUrl: config.app.publicUrl
  });

  return emailSender.sendMail({
    from: `"Solve app" ${config.email.username}`,
    to: toEmail,
    subject: `${config.app.title} - Verify your e-mail`,
    html: emailbody
  });
};
