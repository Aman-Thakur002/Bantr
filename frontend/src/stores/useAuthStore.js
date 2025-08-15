import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/api';
import { socketManager } from '../lib/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.login(email, password);
          
          const { user, accessToken, refreshToken } = response.data;
          
          apiClient.setAccessToken(accessToken);
          socketManager.connect(accessToken);
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.register(userData);
          
          if (response.data.user) {
            // Auto-login after registration if tokens are provided
            if (response.data.accessToken) {
              const { user, accessToken, refreshToken } = response.data;
              
              apiClient.setAccessToken(accessToken);
              socketManager.connect(accessToken);
              
              set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              set({ isLoading: false });
            }
          }
          
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { accessToken } = get();
          if (accessToken) {
            await apiClient.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          apiClient.setAccessToken(null);
          socketManager.disconnect();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) throw new Error('No refresh token');
          
          const response = await apiClient.refreshToken(refreshToken);
          const { accessToken: newAccessToken } = response.data;
          
          apiClient.setAccessToken(newAccessToken);
          set({ accessToken: newAccessToken });
          
          return response;
        } catch (error) {
          // If refresh fails, logout the user
          get().logout();
          throw error;
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.updateProfile(profileData);
          
          set({
            user: { ...get().user, ...response.data },
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      uploadAvatar: async (file) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiClient.uploadAvatar(file);
          
          set({
            user: { ...get().user, avatar: response.data.url },
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Initialize auth state on app start
      initialize: async () => {
        const { accessToken, refreshToken } = get();
        
        if (accessToken) {
          apiClient.setAccessToken(accessToken);
          
          try {
            // Verify token by fetching profile
            const response = await apiClient.getProfile();
            set({ user: response.data, isAuthenticated: true });
            socketManager.connect(accessToken);
          } catch (error) {
            // Token might be expired, try to refresh
            if (refreshToken) {
              try {
                await get().refreshToken();
                const profileResponse = await apiClient.getProfile();
                set({ user: profileResponse.data, isAuthenticated: true });
                socketManager.connect(get().accessToken);
              } catch (refreshError) {
                get().logout();
              }
            } else {
              get().logout();
            }
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;