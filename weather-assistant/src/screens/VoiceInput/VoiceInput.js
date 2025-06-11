import React, { useEffect, useRef, useState } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ setView, onResult }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [partial, setPartial] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    let recognition;

    // 브라우저 지원 체크
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('이 브라우저는 음성인식을 지원하지 않습니다.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onerror = (event) => setError('음성인식 오류: ' + event.error);
    recognition.onend = () => {
      setListening(false);
      // 만약 아무 결과 없이 끝났을 경우에는 홈으로 복귀
      // (원하는 동작에 따라 setView('home') 호출 가능)
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setPartial(transcript);

      // 최종 결과만 처리
      if (event.results[event.results.length - 1].isFinal) {
        if (onResult) onResult(transcript.trim());
        setView('chat');
      }
    };

    recognitionRef.current = recognition;
    // 안전하게 100ms 지연 후 시작(빠른 마운트/언마운트시 오류 방지)
    const startTimer = setTimeout(() => {
      recognition.start();
    }, 100);

    // unmount 시 recognition 정리 (stop, abort 모두 사용)
    return () => {
      clearTimeout(startTimer);
      if (recognition) {
        try { recognition.abort(); } catch (e) {}
        try { recognition.stop(); } catch (e) {}
      }
      recognitionRef.current = null;
    };
  }, [setView, onResult]);

  return (
    <div className="app-container">
      <div className="listening-screen">
        <p className="listening-text">듣고 있어요...</p>
        <div className="mic-pulse">🎤</div>



        {/* 헤더 추가 - Chat.js와 동일한 구조 */}
      <header className="weather-header">
        {/* 왼쪽 뒤로가기 버튼 */}
        <button className="header-back-btn" onClick={() => setView('home')} aria-label="뒤로가기">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
            alt="뒤로가기"
            className="back-icon"
          />
        </button>
        
        {/* 중앙과 오른쪽은 빈 공간으로 유지 */}
        <div className="header-spacer"></div>
        <div className="header-icon-placeholder"></div>
      </header>

      {/* 배경 비디오 추가 - VoiceInput 전용 클래스 사용 */}
      <div className="background-media">
        <video
          className="voice-magic-orb"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          {/* Cloudinary 주소로 영상 불러옴 (브라우저 대응 + 용량 문제 해결용) */}
          <source
            src="https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748854350/LumeeMagicOrb_Safari_rdmthi.mov"
            type='video/mp4; codecs="hvc1"'
          />
          <source
            src="https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748852283/LumeeMagicOrb_WEBM_tfqoa4.webm"
            type="video/webm"
          />
        </video>

        <p className="listening-text">
          {error ? error : (listening ? '듣고 있어요...' : '마이크를 준비 중입니다...')}
        </p>
        <div className="mic-pulse">🎤</div>
        <div style={{ fontSize: 18, color: "#fff", marginTop: 16 }}>{partial}</div>
      </div>
        <button className="back-button" onClick={() => setView('home')}>
          홈으로
        </button> */}
    </div>
  );
};

export default VoiceInput;