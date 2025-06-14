import React, { useState, useEffect, useRef } from 'react';
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
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  
  // 진행 중인 요청을 추적하기 위한 ref
  const abortControllerRef = useRef(null);
  const thinkingTimerRef = useRef(null);

  // 현재 화면을 추적하기 위한 state 추가 (App.js 상단에)
  const [previousView, setPreviousView] = useState('home');
  

  useEffect(() => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setTime(`${h}:${m}`);

    // 위치 정보 가져오기 및 주소 변환
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        
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

        try {
          const res = await fetch('http://localhost:4000/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await res.json();
          setWeather(data);
        } catch (err) {
          console.error('🌧️날씨 정보 오류:', err);
        }
      },
      () => {
        setLocation('위치 정보 접근 거부됨');
      }
    );
  }, []);

  // 뒤로가기 함수 - 진행 중인 요청 취소 및 완전한 상태 초기화
  const handleBackToHome = () => {
    console.log('🔙 뒤로가기 시작 - 모든 상태 초기화');
    
    // 1. 진행 중인 HTTP 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log('⏹️ HTTP 요청 취소됨');
    }
    
    // 2. 진행 중인 타이머 취소
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
      console.log('⏰ Thinking 타이머 취소됨');
    }
    
    // 3. 상태 즉시 초기화 (동기적으로)
    setView('home');
    setMessages([]);
    setInput('');
    
    console.log('✅ 모든 상태 초기화 완료');
  };

  // Gemini 호출 + 그래프 통합 - AbortController로 요청 취소 가능하게 수정
  const callGeminiAPI = async (messageText) => {
    try {
      // 이전 요청이 있다면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      let thinkingShown = false;
      let thinkingStartTime = null;
      
      // 800ms 후에 "Thinking" 메시지 표시
      thinkingTimerRef.current = setTimeout(() => {
        // 요청이 취소되지 않았을 때만 Thinking 표시
        if (!signal.aborted) {
          setMessages(prev => [...prev, { type: 'bot', text: 'Thinking', isThinking: true }]);
          thinkingShown = true;
          thinkingStartTime = Date.now();
        }
      }, 800);

      const res = await fetch('http://localhost:4000/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: messageText, location, coords, uid: 'testUser1' }),
        signal // AbortController 신호 추가
      });

      // 요청이 취소되었다면 여기서 중단
      if (signal.aborted) {
        console.log('🚫 요청이 취소되었습니다.');
        return;
      }

      // API 응답이 빨리 와서 "Thinking"이 표시되기 전이면 타이머 취소
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }

      const data = await res.json();
      const graphCoords = data.resolvedCoords || coords;
      console.log('📍 resolvedCoords:', graphCoords);

      // 미세먼지 정보가 포함되어 있으면 추가 메시지 구성
      if (data.airQuality && data.airQuality.pm25 !== undefined) {
        const { pm25 } = data.airQuality;

        const getAirLevel = (value) => {
          if (value <= 15) return '좋음';
          if (value <= 35) return '보통';
          if (value <= 75) return '나쁨';
          return '매우 나쁨';
        };

        const getAirColor = (value) => {
          if (value <= 15) return '#22c55e';   // green
          if (value <= 35) return '#facc15';   // yellow
          if (value <= 75) return '#f97316';   // orange
          return '#ef4444';                    // red
        };

        const dustInfo = {
          value: pm25,
          level: getAirLevel(pm25),
          color: getAirColor(pm25)
        };

        // '생각 중...' 메시지 제거 후 응답 메시지 + dust 정보 반영
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.pop(); // 로딩 제거
          return [...newMessages, {
            type: 'bot',
            text: data.reply,
            dust: dustInfo
          }];
        });

        return; // 미세먼지 응답이면 여기서 종료
      }

      // 기온 질문 시 그래프 요청
      let graphData = null;
      if (
        (messageText.includes('기온') || messageText.includes('온도')) &&
        graphCoords && graphCoords.lat && graphCoords.lon &&
        !signal.aborted // 취소되지 않았을 때만
      ) {
        const graphRes = await fetch('http://localhost:4000/weather-graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: graphCoords.lat,
            longitude: graphCoords.lon
          }),
          signal // 그래프 요청에도 취소 신호 추가
        });
        
        if (!signal.aborted) {
          graphData = await graphRes.json();
        }
      }

      // 최종 응답 처리
      const processResponse = () => {
        // 요청이 취소되었다면 상태 업데이트 하지 않음
        if (signal.aborted) {
          console.log('🚫 응답 처리 중단됨 (요청 취소)');
          return;
        }
        
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

      if (thinkingShown && thinkingStartTime && !signal.aborted) {
        const elapsed = Date.now() - thinkingStartTime;
        const minDisplayTime = 1000;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        setTimeout(() => {
          if (!signal.aborted) {
            processResponse();
          }
        }, remainingTime);
      } else if (!signal.aborted) {
        processResponse();
      }

      if (data.error && !signal.aborted) {
        console.error('API 오류:', data.error);
        
        const processError = () => {
          if (signal.aborted) return;
          
          setMessages(prev => {
            const newMessages = [...prev];
            
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

      // 요청 완료 후 AbortController 정리
      abortControllerRef.current = null;
      
    } catch (error) {
      // AbortError는 정상적인 취소이므로 에러 메시지 표시하지 않음
      if (error.name === 'AbortError') {
        console.log('🚫 요청이 사용자에 의해 취소되었습니다.');
        return;
      }
      
      const processErrorCatch = () => {
        setMessages(prev => {
          const newMessages = [...prev];
          
          if (newMessages[newMessages.length - 1]?.isThinking) {
            newMessages.pop();
          }
          
          return [...newMessages, {
            type: 'bot',
            text: `❌ ${error.message}`
          }];
        });
      };

      processErrorCatch();
      
      // 에러 발생 시에도 AbortController 정리
      abortControllerRef.current = null;
    }
  };

  // 통합된 메시지 전송 함수
  const sendMessage = async (messageText, fromInput = false) => {
    const userMsg = { type: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);

    if (fromInput) {
      setInput('');
    }

    setView('chat');
    await callGeminiAPI(messageText);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input, true);
  };

  const sendFromFAQ = async (text) => {
    await sendMessage(text, false);
  };

  const handleVoiceInput = () => {
    setPreviousView(view); // 현재 화면을 이전 화면으로 저장
    setView('listening');
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
    };
  }, []);

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
          onBackToHome={handleBackToHome}
          handleVoiceInput={handleVoiceInput}
        />
      )}
 

      {view === 'listening' && (
        <VoiceInput
          setView={setView}
          previousView={previousView} // 이전 화면 정보 전달
          onResult={async (text) => {
            console.log('🎤 음성 결과 받음:', text);
            
            // 즉시 메시지 전송 (지연 없음)
            try {
              await sendMessage(text, false);
            } catch (error) {
              console.error('메시지 전송 실패:', error);
            }
          }}
        />
      )}
    </div>
  );
}

export default App;