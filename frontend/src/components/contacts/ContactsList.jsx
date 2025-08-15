import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Users, MoreHorizontal, MessageCircle, Phone, Video } from 'lucide-react';
import { apiClient } from '../../lib/api';
import useUIStore from '../../stores/useUIStore';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addNotification, openModal } = useUIStore();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getContacts();
      setContacts(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to load contacts',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (contact) => {
    try {
      // Create or find existing conversation
      const response = await apiClient.createConversation({
        participants: [contact._id],
        type: 'private',
      });
      
      // Switch to chats tab and set active conversation
      // This would be handled by the chat store
      addNotification({
        type: 'success',
        title: 'Chat started',
        message: `Started chat with ${contact.firstName} ${contact.lastName}`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to start chat',
        message: error.message,
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contacts
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal('userSearch')}
            className="p-2"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts List */}
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
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No contacts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add contacts to start chatting!
            </p>
            <Button onClick={() => openModal('userSearch')}>
              Add Contact
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact._id}
                whileHover={{ scale: 1.02 }}
                className="mb-2"
              >
                <GlassCard className="p-3 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={contact.avatar}
                      fallback={`${contact.firstName?.[0]}${contact.lastName?.[0]}`}
                      online={contact.isOnline}
                      size="md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{contact.username}
                      </p>
                      {contact.bio && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {contact.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => handleStartChat(contact)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsList;