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
  const today = new Date();
  const formattedDate = formatDate(today); // ex. "May 24, Monday"

  return (
    <div className="app-container"> {/* ✅ 공통 정렬용 래퍼 추가 */}
      <div className="home-screen">
        <h1 className="welcome">Hey 나연, welcome back!</h1>
        
        {/* 날짜 출력 */}
        <p className="date">{formattedDate}</p>

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
    </div>
  );
};


function formatDate(date) {
  const options = { month: 'short', day: 'numeric', weekday: 'long' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);

  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const weekday = parts.find(p => p.type === 'weekday').value;

  return `${month} ${day}, ${weekday}`;  // month -> day -> weekday 순으로 포맷된 문자열 반환 ("May 24, Monday")
}

export default Home;
