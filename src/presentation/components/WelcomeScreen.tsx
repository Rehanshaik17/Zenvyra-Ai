import React from 'react';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: 'analytics',
    title: 'Analyze Telemetry',
    description: 'Process raw dataset streams and identify anomalous patterns in system performance.',
    prompt: 'Analyze the telemetry data and identify anomalous patterns.',
  },
  {
    icon: 'code_blocks',
    title: 'Synthesize Logic',
    description: 'Generate optimized operational scripts or debug existing command architectures.',
    prompt: 'Help me write an optimized script for my use case.',
  },
  {
    icon: 'auto_awesome',
    title: 'Creative Matrix',
    description: 'Extrapolate conceptual designs, draft communications, or expand on narrative frameworks.',
    prompt: 'Help me brainstorm creative ideas for my project.',
  },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  return (
    <div className="welcome-screen">
      {/* Orb */}
      <div className="orb-wrapper">
        <div className="orb-glow" />
        <div className="orb-glass" />
        <div className="orb-core">
          <span className="material-symbols-outlined orb-icon fill-icon">temp_preferences_custom</span>
        </div>
      </div>

      <h1 className="welcome-headline">How can I help you today?</h1>

      <div className="prompt-grid">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p.title}
            className="prompt-card"
            onClick={() => onPromptClick(p.prompt)}
          >
            <div className="prompt-card-hover-bg" />
            <div className="prompt-icon-wrap">
              <span className="material-symbols-outlined prompt-icon">{p.icon}</span>
            </div>
            <h3 className="prompt-title">{p.title}</h3>
            <p className="prompt-desc">{p.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
