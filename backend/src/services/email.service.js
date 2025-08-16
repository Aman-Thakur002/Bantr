import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// Function to send any type of email
const sendEmail = async ({ to, from, subject, text, html }) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { 
      email: from || process.env.DEFAULT_FROM_EMAIL, 
      name: process.env.APP_NAME || 'Bantr' 
    };
    sendSmtpEmail.subject = subject;
    
    if (html) {
      sendSmtpEmail.htmlContent = html;
    }
    if (text) {
      sendSmtpEmail.textContent = text;
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

// Send OTP email
const sendOTPEmail = ({ to, otp }) => {
  return sendEmail({
    to,
    subject: 'Your OTP Code',
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  });
};

// Send welcome email
const sendWelcomeEmail = ({ to, name }) => {
  return sendEmail({
    to,
    subject: 'Welcome to Our Platform',
    html: `<h1>Welcome ${name}!</h1><p>Thank you for joining us.</p>`,
  });
};

// Send confirmation email
const sendConfirmationEmail = ({ to, type, details }) => {
  return sendEmail({
    to,
    subject: `${type} Confirmation`,
    html: `<p>Your ${type} has been confirmed.</p><p>Details: ${details}</p>`,
  });
};

// Send community update email
const sendCommunityEmail = ({ to, title, content }) => {
  return sendEmail({
    to,
    subject: title,
    html: `<div>${content}</div>`,
  });
};

export { sendEmail, sendOTPEmail, sendWelcomeEmail, sendConfirmationEmail, sendCommunityEmail };