import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Notifications from '../ui/Notifications';
import MediaPreview from '../media/MediaPreview';
import useAuthStore from '../../stores/useAuthStore';
import useChatStore from '../../stores/useChatStore';
import useThemeStore from '../../stores/useThemeStore';

const MainLayout = () => {
  const { initialize: initAuth } = useAuthStore();
  const { initializeSocket } = useChatStore();
  const { initialize: initTheme } = useThemeStore();

  useEffect(() => {
    // Initialize all stores
    initAuth();
    initTheme();
    initializeSocket();

    return () => {
      // Cleanup on unmount
      useChatStore.getState().cleanup();
    };
  }, [initAuth, initTheme, initializeSocket]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
      <Notifications />
      <MediaPreview />
    </div>
  );
};

export default MainLayout;