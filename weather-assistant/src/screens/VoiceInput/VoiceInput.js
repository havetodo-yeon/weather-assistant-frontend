import React from 'react';
import './VoiceInput.css';

const VoiceInput = ({ setView }) => {
  return (
    <div className="app-container">
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
      </div>

        <p className="listening-text">Listening...</p>
        {/* <div className="mic-pulse">🎤</div>
        <button className="back-button" onClick={() => setView('home')}>
          홈으로
        </button> */}
    </div>
  );
};

export default VoiceInput;