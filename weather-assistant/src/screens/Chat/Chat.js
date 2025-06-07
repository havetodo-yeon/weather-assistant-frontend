import React from 'react';
import './Chat.css';

const Chat = ({ 
  messages, 
  input, 
  setInput, 
  handleSend, 
  handleVoiceInput,

}) => {
  return (
    <div className="app-container"> {/* ✅ 공통 레이아웃 적용 */}
      <div className="chat-screen">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.type}`}>
              <div>{m.text}</div>

              {m.weather && (
                <div className="weather-card">
                  <div className="weather-icon">{m.weather.icon}</div>
                  <div className="weather-info">
                    <div className="temp">{m.weather.temp}°</div>
                    <div className="condition">{m.weather.condition}</div>
                    <div className="details">💧 {m.weather.humidity} | 🌬 {m.weather.wind}</div>
                  </div>
                </div>
              )}

              {m.dust && (
                <div className="dust-card" style={{ borderColor: m.dust.color }}>
                  <div className="dust-title">🌫️ 미세먼지</div>
                  <div className="dust-info">{m.dust.level} ({m.dust.value})</div>
                </div>
              )}

              {m.pollen && (
                <div className="pollen-card">
                  <div className="pollen-title">{m.pollen.icon} 꽃가루</div>
                  <div className="pollen-info">{m.pollen.level} · {m.pollen.risk}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-input">
        <div className="input-wrapper">  {/* 새로운 래퍼 추가 */}
          <input
            type="text"
            placeholder="Ask Lumee about the weather..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="mic-button" onClick={handleVoiceInput}>  {/* 마이크 버튼 추가 */}
            <img 
              src={`${process.env.PUBLIC_URL}/assets/icons/microphone.svg`}
              alt="음성입력"
            />
          </button>
        </div>
        <button className="send-button" onClick={handleSend}>
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/send.svg`}
            alt="전송"
          />
        </button>
      </div>
    </div>
  );
};

export default Chat;
