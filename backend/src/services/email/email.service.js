import { sendBrevoEmail } from './providers/brevo.provider.js';
import { renderTemplate } from './templates/template.service.js';
import { config } from '../../config/env.js';

export const sendEmail = async ({ to, subject, template, data = {}, html, text }) => {
  let emailHtml = html;
  let emailText = text;

  if (template) {
    emailHtml = await renderTemplate(template, data);
  }

  return await sendBrevoEmail({
    to,
    subject,
    html: emailHtml,
    text: emailText
  });
};

export const sendPasswordReset = async (to, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
  return await sendEmail({
    to,
    subject: 'Reset Your Password',
    template: 'password-reset',
    data: { resetLink: resetUrl }
  });
};

export const sendOTP = async (to, otp) => {
  return await sendEmail({
    to,
    subject: 'Your OTP Code',
    template: 'otp',
    data: { otp }
  });
};

export const sendWelcome = async (to, name) => {
  return await sendEmail({
    to,
    subject: 'Welcome to Bantr!',
    template: 'welcome',
    data: { name }
  });
};