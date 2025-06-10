import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';
import WeatherLineChart from './WeatherLineChart'; // 경로는 파일 위치에 따라 조절

const Chat = ({ 
  messages, 
  input, 
  setInput, 
  handleSend, 
  handleVoiceInput,
  onBackToHome 
}) => {
  //const chartRef = useRef(null); //경고메시지가 떠서 주석 처리하였습니다.
  const [chatTitle, setChatTitle] = useState(''); // 제목 상태 추가

  // 제목 생성 로직 - useRef로 중복 방지
  const titleGeneratedRef = useRef(false);

  // 메시지 컨테이너 참조 생성
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  useEffect(() => {
    // 첫 번째 사용자 메시지가 있고 아직 제목을 생성하지 않았을 때
    if (messages.length >= 1 && messages[0]?.type === 'user' && !titleGeneratedRef.current) {
      titleGeneratedRef.current = true; // 제목 생성 시작 플래그
      
      const generateTitle = async () => {
        try {
          const response = await fetch('http://localhost:4000/generate-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userInput: messages[0].text })
          });
          
          if (!response.ok) {
            console.error('제목 생성 API 오류:', response.status);
            setChatTitle('Weather Chat');
            return;
          }
          
          const data = await response.json();
          setChatTitle(data.title || 'Weather Chat');
          console.log('🏷️ 생성된 채팅 제목:', data.title);
          
        } catch (err) {
          console.error('제목 생성 실패:', err);
          setChatTitle('Weather Chat');
        }
      };

      generateTitle();
    }
  }, [messages]); // messages만 dependency로 사용

  // 자동 스크롤 함수
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      // 완전히 맨 아래로 스크롤
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  // 메시지가 변경될 때마다 자동 스크롤
  useEffect(() => {
    // 약간의 지연을 주어 DOM 업데이트 완료 후 스크롤
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]); // messages 배열이 변경될 때마다 실행




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

 // 뒤로가기 핸들러
  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      console.log('뒤로가기 기능이 연결되지 않았습니다.');
    }
  };

  return (
    <div className="app-container">
      {/* 헤더 추가 */}
      <header className="weather-header">
        {/* 왼쪽 뒤로가기 버튼 */}
        <button className="header-back-btn" onClick={handleBack} aria-label="뒤로가기">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="뒤로가기"
            className="back-icon"
          />
        </button>
        
        {/* 중앙 채팅 제목 */}
        <div className="header-chat-title">
          <h3>{chatTitle || 'Weather Chat'}</h3>
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
                <div className={`bubble ${m.type}`}>
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
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask Lumee about the weather..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="mic-button" onClick={handleVoiceInput}>
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