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

  // Gemini 호출 + 그래프 통합
  const callGeminiAPI = async (messageText) => {
    try {
      setMessages(prev => [...prev, { type: 'bot', text: '생각하는 중...' }]);

      const res = await fetch('http://localhost:4000/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: messageText, location, coords })
      });

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

      // 응답 추가 (텍스트 + 그래프 통합)
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // '생각하는 중...'

        return [
          ...newMessages,
          {
            type: 'bot',
            text: data.reply || '응답을 이해하지 못했어요.',
            graph: Array.isArray(graphData?.hourlyTemps) ? graphData.hourlyTemps : null
          }
        ];
      });

      if (data.error) {
        console.error('API 오류:', data.error);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.pop(); // 로딩 메시지 제거
          return [...newMessages, {
            type: 'bot',
            text: `❌ 오류: ${data.error}`
          }];
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop(); // 로딩 메시지 제거
        return [...newMessages, {
          type: 'bot',
          text: `❌ ${error.message}`
        }];
      });
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

  // 음성 입력 기능 구현
  const handleVoiceInput = () => {
    setView('listening');
    setTimeout(() => setView('listening'), 0);
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
          handleVoiceInput={handleVoiceInput}
        />
      )}
      {view === 'listening' && (
        <VoiceInput
          setView={setView}
          onVoiceResult={async (text) => {
            await sendMessage(text, false);
          }}
        />
      )}
    </div>
  );
}

export default App;
