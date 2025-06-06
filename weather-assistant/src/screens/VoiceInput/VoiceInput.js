import React from 'react';
import './VoiceInput.css';

const VoiceInput = ({ setView }) => {
  return (
    <div className="app-container">
      <div className="listening-screen">
        <p className="listening-text">듣고 있어요...</p>
        <div className="mic-pulse">🎤</div>
        <button className="back-button" onClick={() => setView('home')}>
          홈으로
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;
