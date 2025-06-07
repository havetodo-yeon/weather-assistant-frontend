import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './screens/Home/Home';
import Chat from './screens/Chat/Chat';
import VoiceInput from './screens/VoiceInput/VoiceInput';
// import { geminiApi } from './services/geminiApi';

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
  
  // Gemini API 호출 함수 
  const callGeminiAPI = async (messageText) => {
    try {
      setMessages(prev => [...prev, { type: 'bot', text: '생각하는 중...' }]);

      const res = await fetch('http://localhost:4000/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: messageText,
          location,
          coords
        })
      });

      const data = await res.json();

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop();
        return [...newMessages, {
          type: 'bot',
          text: data.reply || '응답을 이해하지 못했어요.'
        }];
      });

      if (data.error) {
        console.error('API 오류:', data.error);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.pop();
          return [...newMessages, {
            type: 'bot',
            text: `❌ 오류: ${data.error}`
          }];
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages.pop();
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
        />
      )}

      {view === 'listening' && (
        <VoiceInput setView={setView} />
      )}
    </div>
  );
}

export default App;