import React from 'react';
import useUIStore from '../stores/useUIStore';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import ContactsList from '../components/contacts/ContactsList';
import CallHistory from '../components/calls/CallHistory';
import GamesList from '../components/games/GamesList';
import AIAssistant from '../components/ai/AIAssistant';
import AdminPanel from '../components/admin/AdminPanel';

const ChatPage = () => {
  const { activeTab } = useUIStore();

  const renderLeftPanel = () => {
    switch (activeTab) {
      case 'contacts':
        return <ContactsList />;
      case 'calls':
        return <CallHistory />;
      case 'games':
        return <GamesList />;
      case 'ai':
        return <AIAssistant />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <ConversationList />;
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel */}
      <div className="w-80 border-r border-gray-200/20 dark:border-gray-700/20">
        {renderLeftPanel()}
      </div>
      
      {/* Chat Window */}
      <div className="flex-1">
        {activeTab === 'ai' ? <AIAssistant /> : <ChatWindow />}
      </div>
    </div>
  );
};

export default ChatPage;