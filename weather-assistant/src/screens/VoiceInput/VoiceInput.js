import React, { useEffect, useRef, useState } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ setView, onResult }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [partial, setPartial] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const recognitionRef = useRef(null);
  
  // useRef로 최신 값들을 참조
  const onResultRef = useRef(onResult);
  const retryCountRef = useRef(retryCount);

  const MAX_RETRIES = 2;

  // 최신 값들을 ref에 저장
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);

  useEffect(() => {
    let recognition;

    // 브라우저 지원 체크
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log('🎤 음성인식 시작됨');
      setListening(true);
      setError('');
    };

    recognition.onerror = (event) => {
      console.error('🎤 음성인식 오류:', event.error);
      
      let friendlyMessage;
      let shouldRetry = false;
      
      // ref를 통해 최신 retryCount 값 사용
      const currentRetryCount = retryCountRef.current;
      
      switch (event.error) {
        case 'no-speech':
          if (currentRetryCount < MAX_RETRIES) {
            friendlyMessage = 'Speak again';
            shouldRetry = true;
          } else {
            friendlyMessage = 'Can\'t hear you. Check mic?';
            shouldRetry = false;
          }
          break;
        case 'aborted':
          friendlyMessage = 'Voice paused';
          shouldRetry = false;
          break;
        case 'audio-capture':
          friendlyMessage = 'Check mic please';
          shouldRetry = false;
          break;
        case 'not-allowed':
          friendlyMessage = 'Need mic access';
          shouldRetry = false;
          break;
        case 'network':
          friendlyMessage = 'Connection issue';
          shouldRetry = false;
          break;
        default:
          if (currentRetryCount < MAX_RETRIES) {
            friendlyMessage = 'Speak again';
            shouldRetry = true;
          } else {
            friendlyMessage = 'Something\'s wrong. Try later?';
            shouldRetry = false;
          }
      }
      
      setError(friendlyMessage);
      setListening(false);
      
      // 자동 재시도 로직
      if (shouldRetry) {
        setTimeout(() => {
          console.log(`🎤 재시도 ${currentRetryCount + 1}/${MAX_RETRIES}`);
          setRetryCount(prev => prev + 1);
          setError(''); // 에러 메시지 지우기
          try {
            recognitionRef.current?.start();
          } catch (err) {
            console.error('🎤 재시도 실패:', err);
            setError('Speak again');
          }
        }, 2000);
      }
    };

    recognition.onend = () => {
      console.log('🎤 음성인식 종료됨');
      setListening(false);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      console.log('🎤 음성인식 결과:', { transcript, isFinal });
      setPartial(transcript);

      // 최종 결과만 처리
      if (isFinal && transcript.trim()) {
        console.log('🎤 최종 음성인식 결과:', transcript.trim());
        
        // 성공 시 재시도 카운터 리셋
        setRetryCount(0);
        
        // 1초 대기 후 onResult 호출
        setTimeout(() => {
          // ref를 통해 최신 onResult 함수 호출
          if (onResultRef.current) {
            onResultRef.current(transcript.trim());
          }
        }, 1000);
      }
    };

    recognitionRef.current = recognition;

    // 안전하게 200ms 지연 후 시작
    const startTimer = setTimeout(() => {
      try {
        recognition.start();
        console.log('🎤 음성인식 시작 시도');
      } catch (err) {
        console.error('🎤 음성인식 시작 실패:', err);
        setError('Unable to start speech recognition.');
      }
    }, 200);

    // cleanup 함수
    return () => {
      clearTimeout(startTimer);
      if (recognition) {
        try {
          recognition.abort();
          recognition.stop();
        } catch (e) {
          console.log('🎤 음성인식 정리 중 오류 (무시됨):', e);
        }
      }
      recognitionRef.current = null;
    };
  }, [setView]); // eslint-disable-line react-hooks/exhaustive-deps

  // 수동으로 음성인식 중단하고 홈으로 돌아가기
  const handleBackToHome = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.log('🎤 음성인식 중단 중 오류 (무시됨):', e);
      }
    }
    setView('home');
  };

  return (
    <div className="app-container">
      <div className="listening-screen">
        {/* 헤더 - 기존 CSS 그대로 사용 */}
        <header className="weather-header">
          <button className="header-back-btn" onClick={handleBackToHome} aria-label="Go back">
            <img 
              src={`${process.env.PUBLIC_URL}/assets/icons/arrow-left.svg`}
              alt="Go back"
              className="back-icon"
            />
          </button>
          <div className="header-spacer"></div>
          <div className="header-icon-placeholder"></div>
        </header>

        {/* 배경 비디오 - 기존 CSS 그대로 사용 */}
        <div className="background-media">
          <video
            className="voice-magic-orb"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source
              src="https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748854350/LumeeMagicOrb_Safari_rdmthi.mov"
              type='video/mp4; codecs="hvc1"'
            />
            <source
              src="https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748852283/LumeeMagicOrb_WEBM_tfqoa4.webm"
              type="video/webm"
            />
          </video>
        </div>

        {/* Listening 상태 텍스트 - 듣는 중이거나 에러일 때만 표시 */}
        {(listening || error) && (
          <p className={error ? "error-text" : "listening-text"}>
            {error ? error : 'Listening'}
          </p>
        )}

        {/* 실시간 음성 인식 결과 */}
        {partial && (
          <div className="voice-partial-text">{partial}</div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;