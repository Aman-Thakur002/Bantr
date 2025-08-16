import * as brevo from '@getbrevo/brevo';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/env.js';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey);

const templateCache = new Map();

const loadTemplate = async (templateName) => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  const templatePath = path.join(process.cwd(), 'src/templates/email', `${templateName}.hbs`);
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const compiledTemplate = handlebars.compile(templateContent);
  
  templateCache.set(templateName, compiledTemplate);
  return compiledTemplate;
};

export const sendEmail = async ({ to, subject, template, data = {} }) => {
  try {
    const compiledTemplate = await loadTemplate(template);
    const htmlContent = compiledTemplate(data);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { email: config.defaultFromEmail, name: config.appName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const sendOTP = (to, otp) => 
  sendEmail({ to, subject: 'Your OTP Code', template: 'otp', data: { otp } });

export const sendWelcome = (to, name) => 
  sendEmail({ to, subject: 'Welcome!', template: 'welcome', data: { name } });

export const sendPasswordReset = (to, resetLink) => 
  sendEmail({ to, subject: 'Reset Password', template: 'password-reset', data: { resetLink } });