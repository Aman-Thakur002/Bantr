import { config } from '../../config/env.js';
import logger from '../../config/logger.js';

// Redacts personally identifiable information (PII) from text
// - Matches and replaces Social Security Numbers (XXX-XX-XXXX)
// - Matches and replaces credit card numbers (XXXX-XXXX-XXXX-XXXX)
// - Matches and replaces email addresses
// - Matches and replaces phone numbers (XXX-XXX-XXXX)
const redactPII = (text) => {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[PHONE]');
};

// Builds a prompt for suggesting replies based on recent conversation history
// @param {Array} messages - Array of message objects containing senderName and text
// @param {Object} userContext - Context about the user (unused currently)
// @returns {String} Formatted prompt string for AI model
const buildSuggestPrompt = (messages, userContext) => {
  // Get last 5 messages and format them with sender name and redacted text
  const recentMessages = messages.slice(-5).map(m => 
    `${m.senderName}: ${redactPII(m.text)}`
  ).join('\n');
  // Return formatted prompt with conversation context and instruction
  return `Based on this conversation:\n${recentMessages}\n\nSuggest a brief, appropriate reply:`;
};

// OpenAI Provider
const openaiProvider = (apiKey) => ({
  async makeRequest(endpoint, data) {
    if (!apiKey) throw new Error('OpenAI API key not configured');
    
    const response = await fetch(`https://api.openai.com/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    return await response.json();
  },

  async suggestReply(messages, userContext) {
    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that suggests brief, contextual replies to messages. Keep responses under 50 words and match the conversation tone.' },
        { role: 'user', content: buildSuggestPrompt(messages, userContext) }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || 'Thanks!';
  },

  async summarizeConversation(messages) {
    const conversationText = messages.map(m => `${m.senderName}: ${m.text}`).join('\n');
    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Summarize the following conversation in 2-3 sentences, highlighting key points and decisions.' },
        { role: 'user', content: conversationText }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content || 'No summary available.';
  },

  async translateText(text, targetLang) {
    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Translate the following text to ${targetLang}. Only return the translation, no explanations.` },
        { role: 'user', content: text }
      ],
      max_tokens: 200,
      temperature: 0.1,
    });
    return response.choices[0]?.message?.content || text;
  },

  async moderateText(text) {
    const response = await this.makeRequest('/moderations', { input: text });
    const result = response.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
      scores: result.category_scores,
    };
  }
});

