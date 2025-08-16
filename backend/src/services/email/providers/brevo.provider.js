import * as brevo from '@getbrevo/brevo';
import { config } from '../../../config/env.js';
import { AppError } from '../../../middleware/errors.js';
import { validateEmailParams } from './base.provider.js';

let apiInstance = null;

const initializeBrevo = () => {
  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      config.brevoApiKey
    );
  }
  return apiInstance;
};

export const sendBrevoEmail = async ({ to, subject, html, text }) => {
  validateEmailParams({ to, subject });
  
  if (!config.brevoApiKey) {
    throw new AppError('Brevo API key is required', 500, 'EMAIL_CONFIG_ERROR');
  }

  try {
    const api = initializeBrevo();
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
      email: config.defaultFromEmail,
      name: 'Bantr'
    };
    sendSmtpEmail.subject = subject;
    
    if (html) sendSmtpEmail.htmlContent = html;
    if (text) sendSmtpEmail.textContent = text;

    const result = await api.sendTransacEmail(sendSmtpEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw new AppError(
      `Email sending failed: ${error.message}`,
      500,
      'EMAIL_SEND_ERROR'
    );
  }
};