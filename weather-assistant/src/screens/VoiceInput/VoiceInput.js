import React, { useEffect, useRef, useState } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ setView, previousView, onResult }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [partial, setPartial] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const recognitionRef = useRef(null);
  const partialTextRef = useRef(null);
  const lastTextLengthRef = useRef(0);
  
  // 결과 전송 타이머를 추적하기 위한 ref 추가
  const resultTimerRef = useRef(null);
  const isComponentMountedRef = useRef(true);
  
  // useRef로 최신 값들을 참조
  const onResultRef = useRef(onResult);
  const retryCountRef = useRef(retryCount);

  const MAX_RETRIES = 2;

  // ===== 마법 구슬 관련 추가 =====
  const orbOptions = [
    {
      id: 'default',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748854350/LumeeMagicOrb_Safari_rdmthi.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748852283/LumeeMagicOrb_WEBM_tfqoa4.webm"
      }
    },
    {
      id: 'dust',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Safari_tkyral.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Chrome_filwol.webm"
      }
    },
    {
      id: 'rain',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Safari_tkyral.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749984445/rainLumee_WEBM_xblf7o.webm"
      }
    }
  ];

  // 현재 선택된 구슬 상태 (로컬 스토리지에서 불러오기)
  const [selectedOrb, setSelectedOrb] = useState(() => {
    try {
      const savedOrb = localStorage.getItem('lumeeSelectedOrb');
      return savedOrb || 'default';
    } catch (error) {
      console.error('구슬 설정 로드 실패:', error);
      return 'default';
    }
  });

  // 현재 선택된 구슬 정보 가져오기
  const getCurrentOrb = () => {
    return orbOptions.find(orb => orb.id === selectedOrb) || orbOptions[0];
  };

  // 로컬 스토리지 변경 감지 (다른 창에서 구슬 선택이 바뀔 때)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'lumeeSelectedOrb' && e.newValue) {
        setSelectedOrb(e.newValue);
        console.log('🎵 구슬 선택 변경됨:', e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 최신 값들을 ref에 저장
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  // 개선된 텍스트 애니메이션 함수 - 새로 추가된 글자만 애니메이션
  const applyIncrementalAnimation = (newText) => {
    if (!partialTextRef.current) return;
    
    const lastLength = lastTextLengthRef.current;
    const currentLength = newText.length;
    
    // 텍스트가 줄어들었다면 (음성인식이 수정된 경우) 전체 다시 렌더링
    if (currentLength < lastLength) {
      partialTextRef.current.innerHTML = '';
      lastTextLengthRef.current = 0;
      
      // 짧은 지연 후 전체 텍스트를 다시 애니메이션
      setTimeout(() => {
        applyFullAnimation(newText);
      }, 50);
      return;
    }
    
    // 새로 추가된 글자만 애니메이션 적용
    if (currentLength > lastLength) {
      const newChars = newText.slice(lastLength);
      
      newChars.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = char === ' ' ? 'char space' : 'char';
        span.style.animationDelay = `${index * 0.05}s`;
        
        if (char === ' ') {
          span.innerHTML = '&nbsp;';
        } else {
          span.textContent = char;
        }
        
        partialTextRef.current.appendChild(span);
      });
      
      lastTextLengthRef.current = currentLength;
    }
  };

  // 전체 텍스트 애니메이션 (처음이나 텍스트가 수정될 때)
  const applyFullAnimation = (text) => {
    if (!partialTextRef.current || !text) return;
    
    const chars = text.split('').map((char, index) => {
      if (char === ' ') {
        return `<span class="char space" style="animation-delay: ${index * 0.03}s">&nbsp;</span>`;
      }
      return `<span class="char" style="animation-delay: ${index * 0.03}s">${char}</span>`;
    }).join('');
    
    partialTextRef.current.innerHTML = chars;
    lastTextLengthRef.current = text.length;
  };

  // 텍스트 업데이트
  useEffect(() => {
    if (partial) {
      applyIncrementalAnimation(partial);
    } else {
      if (partialTextRef.current) {
        partialTextRef.current.innerHTML = '';
      }
      lastTextLengthRef.current = 0;
    }
  }, [partial]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🎯 결과 전송 함수 - 안전한 전송 보장
  const sendResult = (transcript) => {
    console.log('🎤 📤 결과 전송 시도:', transcript);
    
    // 컴포넌트가 언마운트되었거나 onResult가 없으면 전송하지 않음
    if (!isComponentMountedRef.current || !onResultRef.current) {
      console.log('🎤 ❌ 전송 취소: 컴포넌트 언마운트됨 또는 onResult 없음');
      return;
    }
    
    try {
      onResultRef.current(transcript);
      console.log('🎤 ✅ 결과 전송 완료:', transcript);
    } catch (err) {
      console.error('🎤 ❌ 결과 전송 중 오류:', err);
    }
  };

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

    let partialUpdateTimer = null;

    recognition.onstart = () => {
      console.log('🎤 음성인식 시작됨');
      setListening(true);
      setError('');
      setPartial('');
      lastTextLengthRef.current = 0;
    };

    recognition.onerror = (event) => {
      console.error('🎤 음성인식 오류:', event.error);
      
      const currentRetryCount = retryCountRef.current;
      
      // 결과 전송 타이머가 있다면 취소
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
        resultTimerRef.current = null;
        console.log('🎤 결과 전송 타이머 취소됨 (오류로 인해)');
      }
      
      // 상태 초기화
      setPartial('');
      lastTextLengthRef.current = 0;
      setListening(false);
      
      // 사용자가 중단한 경우는 조용히 종료
      if (event.error === 'aborted') {
        console.log('🎤 사용자가 음성인식을 중단함');
        return;
      }
      
      let friendlyMessage;
      let shouldRetry = false;
      
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
          friendlyMessage = 'Something went wrong';
          shouldRetry = false;
      }
      
      setError(friendlyMessage);
      
      // 🎯 재시도 로직 - no-speech일 때만
      if (shouldRetry && event.error === 'no-speech') {
        setTimeout(() => {
          // 컴포넌트가 여전히 마운트되어 있을 때만 재시도
          if (isComponentMountedRef.current) {
            console.log(`🎤 재시도 ${currentRetryCount + 1}/${MAX_RETRIES}`);
            setRetryCount(prev => prev + 1);
            setError('');
            try {
              recognitionRef.current?.start();
            } catch (err) {
              console.error('🎤 재시도 실패:', err);
              setError('Try again');
            }
          }
        }, 2000);
      }
    };

    recognition.onend = () => {
      console.log('🎤 음성인식 종료됨');
      
      // onend에서는 단순히 listening만 false로 설정
      // 결과가 있다면 이미 onresult에서 처리됨
      if (isComponentMountedRef.current) {
        setListening(false);
      }
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

      console.log('🎤 음성인식 결과:', { transcript: `"${transcript}"`, isFinal });

      // 중간 결과 디바운싱
      if (!isFinal) {
        if (partialUpdateTimer) {
          clearTimeout(partialUpdateTimer);
        }
        
        partialUpdateTimer = setTimeout(() => {
          if (isComponentMountedRef.current) {
            setPartial(transcript);
          }
        }, 100);
      } else {
        // 최종 결과 즉시 처리
        if (partialUpdateTimer) {
          clearTimeout(partialUpdateTimer);
        }
        
        if (isComponentMountedRef.current) {
          setPartial(transcript);
        }
      }

      // 최종 결과 처리 - 개선된 로직
      if (isFinal && transcript.trim()) {
        console.log('🎤 ✅ 최종 결과 감지:', transcript.trim());
        
        // 즉시 성공 처리
        setError('');
        setRetryCount(0);
        
        // 이전 타이머가 있다면 취소
        if (resultTimerRef.current) {
          clearTimeout(resultTimerRef.current);
          resultTimerRef.current = null;
        }
        
        // 1초 대기 후 결과 전송 (2초에서 1초로 단축)
        resultTimerRef.current = setTimeout(() => {
          resultTimerRef.current = null;
          sendResult(transcript.trim());
        }, 1000);
      }
    };

    recognitionRef.current = recognition;

    const startTimer = setTimeout(() => {
      if (isComponentMountedRef.current) {
        try {
          recognition.start();
          console.log('🎤 음성인식 시작 시도');
        } catch (err) {
          console.error('🎤 음성인식 시작 실패:', err);
          setError('Unable to start speech recognition.');
        }
      }
    }, 200);

    return () => {
      clearTimeout(startTimer);
      
      // 결과 전송 타이머 정리
      if (resultTimerRef.current) {
        clearTimeout(resultTimerRef.current);
        resultTimerRef.current = null;
        console.log('🎤 결과 전송 타이머 정리됨');
      }
      
      if (partialUpdateTimer) {
        clearTimeout(partialUpdateTimer);
      }
      
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

  const handleBackToHome = () => {
    console.log('🎤 뒤로가기 - 음성인식 중단');
    
    // 결과 전송 타이머 취소
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
      console.log('🎤 결과 전송 타이머 취소됨 (뒤로가기)');
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.log('🎤 음성인식 중단 중 오류 (무시됨):', e);
      }
    }
    
    // 이전 화면으로 돌아가기 (기본값은 'home')
    setView(previousView || 'home');
  };

  const currentOrb = getCurrentOrb();

  return (
    <div className="app-container">
      <div className="listening-screen">
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

        <div className="background-media">
          <video
            className="voice-magic-orb"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            key={selectedOrb} // 키를 변경하여 비디오 리로드 강제
          >
            <source
              src={currentOrb.videoSrc.mp4}
              type='video/mp4; codecs="hvc1"'
            />
            <source
              src={currentOrb.videoSrc.webm}
              type="video/webm"
            />
          </video>
        </div>

        {(listening || error) && (
          <p className={error ? "error-text" : "listening-text"}>
            {error ? error : 'Listening'}
          </p>
        )}

        {partial && (
          <div 
            className="voice-partial-text" 
            ref={partialTextRef}
          >
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;