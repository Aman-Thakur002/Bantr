import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, setTokens, clearTokens } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

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

      login: async (identifier, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.login(identifier, password);
          
          const { user, tokens } = response.data;
          const { accessToken, refreshToken } = tokens;
          
          setTokens(accessToken, refreshToken);
          // connectSocket(accessToken); // Temporarily disabled
          
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
          const response = await authAPI.register(userData);
          
          // Auto-login after registration since backend returns tokens
          const { user, tokens } = response.data;
          const { accessToken, refreshToken } = tokens;
          
          setTokens(accessToken, refreshToken);
          // connectSocket(accessToken); // Temporarily disabled
          
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

      logout: async () => {
        try {
          const { accessToken } = get();
          if (accessToken) {
            await authAPI.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          clearTokens();
          disconnectSocket();
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
          
          const response = await authAPI.refreshToken(refreshToken);
          const { tokens } = response.data;
          const { accessToken: newAccessToken } = tokens;
          
          setTokens(newAccessToken, refreshToken);
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
          const response = await userAPI.updateProfile(profileData);
          
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
          const response = await userAPI.uploadAvatar(file);
          
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

      // Initialize auth state on app start - DISABLED
      initialize: async () => {
        // Temporarily disabled to prevent logout loops
        console.log('Auth initialize disabled');
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