// Gemini Provider
const geminiProvider = (apiKey) => ({
  async makeRequest(endpoint, data) {
    if (!apiKey) throw new Error('Gemini API key not configured');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
    return await response.json();
  },

  async suggestReply(messages, userContext) {
    const response = await this.makeRequest('/models/gemini-pro:generateContent', {
      contents: [{ parts: [{ text: `You are a helpful assistant that suggests brief, contextual replies to messages. Keep responses under 50 words and match the conversation tone.\n\n${buildSuggestPrompt(messages, userContext)}` }] }],
      generationConfig: { maxOutputTokens: 100, temperature: 0.7 }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || 'Thanks!';
  },

  async summarizeConversation(messages) {
    const conversationText = messages.map(m => `${m.senderName}: ${m.text}`).join('\n');
    const response = await this.makeRequest('/models/gemini-pro:generateContent', {
      contents: [{ parts: [{ text: `Summarize the following conversation in 2-3 sentences, highlighting key points and decisions:\n\n${conversationText}` }] }],
      generationConfig: { maxOutputTokens: 150, temperature: 0.3 }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary available.';
  },

  async translateText(text, targetLang) {
    const response = await this.makeRequest('/models/gemini-pro:generateContent', {
      contents: [{ parts: [{ text: `Translate the following text to ${targetLang}. Only return the translation, no explanations:\n\n${text}` }] }],
      generationConfig: { maxOutputTokens: 200, temperature: 0.1 }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || text;
  },

  async moderateText(text) {
    const flaggedWords = ['spam', 'abuse', 'hate'];
    const flagged = flaggedWords.some(word => text.toLowerCase().includes(word));
    return {
      flagged,
      categories: { harassment: flagged },
      scores: { harassment: flagged ? 0.8 : 0.1 },
    };
  }
});

// Qwen Provider
const qwenProvider = (apiKey) => ({
  async makeRequest(endpoint, data) {
    if (!apiKey) throw new Error('Qwen API key not configured');
    
    const response = await fetch(`https://dashscope.aliyuncs.com/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Qwen API error: ${response.statusText}`);
    return await response.json();
  },

  async suggestReply(messages, userContext) {
    const response = await this.makeRequest('/services/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: {
        messages: [
          { role: 'system', content: 'You are a helpful assistant that suggests brief, contextual replies to messages. Keep responses under 50 words and match the conversation tone.' },
          { role: 'user', content: buildSuggestPrompt(messages, userContext) }
        ]
      },
      parameters: { max_tokens: 100, temperature: 0.7 }
    });
    return response.output?.choices?.[0]?.message?.content || 'Thanks!';
  },

  async summarizeConversation(messages) {
    const conversationText = messages.map(m => `${m.senderName}: ${m.text}`).join('\n');
    const response = await this.makeRequest('/services/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: {
        messages: [
          { role: 'system', content: 'Summarize the following conversation in 2-3 sentences, highlighting key points and decisions.' },
          { role: 'user', content: conversationText }
        ]
      },
      parameters: { max_tokens: 150, temperature: 0.3 }
    });
    return response.output?.choices?.[0]?.message?.content || 'No summary available.';
  },

  async translateText(text, targetLang) {
    const response = await this.makeRequest('/services/aigc/text-generation/generation', {
      model: 'qwen-turbo',
      input: {
        messages: [
          { role: 'system', content: `Translate the following text to ${targetLang}. Only return the translation, no explanations.` },
          { role: 'user', content: text }
        ]
      },
      parameters: { max_tokens: 200, temperature: 0.1 }
    });
    return response.output?.choices?.[0]?.message?.content || text;
  },

  async moderateText(text) {
    const flaggedWords = ['spam', 'abuse', 'hate'];
    const flagged = flaggedWords.some(word => text.toLowerCase().includes(word));
    return {
      flagged,
      categories: { harassment: flagged },
      scores: { harassment: flagged ? 0.8 : 0.1 },
    };
  }
});

// DeepSeek Provider
const deepseekProvider = (apiKey) => ({
  async makeRequest(endpoint, data) {
    if (!apiKey) throw new Error('DeepSeek API key not configured');
    
    const response = await fetch(`https://api.deepseek.com/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`DeepSeek API error: ${response.statusText}`);
    return await response.json();
  },

  async suggestReply(messages, userContext) {
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that suggests brief, contextual replies to messages. Keep responses under 50 words and match the conversation tone.' },
        { role: 'user', content: buildSuggestPrompt(messages, userContext) }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
    return response.choices?.[0]?.message?.content || 'Thanks!';
  },

  async summarizeConversation(messages) {
    const conversationText = messages.map(m => `${m.senderName}: ${m.text}`).join('\n');
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Summarize the following conversation in 2-3 sentences, highlighting key points and decisions.' },
        { role: 'user', content: conversationText }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });
    return response.choices?.[0]?.message?.content || 'No summary available.';
  },

  async translateText(text, targetLang) {
    const response = await this.makeRequest('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: `Translate the following text to ${targetLang}. Only return the translation, no explanations.` },
        { role: 'user', content: text }
      ],
      max_tokens: 200,
      temperature: 0.1,
    });
    return response.choices?.[0]?.message?.content || text;
  },

  async moderateText(text) {
    const flaggedWords = ['spam', 'abuse', 'hate'];
    const flagged = flaggedWords.some(word => text.toLowerCase().includes(word));
    return {
      flagged,
      categories: { harassment: flagged },
      scores: { harassment: flagged ? 0.8 : 0.1 },
    };
  }
});

// Provider Factory
const createProvider = () => {
  switch (config.AI_PROVIDER) {
    case 'openai':
      if (config.OPENAI_API_KEY) return openaiProvider(config.OPENAI_API_KEY);
      break;
    case 'gemini':
      if (config.GEMINI_API_KEY) return geminiProvider(config.GEMINI_API_KEY);
      break;
    case 'qwen':
      if (config.QWEN_API_KEY) return qwenProvider(config.QWEN_API_KEY);
      break;
    case 'deepseek':
      if (config.DEEPSEEK_API_KEY) return deepseekProvider(config.DEEPSEEK_API_KEY);
      break;
    default:
      logger.warn(`Unknown AI provider: ${config.AI_PROVIDER}`);
  }
  
  logger.warn('AI provider not configured or API key missing, using mock responses');
};

// AI Service Functions
const provider = createProvider();

export const suggestReply = async ({ messages, userContext }) => {
  try {
    return await provider.suggestReply(messages, userContext);
  } catch (error) {
    logger.error('AI suggest reply failed:', error);
    return 'Thanks!';
  }
};

export const summarizeConversation = async ({ conversationId, messages }) => {
  try {
    return await provider.summarizeConversation(messages);
  } catch (error) {
    logger.error('AI summarization failed:', error);
    return 'Summary not available.';
  }
};

export const translateText = async ({ text, targetLang }) => {
  try {
    return await provider.translateText(text, targetLang);
  } catch (error) {
    logger.error('AI translation failed:', error);
    return text;
  }
};

export const moderateText = async ({ text }) => {
  try {
    return await provider.moderateText(text);
  } catch (error) {
    logger.error('AI moderation failed:', error);
    return { flagged: false, categories: {}, scores: {} };
  }
};

export default { suggestReply, summarizeConversation, translateText, moderateText };