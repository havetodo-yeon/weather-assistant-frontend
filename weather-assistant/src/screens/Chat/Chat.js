import React, { useEffect, useRef } from 'react';
import './Chat.css';
import WeatherLineChart from './WeatherLineChart'; // 경로는 파일 위치에 따라 조절

const Chat = ({ 
  messages, 
  input, 
  setInput, 
  handleSend, 
  handleVoiceInput,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.graph) {
      console.log('📊 최종 렌더링 대상 m.graph:', last.graph);

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        console.log('🔁 window.resize 트리거됨');
      }, 100);
    }
  }, [messages]);

  return (
    <div className="app-container">
      <div className="chat-screen">
        <div className="messages">
          {messages.map((m, i) => (
            <div className={`bubble ${m.type}`}>
  {m.text && <div>{m.text}</div>}
  {Array.isArray(m.graph) && m.graph.length > 0 && (
    <div className="graph-card">
      <WeatherLineChart graph={m.graph} />
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
