import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Edit, Trash2, Reply, Download, Eye } from 'lucide-react';
import Avatar from '../ui/Avatar';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import useUIStore from '../../stores/useUIStore';
import { formatTime, isImageFile, isVideoFile, isPDFFile, formatFileSize } from '../../lib/utils';
import { cn } from '../../lib/utils';

const MessageBubble = ({ message, isOwn }) => {
  const [showActions, setShowActions] = useState(false);
  const { setMediaPreview } = useUIStore();

  const handleMediaPreview = (attachment) => {
    if (attachment.type === 'image' || attachment.type === 'video' || attachment.type === 'document') {
      setMediaPreview(true, attachment.type, attachment.url, attachment.originalName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-end space-x-2',
        isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <Avatar
          src={message.sender.avatar}
          fallback={`${message.sender.firstName?.[0]}${message.sender.lastName?.[0]}`}
          size="sm"
        />
      )}

      <div className={cn('max-w-xs lg:max-w-md', isOwn && 'ml-auto')}>
        <GlassCard
          className={cn(
            'p-3 relative shadow-md',
            isOwn 
              ? 'bg-primary/20 border-primary/30' 
              : 'bg-white/20 dark:bg-white/10'
          )}
        >
          {!isOwn && (
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {message.sender.firstName} {message.sender.lastName}
            </p>
          )}

          <div className="mb-1">
            {message.type === 'text' && (
              <p className="text-gray-900 dark:text-white break-words">
                {message.content}
              </p>
            )}
            
            {message.type === 'image' && message.attachments?.[0] && (
              <div className="space-y-2">
                <div className="relative group cursor-pointer" onClick={() => handleMediaPreview(message.attachments[0])}>
                  <img
                    src={message.attachments[0].url}
                    alt={message.attachments[0].originalName}
                    className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                {message.content && message.content !== message.attachments[0].originalName && (
                  <p className="text-gray-900 dark:text-white break-words">
                    {message.content}
                  </p>
                )}
              </div>
            )}

            {message.type === 'video' && message.attachments?.[0] && (
              <div className="space-y-2">
                <div className="relative group cursor-pointer" onClick={() => handleMediaPreview(message.attachments[0])}>
                  <video
                    src={message.attachments[0].url}
                    className="rounded-lg max-w-full h-auto max-h-64"
                    controls={false}
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>
                </div>
                {message.content && message.content !== message.attachments[0].originalName && (
                  <p className="text-gray-900 dark:text-white break-words">
                    {message.content}
                  </p>
                )}
              </div>
            )}

            {message.type === 'document' && message.attachments?.[0] && (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {message.attachments[0].originalName?.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {message.attachments[0].originalName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(message.attachments[0].size)}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => handleMediaPreview(message.attachments[0])}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => window.open(message.attachments[0].url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {message.content && message.content !== message.attachments[0].originalName && (
                  <p className="text-gray-900 dark:text-white break-words">
                    {message.content}
                  </p>
                )}
              </div>
            )}

            {message.type === 'game' && (
              <div className="space-y-2">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
                  🎮 Game Invitation: Tic Tac Toe
                </div>
                {message.content && (
                  <p className="text-gray-900 dark:text-white break-words">
                    {message.content}
                  </p>
                )}
              </div>
            )}

            {message.type === 'ai' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>AI Response</span>
                </div>
                <p className="text-gray-900 dark:text-white break-words">
                  {message.content}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.createdAt)}
            </span>

            {message.reactions && message.reactions.length > 0 && (
              <div className="flex space-x-1">
                {message.reactions.map((reaction, index) => (
                  <span
                    key={index}
                    className="text-sm bg-white/20 dark:bg-white/10 px-2 py-1 rounded-full"
                  >
                    {reaction.emoji} {reaction.users.length}
                  </span>
                ))}
              </div>
            )}
          </div>

          {showActions && isOwn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-2 -right-2"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex">
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors">
                  <Edit className="w-3 h-3" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Reply className="w-3 h-3" />
                </button>
                <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-r-lg transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default MessageBubble;