import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, PhoneCall, PhoneIncoming, PhoneMissed, Clock } from 'lucide-react';
import { apiClient } from '../../lib/api';
import useUIStore from '../../stores/useUIStore';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { formatDate, formatTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

const CallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'voice', 'video'
  const { addNotification } = useUIStore();

  useEffect(() => {
    fetchCallHistory();
  }, [filter]);

  const fetchCallHistory = async () => {
    try {
      setIsLoading(true);
      const type = filter === 'all' ? undefined : filter;
      const response = await apiClient.getCallHistory(1, 50, type);
      setCalls(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to load call history',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initiateCall = async (participants, type) => {
    try {
      const response = await apiClient.initiateCall({
        conversationId: participants[0]._id, // Assuming conversation exists
        type,
        participants: participants.map(p => p._id),
      });
      
      addNotification({
        type: 'success',
        title: 'Call initiated',
        message: `${type === 'video' ? 'Video' : 'Voice'} call started`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to initiate call',
        message: error.message,
      });
    }
  };

  const getCallIcon = (call) => {
    if (call.status === 'missed') {
      return <PhoneMissed className="w-4 h-4 text-red-500" />;
    } else if (call.type === 'video') {
      return <Video className="w-4 h-4 text-green-500" />;
    } else {
      return <Phone className="w-4 h-4 text-green-500" />;
    }
  };

  const getCallDuration = (call) => {
    if (call.startedAt && call.endedAt) {
      const duration = new Date(call.endedAt) - new Date(call.startedAt);
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return call.status === 'missed' ? 'Missed' : 'No answer';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Call History
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <PhoneCall className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1">
          {[
            { id: 'all', label: 'All', icon: PhoneCall },
            { id: 'voice', label: 'Voice', icon: Phone },
            { id: 'video', label: 'Video', icon: Video },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={filter === id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(id)}
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Call History List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <PhoneCall className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No call history
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your call history will appear here
            </p>
          </div>
        ) : (
          <div className="p-2">
            {calls.map((call) => (
              <motion.div
                key={call._id}
                whileHover={{ scale: 1.02 }}
                className="mb-2"
              >
                <GlassCard className="p-3 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar
                        src={call.participants[0]?.avatar}
                        fallback={`${call.participants[0]?.firstName?.[0]}${call.participants[0]?.lastName?.[0]}`}
                        size="md"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        {getCallIcon(call)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {call.participants[0]?.firstName} {call.participants[0]?.lastName}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(call.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getCallDuration(call)}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDate(call.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => initiateCall(call.participants, 'voice')}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => initiateCall(call.participants, 'video')}
                      >
                        <Video className="w-4 h-4" />
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

export default CallHistory;