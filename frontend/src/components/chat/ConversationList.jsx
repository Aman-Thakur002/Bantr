import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users, MessageCircle } from 'lucide-react';
import useChatStore from '../../stores/useChatStore';
import useUIStore from '../../stores/useUIStore';
import GlassCard from '../ui/GlassCard';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const ConversationList = () => {
  const {
    conversations,
    activeConversation,
    fetchConversations,
    setActiveConversation,
    isLoading,
  } = useChatStore();
  const { openModal, sidebarCollapsed } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    if (conversation.type === 'private') {
      const otherUser = conversation.participants[0];
      return `${otherUser?.firstName} ${otherUser?.lastName}`;
    }
    return 'Group Chat';
  };

  const getConversationAvatar = (conversation) => {
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
      fallback: <Users className="w-5 h-5" />,
      online: false,
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversations
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal('userSearch')}
              className="p-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal('createGroup')}
              className="p-2"
            >
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start a new conversation to get chatting!
            </p>
            <Button onClick={() => openModal('userSearch')}>
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const isActive = activeConversation === conversation._id;
              const avatar = getConversationAvatar(conversation);
              
              return (
                <motion.div
                  key={conversation._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassCard
                    className={cn(
                      'p-3 mb-2 cursor-pointer transition-all duration-200',
                      isActive 
                        ? 'bg-primary/20 border-primary/30 shadow-lg' 
                        : 'hover:bg-white/20 dark:hover:bg-white/5 hover:shadow-md'
                    )}
                    onClick={() => setActiveConversation(conversation._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={avatar.src}
                        fallback={avatar.fallback}
                        online={avatar.online}
                        size="md"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {getConversationName(conversation)}
                          </h4>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conversation.lastMessage.type === 'text' 
                              ? conversation.lastMessage.content
                              : `${conversation.lastMessage.type} message`
                            }
                          </p>
                        )}
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;