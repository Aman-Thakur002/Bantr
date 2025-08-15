import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // State
  sidebarCollapsed: false,
  activeTab: 'chats',
  modals: {
    profile: false,
    settings: false,
    newChat: false,
    gameInvite: false,
    createGroup: false,
    userSearch: false,
    themeCustomizer: false,
    aiChat: false,
    callIncoming: false,
    mediaPreview: false,
    adminPanel: false,
  },
  notifications: [],
  isCallActive: false,
  activeCall: null,
  mediaPreview: {
    isOpen: false,
    type: null,
    src: null,
    title: null,
  },
  loading: {
    global: false,
    conversations: false,
    messages: false,
    profile: false,
  },

  // Actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (modalName) => 
    set(state => ({
      modals: { ...state.modals, [modalName]: true }
    })),

  closeModal: (modalName) => 
    set(state => ({
      modals: { ...state.modals, [modalName]: false }
    })),

  closeAllModals: () => 
    set(state => ({
      modals: Object.keys(state.modals).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    })),

  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);

    return id;
  },

  removeNotification: (id) =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),

  clearNotifications: () => set({ notifications: [] }),

  setCallActive: (isActive, call = null) => 
    set({ isCallActive: isActive, activeCall: call }),

  setMediaPreview: (isOpen, type = null, src = null, title = null) =>
    set({ 
      mediaPreview: { 
        isOpen, 
        type, 
        src, 
        title 
      } 
    }),

  setLoading: (key, isLoading) =>
    set(state => ({
      loading: { ...state.loading, [key]: isLoading }
    })),
}));

export default useUIStore;