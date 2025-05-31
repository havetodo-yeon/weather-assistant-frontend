import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './screens/Home/Home';
import Chat from './screens/Chat/Chat';
import VoiceInput from './screens/VoiceInput/VoiceInput';
import { geminiApi } from './services/geminiApi';

function App() {
  const [view, setView] = useState('home');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('위치 정보를 불러오는 중...');
  const [coords, setCoords] = useState(null); // 위도/경도 저장용


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
      },
      () => {
        setLocation('위치 정보 접근 거부됨');
      }
    );
  }, []);
  
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setView('chat');

  try {
    // 로딩 상태 메시지 추가
    setMessages(prev => [...prev, { type: 'bot', text: '생각하는 중...' }]);

    const res = await fetch('http://localhost:4000/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: input,
        location,
        coords
      })
    });

    const data = await res.json();

    // 로딩 메시지 제거하고 실제 응답 추가
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages.pop(); // 로딩 메시지 제거
      return [...newMessages, {
        type: 'bot',
        text: data.reply || '응답을 이해하지 못했어요.'
      }];
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
  }  catch (error) {
      // 로딩 메시지 제거하고 에러 메시지 추가
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

  const sendFromPreset = (text) => {
    const userMsg = { type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setView('chat');

    setTimeout(() => {
      if (text.includes('미세먼지')) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: (
            <>
              <strong>현재 서울시 미세먼지 농도는 '나쁨'이에요.</strong> 창문은 닫아두시고, 환기는 잠시 미뤄두시는 게 좋아요. 외출하실 땐 KF94 마스크를 꼭 착용해주시고, 가능하면 실내에서 활동하시는 걸 추천드려요 😷
            </>
          ),
          dust: { level: '나쁨', value: '81 µg/m³', color: '#f97316' }
        }]);
      } else if (text.includes('꽃가루')) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: (
            <>
              <strong>오늘 꽃가루 농도는 '위험' 수준이에요.</strong> 알레르기가 있으시다면 마스크와 안경을 착용해 주세요. 외출 후에는 세안하고 옷도 갈아입고, 코 세척도 꼭 해 주세요 🧼
            </>
          ),
          pollen: { level: '위험', risk: '야외 활동 자제 권장', icon: '🌼' }
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: (
            <>
              <strong>오늘은 기온이 24도고, 맑고 선선한 날씨예요.</strong> 가볍게 산책해보시는 건 어때요? 기분 전환에 딱 좋은 날씨예요 🚶‍♀️
            </>
          ),
          weather: {
            icon: '🌤️',
            temp: 24,
            condition: '맑음',
            humidity: '48%',
            wind: '8.1km/h'
          }
        }]);
      }
    }, 1000);
  };

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
          sendFromPreset={sendFromPreset}
          handleVoiceInput={handleVoiceInput}
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