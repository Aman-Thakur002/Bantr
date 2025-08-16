import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Image, 
  Languages, 
  Sparkles, 
  MessageCircle,
  Camera,
  FileText
} from 'lucide-react';
import * as apiClient from '../../lib/api';
import useUIStore from '../../stores/useUIStore';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import { formatTime } from '../../lib/utils';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your AI assistant. I can help you with chat summaries, translations, image generation, and more. How can I assist you today?",
      type: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('chat');
  const { addNotification } = useUIStore();

  const aiFeatures = [
    { id: 'chat', name: 'Chat', icon: MessageCircle, description: 'General AI assistance' },
    { id: 'translate', name: 'Translate', icon: Languages, description: 'Text translation' },
    { id: 'generate', name: 'Generate Image', icon: Image, description: 'AI image generation' },
    { id: 'analyze', name: 'Analyze Image', icon: Camera, description: 'Image analysis' },
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputText,
      type: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response;
      
      switch (activeFeature) {
        case 'chat':
          response = await apiClient.chatWithAI(inputText, null);
          break;
        case 'translate':
          // Simple translation - in real app you'd detect language
          response = await apiClient.translateText(inputText, 'auto', 'es');
          break;
        case 'generate':
          response = await apiClient.generateImage(inputText);
          break;
        default:
          response = await apiClient.chatWithAI(inputText, null);
      }

      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.message || response.data.text || response.data.url || 'Response generated successfully',
        type: 'ai',
        timestamp: new Date().toISOString(),
        imageUrl: response.data.url // For image generation
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'AI Error',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex">
      {/* Features Sidebar */}
      <div className="w-80 border-r border-gray-200/20 dark:border-gray-700/20">
        <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h2>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Powered by advanced AI to help you with various tasks
          </p>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            AI Features
          </h3>
          <div className="space-y-2">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    activeFeature === feature.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-xs opacity-80">{feature.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
          <div className="flex items-center space-x-3">
            <Avatar
              src={null}
              fallback={<Bot className="w-5 h-5" />}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {aiFeatures.find(f => f.id === activeFeature)?.name} Assistant
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {aiFeatures.find(f => f.id === activeFeature)?.description}
              </p>
            </div>
            <div className="ml-auto">
              <div className="flex items-center space-x-1 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}>
                {message.type === 'ai' && (
                  <Avatar
                    src={null}
                    fallback={<Bot className="w-4 h-4" />}
                    size="sm"
                  />
                )}
                
                <GlassCard className={`p-3 ${
                  message.type === 'user' 
                    ? 'bg-primary/20 border-primary/30' 
                    : 'bg-white/20 dark:bg-white/10'
                }`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Assistant</span>
                    </div>
                  )}
                  
                  <div className="mb-1">
                    <p className="text-gray-900 dark:text-white break-words">
                      {message.content}
                    </p>
                    
                    {message.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={message.imageUrl}
                          alt="AI Generated"
                          className="rounded-lg max-w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>
                </GlassCard>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <Avatar
                  src={null}
                  fallback={<Bot className="w-4 h-4" />}
                  size="sm"
                />
                <GlassCard className="p-3 bg-white/20 dark:bg-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      AI is thinking...
                    </span>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200/20 dark:border-gray-700/20">
          <div className="flex items-center space-x-2">
            <Input
              placeholder={`Ask the AI about ${aiFeatures.find(f => f.id === activeFeature)?.name.toLowerCase()}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;