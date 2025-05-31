import React from 'react';
import './Chat.css';

const Chat = ({ 
  messages, 
  input, 
  setInput, 
  handleSend 
}) => {
  return (
    <>
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
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </>
  );
};

export default Chat;