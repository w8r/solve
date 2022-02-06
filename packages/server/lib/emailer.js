const Mailer = require('nodemailer');
const config = require('../config/development');
const hbs = require('handlebars');
const fs = require('fs/promises');
const path = require('path');

const emailSender = Mailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.username,
    pass: config.email.password
  }
});

/**
 * @param {string} templateName
 * @return {Promise<function>}
 */
const getTemplate = async (templateName) => {
  const templateSource = await fs.readFile(
    path.join(__dirname, `../templates/${templateName}.hbs`),
    'utf8'
  );
  return hbs.compile(templateSource);
};

/**
 * @param {string} toEmail
 * @param {string} verificationCode
 * @returns Promise<SMTPTransport.SentMessageInfo>
 */
module.exports.sendVerificationEmail = async (toEmail, verificationCode) => {
  if (!config.email.enabled) return Promise.resolve();
  const template = await getTemplate('verify_email');
  const emailbody = template({
    title: `${config.app.title}: Verify your email`,
    content: `Welcome to ${config.app.title}. Please verify your email by clicking the button below. Note: This verification link will expire in 1 hour.`,
    buttonText: 'Verify your email address',
    url: `${config.app.publicUrl}/api/user/verify-email/?token=${verificationCode}`,
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

/**
 * @param {string} toEmail
 * @param {string} verificationCode
 * @returns Promise<SMTPTransport.SentMessageInfo>
 */
module.exports.sendResetPasswordEmail = async (toEmail, verificationCode) => {
  const template = await getTemplate('verify_email');
  const emailbody = template({
    title: `${config.app.title}: Reset your password`,
    content: `You have requested to recover your password at ${config.app.title}. Please follow the link in this email to verify that it was you who requested this change. If it wasn't you, simply ignore this email.`,
    buttonText: 'Reset your password',
    url: `${config.app.publicUrl}/reset-password/?token=${verificationCode}`,
    signature: config.email.signature,
    appTitle: config.app.title,
    publicUrl: config.app.publicUrl
  });

  return emailSender.sendMail({
    from: `"Solve app" ${config.email.username}`,
    to: toEmail,
    subject: `${config.app.title} - Password reset`,
    html: emailbody
  });
};
