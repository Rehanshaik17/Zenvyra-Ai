import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface SignupPageProps {
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  error: string | null;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || isSubmitting) return;

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);
    try {
      await onSignup(name, email, password);
    } catch {
      // error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-ambient-glow" />
      <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-brand-panel">
          <div className="auth-orb">
            <div className="auth-orb-glow" />
            <div className="auth-orb-glass" />
            <div className="auth-orb-core">
              <span className="material-symbols-outlined auth-orb-icon">smart_toy</span>
            </div>
          </div>
          <h1 className="auth-brand-title">Zenyvra AI</h1>
          <p className="auth-brand-subtitle">Join the next era of AI-powered conversation</p>
          <div className="auth-brand-features">
            <div className="auth-feature">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Unlimited conversations</span>
            </div>
            <div className="auth-feature">
              <span className="material-symbols-outlined">history</span>
              <span>Chat history preserved</span>
            </div>
            <div className="auth-feature">
              <span className="material-symbols-outlined">speed</span>
              <span>Real-time streaming</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Start your AI journey today</p>
          </div>

          {displayError && (
            <div className="auth-error">
              <span className="material-symbols-outlined">error</span>
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name">Full Name</label>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-input-icon">person</span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-input-icon">mail</span>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-input-icon">lock</span>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-input-icon">lock</span>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="auth-spinner" />
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
