import React from 'react';
import type { Conversation } from '../../infrastructure/api/chatApi';

interface SidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations, activeId, onNew, onSelect, onDelete, userName, userEmail, onLogout
}) => {
  return (
    <nav className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="avatar-wrap">
          <span className="material-symbols-outlined avatar-icon">smart_toy</span>
        </div>
        <div>
          <h2 className="brand-name">Zenyvra AI</h2>
          <p className="brand-version">v1.0.4 Hyper-Drive</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="nav-section">
        <button className="nav-item active" onClick={onNew}>
          <span className="material-symbols-outlined">add_circle</span>
          <span>New Chat</span>
        </button>
        <button className="nav-item" onClick={() => window.location.href = '/agent'} id="sidebar-agent-btn">
          <span className="material-symbols-outlined">record_voice_over</span>
          <span>Voice Agent</span>
        </button>

        {/* History list */}
        <div className="history-list">
          {conversations.length > 0 && (
            <p className="history-label">RECENT</p>
          )}
          {conversations.map((conv, index) => (
            <div
              key={conv._id || `conv-${index}`}
              className={`nav-item history-item ${activeId === conv._id ? 'active' : ''}`}
              onClick={() => onSelect(conv._id)}
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              <span className="history-title">{conv.title || 'New Chat'}</span>
              <button
                className="delete-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(conv._id); }}
                title="Delete"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>

        <button className="nav-item" onClick={() => {}}>
          <span className="material-symbols-outlined">history</span>
          <span>History</span>
        </button>
        <button className="nav-item" onClick={() => {}}>
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {userName && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{userName}</span>
              <span className="sidebar-user-email">{userEmail}</span>
            </div>
          </div>
        )}
        {onLogout && (
          <button className="nav-item logout-btn" onClick={onLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </button>
        )}
        <button className="upgrade-btn">
          <span>Upgrade to Pro</span>
        </button>
      </div>

      {/* Telemetry */}
      <div className="telemetry">
        <span>LAT: 12ms</span>
        <span>SYS: ONLINE</span>
        <span>NODE: ALPHA-7</span>
      </div>
    </nav>
  );
};

export default Sidebar;
