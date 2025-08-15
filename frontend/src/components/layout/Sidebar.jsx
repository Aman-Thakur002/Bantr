import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Users, 
  Phone, 
  Gamepad2, 
  Settings,
  LogOut,
  Menu,
  Shield,
  Bot
} from 'lucide-react';
import useUIStore from '../../stores/useUIStore';
import useAuthStore from '../../stores/useAuthStore';
import useThemeStore from '../../stores/useThemeStore';
import GlassCard from '../ui/GlassCard';
import Avatar from '../ui/Avatar';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const { 
    sidebarCollapsed, 
    activeTab, 
    toggleSidebar, 
    setActiveTab,
    openModal 
  } = useUIStore();
  const { user, logout } = useAuthStore();
  const { toggleMode, mode } = useThemeStore();

  const navigationItems = [
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'calls', icon: Phone, label: 'Calls' },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'ai', icon: Bot, label: 'AI Assistant' },
  ];

  // Add admin tab for admins and moderators
  if (user?.role === 'admin' || user?.role === 'moderator') {
    navigationItems.push({ id: 'admin', icon: Shield, label: 'Admin' });
  }

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col h-full"
    >
      <GlassCard className="h-full p-4 m-2 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Bantr
              </h1>
            </motion.div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full flex items-center p-3 rounded-lg transition-all duration-200 font-medium',
                  isActive 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5', sidebarCollapsed ? 'mx-auto' : 'mr-3')} />
                {!sidebarCollapsed && (
                  <span>{item.label}</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="space-y-3 pt-6 border-t border-gray-200/20 dark:border-gray-700/20">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-50/50 to-white/30 dark:from-gray-800/50 dark:to-gray-700/30"
            >
              <Avatar
                src={user?.avatar}
                alt={user?.firstName}
                fallback={user?.firstName?.[0] + user?.lastName?.[0]}
                online={true}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{user?.username}
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => openModal('settings')}
              className={cn(
                'flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <Settings className={cn('w-5 h-5', !sidebarCollapsed && 'mr-3')} />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
            
            <button
              onClick={logout}
              className={cn(
                'flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:text-red-700 transition-colors',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <LogOut className={cn('w-5 h-5', !sidebarCollapsed && 'mr-3')} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Sidebar;