import React from 'react';
import './Home.css';

const Home = ({ 
  time, 
  location, 
  input, 
  setInput, 
  handleSend, 
  sendFromPreset, 
  handleVoiceInput 
}) => {
  return (
    <>
      <div className="home-screen">
        <div className="time-bar">{time}</div>
        <h1 className="welcome">Hey 나연, welcome back!</h1>
        <p className="location">📍 {location}</p>
        <p className="summary">15°C · 흐림 · 미세먼지 보통</p>
        <div className="preset-buttons">
          <button onClick={() => sendFromPreset('오늘 날씨 어때?')}>
            오늘 날씨 어때?
          </button>
          <button onClick={() => sendFromPreset('미세먼지 농도는?')}>
            미세먼지 농도는?
          </button>
          <button onClick={() => sendFromPreset('꽃가루 농도는?')}>
            꽃가루 농도는?
          </button>
        </div>
        <button className="glow-mic" onClick={handleVoiceInput}>🎤</button>
      </div>
      <div className="footer-input">
        <input
          type="text"
          placeholder="질문을 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </>
  );
};

export default Home;