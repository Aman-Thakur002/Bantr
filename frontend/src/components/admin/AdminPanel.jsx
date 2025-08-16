import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Phone, 
  TrendingUp, 
  AlertCircle,
  UserCheck,
  UserX,
  Crown,
  Ban
} from 'lucide-react';
import * as apiClient from '../../lib/api';
import useUIStore from '../../stores/useUIStore';
import useAuthStore from '../../stores/useAuthStore';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSystemStats();
    fetchUsers();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await apiClient.getSystemStats();
      setStats(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to load system stats',
        message: error.message,
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to load users',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId, status, reason = '') => {
    try {
      await apiClient.updateUserStatus(userId, status, reason);
      await fetchUsers(); // Refresh users list
      
      addNotification({
        type: 'success',
        title: 'User status updated',
        message: `User has been ${status}`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to update user status',
        message: error.message,
      });
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await apiClient.updateUserRole(userId, role);
      await fetchUsers(); // Refresh users list
      
      addNotification({
        type: 'success',
        title: 'User role updated',
        message: `User role changed to ${role}`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to update user role',
        message: error.message,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'inactive': return 'text-gray-500 bg-gray-500/10';
      case 'suspended': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-500 bg-purple-500/10';
      case 'moderator': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const adminTabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'reports', name: 'Reports', icon: AlertCircle },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}/20 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </GlassCard>
  );

  // Check if user has admin/moderator permissions
  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You need admin or moderator privileges to access this panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user.role === 'admin' ? 'System Administrator' : 'Moderator'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1">
          {adminTabs.map(({ id, name, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(id)}
              className="flex-1"
            >
              <Icon className="w-4 h-4 mr-2" />
              {name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.totalUsers || 0}
                icon={Users}
                trend={12}
                color="primary"
              />
              <StatCard
                title="Active Chats"
                value={stats.activeChats || 0}
                icon={MessageSquare}
                trend={8}
                color="green"
              />
              <StatCard
                title="Total Calls"
                value={stats.totalCalls || 0}
                icon={Phone}
                trend={-3}
                color="blue"
              />
              <StatCard
                title="Reports"
                value={stats.reports || 0}
                icon={AlertCircle}
                trend={0}
                color="red"
              />
            </div>

            {/* Recent Activity */}
            <GlassCard className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {/* Mock activity data */}
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    New user registered: John Doe
                  </span>
                  <span className="text-gray-400 text-xs ml-auto">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Group chat created: Project Team
                  </span>
                  <span className="text-gray-400 text-xs ml-auto">1 hour ago</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Management
            </h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((userData) => (
                  <motion.div
                    key={userData._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={userData.avatar}
                            fallback={`${userData.firstName?.[0]}${userData.lastName?.[0]}`}
                            size="md"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {userData.firstName} {userData.lastName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              @{userData.username} • {userData.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                getStatusColor(userData.status)
                              )}>
                                {userData.status}
                              </span>
                              <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                getRoleColor(userData.role)
                              )}>
                                {userData.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {user.role === 'admin' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateUserRole(userData._id, userData.role === 'moderator' ? 'user' : 'moderator')}
                                className="p-2"
                              >
                                <Crown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateUserStatus(userData._id, userData.status === 'suspended' ? 'active' : 'suspended')}
                                className="p-2"
                              >
                                {userData.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Reports
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              User reports and moderation items will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;