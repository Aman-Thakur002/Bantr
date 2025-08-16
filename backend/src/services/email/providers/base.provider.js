// Email provider interface - all providers must implement these functions
export const createEmailProvider = (providerFunctions) => {
  const { send, validateConfig } = providerFunctions;
  
  if (!send || typeof send !== 'function') {
    throw new Error('send function must be implemented by email provider');
  }
  
  if (!validateConfig || typeof validateConfig !== 'function') {
    throw new Error('validateConfig function must be implemented by email provider');
  }
  
  return { send, validateConfig };
};

// Default validation for email parameters
export const validateEmailParams = ({ to, subject }) => {
  if (!to || !subject) {
    throw new Error('Email requires to and subject parameters');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error('Invalid email address format');
  }
};