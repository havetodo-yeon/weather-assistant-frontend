import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './screens/Home/Home';
import Chat from './screens/Chat/Chat';
import VoiceInput from './screens/VoiceInput/VoiceInput';

function App() {
  const [view, setView] = useState('home');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Fetching location...');
  const [coords, setCoords] = useState(null); // 위도/경도 저장용
  const [weather, setWeather] = useState(null); // 날씨 상태 추가

  useEffect(() => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setTime(`${h}:${m}`);

  // 위치 정보 가져오기 및 주소 변환
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude }); // 좌표 저장
        
        // 주소 요청
        try {
          const res = await fetch('http://localhost:4000/reverse-geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await res.json();
          setLocation(data.region || '주소를 찾을 수 없음');
        } catch (err) {
          console.error('📍 주소 요청 실패:', err);
          setLocation('주소 요청 실패');
        }

        // 날씨 요청
        try {
        const res = await fetch('http://localhost:4000/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude })
        });
        const data = await res.json();
        setWeather(data); // 날씨 상태 저장
        } catch (err) {
          console.error('🌧️ 날씨 정보 오류:', err);
        }
      },
      () => {
        setLocation('위치 정보 접근 거부됨');
      }
    );
  }, []);

//  뒤로가기 함수 추가
const handleBackToHome = () => {
  setView('home');
  setMessages([]); // 채팅 메시지 초기화
  setInput('');    // 입력창도 초기화
};
// Gemini 호출 + 그래프 통합
  const callGeminiAPI = async (messageText) => {
    try {
      let thinkingShown = false;
      let thinkingStartTime = null;
      
      // 800ms 후에 "Thinking" 메시지 표시
      const thinkingTimer = setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: 'Thinking', isThinking: true }]);
        thinkingShown = true;
        thinkingStartTime = Date.now(); // 생각하는 중 시작 시간 기록
      }, 800);

      const res = await fetch('http://localhost:4000/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: messageText, location, coords })
      });

      // API 응답이 빨리 와서 "Thinking"이 표시되기 전이면 타이머 취소
      clearTimeout(thinkingTimer);

      const data = await res.json();
      const graphCoords = data.resolvedCoords || coords;
      console.log('📍 resolvedCoords:', graphCoords);

      // 기온 질문 시 그래프 요청
      let graphData = null;
      if (
        (messageText.includes('기온') || messageText.includes('온도')) &&
        graphCoords && graphCoords.lat && graphCoords.lon
      ) {
        const graphRes = await fetch('http://localhost:4000/weather-graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: graphCoords.lat,
            longitude: graphCoords.lon
          })
        });
        graphData = await graphRes.json();
      }

      // "Thinking"이 표시되었다면 최소 1초 대기 후 응답 표시
      const processResponse = () => {
        setMessages(prev => {
          const newMessages = [...prev];
          
          // "Thinking"이 표시되었으면 제거
          if (thinkingShown && newMessages[newMessages.length - 1]?.isThinking) {
            newMessages.pop();
          }

          return [
            ...newMessages,
            {
              type: 'bot',
              text: data.reply || '응답을 이해하지 못했어요.',
              graph: Array.isArray(graphData?.hourlyTemps) ? graphData.hourlyTemps : null
            }
          ];
        });
      };

      if (thinkingShown && thinkingStartTime) {
        // "Thinking"이 표시된 경우, 최소 1초 경과 후 응답 표시
        const elapsed = Date.now() - thinkingStartTime;
        const minDisplayTime =1000; // 1초
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        setTimeout(processResponse, remainingTime);
      } else {
        // "Thinking"이 표시되지 않은 경우 즉시 응답
        processResponse();
      }

      if (data.error) {
        console.error('API 오류:', data.error);
        
        const processError = () => {
          setMessages(prev => {
            const newMessages = [...prev];
            
            // "Thinking"이 표시되었으면 제거
            if (thinkingShown && newMessages[newMessages.length - 1]?.isThinking) {
              newMessages.pop();
            }
            
            return [...newMessages, {
              type: 'bot',
              text: `❌ 오류: ${data.error}`
            }];
          });
        };

        if (thinkingShown && thinkingStartTime) {
          const elapsed = Date.now() - thinkingStartTime;
          const minDisplayTime = 1000;
          const remainingTime = Math.max(0, minDisplayTime - elapsed);
          setTimeout(processError, remainingTime);
        } else {
          processError();
        }
      }
    } catch (error) {
      const processErrorCatch = () => {
        setMessages(prev => {
          const newMessages = [...prev];
          
          // "Thinking"이 표시되었으면 제거 (에러 시에도 동일)
          if (newMessages[newMessages.length - 1]?.isThinking) {
            newMessages.pop();
          }
          
          return [...newMessages, {
            type: 'bot',
            text: `❌ ${error.message}`
          }];
        });
      };

      // catch 블록에서는 thinkingStartTime을 확인할 수 없으므로 즉시 처리
      processErrorCatch();
    }
  };

  // 통합된 메시지 전송 함수
  const sendMessage = async (messageText, fromInput = false) => {
    const userMsg = { type: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);

    if (fromInput) {
      setInput(''); // input에서 온 경우에만 초기화
    }

    setView('chat');
    await callGeminiAPI(messageText);
  };

  // 텍스트 입력창에서 메시지 전송
  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, true);
  };

  // FAQ 카드(자주 묻는 질문)에서 메시지 전송
  const sendFromFAQ = async (text) => {
    await sendMessage(text, false);
  };

  // 음성 입력 기능이 구현되면 수정할 예정
  const handleVoiceInput = () => {
    setView('listening');

    setTimeout(() => {
      const userMsg = { type: 'user', text: '목이 아픈데 내일 미세먼지 어때?' };
      setMessages(prev => [...prev, userMsg]);
      setView('chat');

      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: (
            <>
              <strong>내일 서울시 미세먼지 농도는 '나쁨' 수준으로 예상돼요.</strong> 목이 아프신 상태라면 꼭 KF94 마스크를 착용하고, 실내 공기질 관리도 신경 써주세요. 무리한 외출은 피하는 게 좋겠어요 😷
            </>
          ),
          dust: {
            level: '나쁨',
            value: '82 µg/m³',
            color: '#f97316',
          }
        }]);
      }, 1000);
    }, 2000);
  };

  return (
    <div className={`app ${view}`}>
      {view === 'home' && (
        <Home 
          time={time}
          location={location}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          sendFromFAQ={sendFromFAQ}
          handleVoiceInput={handleVoiceInput}
          weather={weather}
        />
      )}
      {view === 'chat' && (
        <Chat 
          messages={messages}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          onBackToHome={handleBackToHome} // 뒤로가기 함수 전달
        />
      )}
      {view === 'listening' && (
        <VoiceInput setView={setView} />
      )}
    </div>
  );
}



export default App;
