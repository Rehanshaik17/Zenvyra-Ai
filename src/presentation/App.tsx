import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, isLoading, isAuthenticated, error, login, signup, logout, setError } = useAuth();

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
