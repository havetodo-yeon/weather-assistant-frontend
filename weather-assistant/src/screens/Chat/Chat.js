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
            <div key={i} className={`bubble ${m.type}`}>
  {m.text && <div>{m.text}</div>}
  {Array.isArray(m.graph) && m.graph.length > 0 && (
    <div className="graph-card">
      <WeatherLineChart graph={m.graph} />
    </div>
  )}
</div>

          ))}
        </div>
        <div className="header-icon-placeholder"></div>
      </header>

      <div className="chat-screen"> 
        <div className="messages" ref={messagesContainerRef}>
            {messages.map((m, i) => (
              <div key={i} className={`message-container ${m.type}`}>
                {/* 라벨 */}
                <div className="message-label">
                  {m.type === 'user' ? 'me' : 'Lumee'}
                </div>
                
                {/* 말풍선 */}
                <div key={i} className={`bubble ${m.type}`}>
                  {m.text && (
                    <div>
                      {m.isThinking ? (
                        // 생각하는 중일 때 왼쪽에 점 애니메이션과 함께 표시
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="thinking-dots">
                            <div className="thinking-dot"></div>
                            <div className="thinking-dot"></div>
                            <div className="thinking-dot"></div>
                          </div>
                          Thinking
                        </span>
                      ) : (
                        // 일반 메시지
                        m.text
                      )}
                    </div>
                  )}
                  {Array.isArray(m.graph) && m.graph.length > 0 && (

                    <div className="graph-card">
                      <WeatherLineChart graph={m.graph} />
                    </div>
                  )}
                </div>
              </div>
            ))}

             {/* 스크롤 타겟 - 화면에 보이지 않는 요소 */}
          <div ref={messagesEndRef} />
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
