import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Video, 
  Info, 
  Smile, 
  Paperclip, 
  Send,
  Bot,
  Gamepad2,
  MessageCircle,
  Image,
  FileText,
  Camera
} from 'lucide-react';
import useChatStore from '../../stores/useChatStore';
import useAuthStore from '../../stores/useAuthStore';
import useUIStore from '../../stores/useUIStore';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { cn } from '../../lib/utils';
import { apiClient } from '../../lib/api';

const ChatWindow = () => {
  const {
    activeConversation,
    conversations,
    messages,
    typingUsers,
    fetchMessages,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChatStore();
  const { user } = useAuthStore();
  const { openModal, addNotification } = useUIStore();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const conversation = conversations.find(c => c._id === activeConversation);
  const conversationMessages = messages[activeConversation] || [];
  const conversationTypingUsers = typingUsers[activeConversation] || [];

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages, conversationTypingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!isTyping && activeConversation) {
      setIsTyping(true);
      startTyping(activeConversation);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && activeConversation) {
        setIsTyping(false);
        stopTyping(activeConversation);
      }
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    try {
      await sendMessage({
        conversationId: activeConversation,
        content: messageText,
        type: 'text',
      });
      setMessageText('');
      
      if (isTyping) {
        setIsTyping(false);
        stopTyping(activeConversation);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to send message',
        message: error.message,
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    setUploading(true);
    try {
      // Determine file type
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      // Upload file
      const uploadResponse = await apiClient.uploadFile(file, type);
      
      // Send message with attachment
      await sendMessage({
        conversationId: activeConversation,
        content: file.name,
        type: type,
        attachments: [uploadResponse.data._id],
      });

      addNotification({
        type: 'success',
        title: 'File uploaded',
        message: 'File has been sent successfully.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: error.message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getConversationName = () => {
    if (!conversation) return 'Select a conversation';
    if (conversation.name) return conversation.name;
    if (conversation.type === 'private') {
      const otherUser = conversation.participants[0];
      return `${otherUser?.firstName} ${otherUser?.lastName}`;
    }
    return 'Group Chat';
  };

  const getConversationAvatar = () => {
    if (!conversation) return { src: null, fallback: '?', online: false };
    if (conversation.type === 'private') {
      const otherUser = conversation.participants[0];
      return {
        src: otherUser?.avatar,
        fallback: `${otherUser?.firstName?.[0]}${otherUser?.lastName?.[0]}`,
        online: otherUser?.isOnline,
      };
    }
    return {
      src: null,
      fallback: '👥',
      online: false,
    };
  };

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to Bantr
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  const avatar = getConversationAvatar();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <GlassCard className="p-4 m-2 mb-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={avatar.src}
              fallback={avatar.fallback}
              online={avatar.online}
              size="lg"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getConversationName()}
              </h2>
              {conversation.type === 'private' && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {avatar.online ? 'Online' : 'Offline'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Video className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => openModal('gameInvite')}
            >
              <Gamepad2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => openModal('aiChat')}
            >
              <Bot className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-4">
          {conversationMessages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.sender._id === user._id}
            />
          ))}
          
          {conversationTypingUsers.length > 0 && (
            <TypingIndicator users={conversationTypingUsers} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <GlassCard className="p-4 m-2 mt-0 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple={false}
          />
          
          <Button 
            variant="ghost" 
            size="sm" 
            type="button" 
            className="p-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              className="border-0 bg-transparent focus:ring-0"
            />
          </div>

          <Button variant="ghost" size="sm" type="button" className="p-2">
            <Smile className="w-4 h-4" />
          </Button>

          <Button
            type="submit"
            disabled={!messageText.trim() || uploading}
            className="p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default ChatWindow;