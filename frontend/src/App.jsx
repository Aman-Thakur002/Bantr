import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/auth/:type" 
            element={isAuthenticated ? <Navigate to="/chat" replace /> : <AuthPage />} 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <MainLayout />
              ) : (
                <Navigate to="/auth/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;