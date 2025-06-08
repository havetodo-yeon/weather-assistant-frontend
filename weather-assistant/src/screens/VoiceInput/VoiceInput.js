// VoiceInput.js
import React, { useEffect, useRef, useState } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ setView, onVoiceResult }) => {
  const [status, setStatus] = useState('listening'); // listening | result | error
  const [result, setResult] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 브라우저 호환성 처리
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setResult('❌ 브라우저에서 음성인식이 지원되지 않습니다.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ko-KR'; // 한국어 인식
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setResult(transcript);
      setStatus('result');
      // 인식 완료 시 부모로 결과 전달 + chat 전환
      if (onVoiceResult) {
        setTimeout(() => {
          onVoiceResult(transcript);
          setView('chat');
        }, 700);
      }
    };
    recognition.onerror = (event) => {
      setStatus('error');
      setResult('❌ 음성인식 중 오류가 발생했습니다.');
    };
    recognition.onend = () => {
      if (status === 'listening') {
        setStatus('error');
        setResult('음성인식 중입니다...');
      }
    };

    // 시작!
    recognition.start();

    // 컴포넌트 언마운트시 인식 중지
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="app-container">
      <div className="listening-screen">
        <p className="listening-text">
          {status === 'listening' && '듣고 있어요...'}
          {status === 'result' && `“${result}”`}
          {status === 'error' && result}
        </p>
        <div className="mic-pulse">🎤</div>
        <button className="back-button" onClick={() => setView('home')}>
          홈으로
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;

