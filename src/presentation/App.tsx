import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AgentPage from '../agent/AgentPage';
import { useAuth } from './hooks/useAuth';

const AgentPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <AgentPage onBack={() => navigate('/')} />;
};

const App: React.FC = () => {
  const { user, isLoading, isAuthenticated, error, login, signup, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-orb" />
        <p>Initializing Zenyvra AI...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLogin={login} error={error} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <SignupPage onSignup={signup} error={error} />
            )
          }
        />
        <Route
          path="/agent"
          element={
            isAuthenticated ? (
              <AgentPageWrapper />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ChatPage user={user!} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
