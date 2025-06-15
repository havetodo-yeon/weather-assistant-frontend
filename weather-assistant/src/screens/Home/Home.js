import React, { useState, useEffect } from 'react';
import './Home.css';
import { WeatherDescriptionWithIcon } from './weatherIconUtils';

const Home = ({ 
  time, 
  location, 
  input, 
  setInput, 
  handleSend, 
  sendFromFAQ, 
  handleVoiceInput,
  weather
}) => {

  // ===== 1. 날짜 포맷팅 =====
  const today = new Date();
  const formattedDate = formatDate(today);

  // ===== 2. FAQ 관련 상태 및 데이터 =====
  const defaultFaqItems = [
    "What's the weather like today?",
    "How's the air quality today?", 
    "Do I need an umbrella today?",
    "What should I wear today?"
  ];

  const [faqItems, setFaqItems] = useState(() => {
    try {
      const savedFaqItems = localStorage.getItem('lumeeFaqItems');
      return savedFaqItems ? JSON.parse(savedFaqItems) : defaultFaqItems;
    } catch (error) {
      console.error('FAQ 데이터 로드 실패:', error);
      return defaultFaqItems;
    }
  });
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  // ===== 3. 사이드 메뉴 관련 상태 =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ===== 4. 마법 구슬 관련 데이터 및 상태 =====
  const orbOptions = [
    {
      id: 'default',
      name: 'Default',
      description: 'Original magic orb',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748854350/LumeeMagicOrb_Safari_rdmthi.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1748852283/LumeeMagicOrb_WEBM_tfqoa4.webm"
      }
    },
    {
      id: 'dust',
      name: 'Fine Dust',
      description: 'Fine dust-reactive magic orb',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Safari_tkyral.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Chrome_filwol.webm"
      }
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Rain-reactive magic orb',
      videoSrc: {
        mp4: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749988390/finedustLumee_Safari_tkyral.mov",
        webm: "https://res.cloudinary.com/dpuw0gcaf/video/upload/v1749984445/rainLumee_WEBM_xblf7o.webm"
      }
    }
  ];

  const [selectedOrb, setSelectedOrb] = useState(() => {
    try {
      const savedOrb = localStorage.getItem('lumeeSelectedOrb');
      return savedOrb || 'default';
    } catch (error) {
      console.error('구슬 설정 로드 실패:', error);
      return 'default';
    }
  });

  // ===== 5. useEffect - 로컬 스토리지 저장 =====
  useEffect(() => {
    try {
      localStorage.setItem('lumeeFaqItems', JSON.stringify(faqItems));
    } catch (error) {
      console.error('FAQ 데이터 저장 실패:', error);
    }
  }, [faqItems]);

  useEffect(() => {
    try {
      localStorage.setItem('lumeeSelectedOrb', selectedOrb);
    } catch (error) {
      console.error('구슬 설정 저장 실패:', error);
    }
  }, [selectedOrb]);

  // ===== 6. 사이드 메뉴 관련 함수 =====
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ===== 7. 마법 구슬 관련 함수 =====
  const selectOrb = (orbId) => {
    setSelectedOrb(orbId);
    closeMenu();
  };

  const getCurrentOrb = () => {
    return orbOptions.find(orb => orb.id === selectedOrb) || orbOptions[0];
  };

  // ===== 8. FAQ 편집 관련 함수 =====
  const startEditing = (index) => {
    setEditingIndex(index);
    setEditText(faqItems[index]);
  };

  const saveEdit = () => {
    if (editText.trim() === '') {
      alert('FAQ 내용을 입력해주세요!');
      return;
    }
    
    const newFaqItems = [...faqItems];
    newFaqItems[editingIndex] = editText.trim();
    setFaqItems(newFaqItems);
    setEditingIndex(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  // ===== 9. 현재 선택된 구슬 정보 =====
  const currentOrb = getCurrentOrb();

  // ===== 10. 렌더링 =====
  return (
    <div className="app-container">
      
      {/* ===== 사이드 메뉴 ===== */}
      {isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="side-menu" onClick={(e) => e.stopPropagation()}>
            
            {/* 메뉴 헤더 */}
            <div className="menu-header">
              <h3>
                Orb Selection 
                <span className="beta-badge">BETA</span>
              </h3>
              <button className="menu-close-btn" onClick={closeMenu}>
                <img 
                  src={`${process.env.PUBLIC_URL}/assets/icons/close.svg`}
                  alt="닫기"
                  className="close-icon"
                />
              </button>
            </div>
            
            {/* 구슬 옵션 목록 */}
            <div className="orb-options">
              {orbOptions.map((orb) => (
                <div 
                  key={orb.id} 
                  className={`orb-option ${selectedOrb === orb.id ? 'selected' : ''}`}
                  onClick={() => selectOrb(orb.id)}
                >
                  <div className="orb-preview">
                    <video
                      className="orb-preview-video"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={orb.videoSrc.mp4} type='video/mp4; codecs="hvc1"' />
                      <source src={orb.videoSrc.webm} type="video/webm" />
                    </video>
                  </div>
                  <div className="orb-info">
                    <h4>{orb.name}</h4>
                    <p>{orb.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 메뉴 푸터 */}
            <div className="menu-footer">
              <p className="beta-notice">This is a BETA feature. Auto-adaptive orbs & more styles coming soon!</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 상단 헤더 ===== */}
      <header className="weather-header">
        {/* 왼쪽 메뉴 버튼 */}
        <button className="header-menu-btn" onClick={toggleMenu} aria-label="메뉴">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/menu.svg`}
            alt="메뉴"
            className="menu-icon"
          />
        </button>
        
        {/* 중앙 위치 */}
        <button className="header-location" aria-label="위치 새로고침">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/location.svg`}
            alt="위치"
            className="header-location-icon"
          />
          <span className="header-location-name">{location}</span>
        </button>
        
        {/* 오른쪽 프로필 버튼 */}
        <button className="header-profile" aria-label="프로필">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/minseo.png`}
            alt="기본 프로필"
            className="profile-icon"
          />
        </button>
      </header>
      
      {/* ===== 날씨 정보 섹션 ===== */}
      <div className="home-weather-info">
        <p className="date">{formattedDate}</p>
        <p className="temperature">
          {weather ? `${weather.temp}°` : `00°C`}
        </p>
        <p className="description">
          <WeatherDescriptionWithIcon weather={weather} />
        </p>
        <p className="sub-summary">
          {weather ? 
            `Feels like ${weather.feelsLike}° | H: ${weather.tempMax}° L: ${weather.tempMin}°` 
            : 'Loading...'
          }
        </p>
      </div>

      {/* ===== 마법 구슬 영상 ===== */}
      <div className="background-media">
        <video
          className="lumee-magic-orb"
          autoPlay
          loop
          muted
          playsInline
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
 
      {/* ===== 사용자 인사 섹션 ===== */}
      <div className="user-greeting-section">
        <div className="greeting">Hello, Minseo👋</div>
        <h1 className="main-question">What weather info do you need?</h1>
      </div>

      {/* ===== FAQ 버튼 섹션 ===== */}
      <div className="faq-section">
        <div className="FAQ-buttons">
          {faqItems.map((faqText, index) => (
            <div key={index} className="FAQ-card">
              {editingIndex === index ? (
                // 편집 모드
                <div className="FAQ-edit-mode">
                  <textarea
                    className="FAQ-edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <div className="FAQ-edit-buttons">
                    <button className="FAQ-save-btn" onClick={saveEdit}>
                      Save
                    </button>
                    <button className="FAQ-cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 모드
                <>
                  <button 
                    className="FAQ-button"
                    onClick={() => sendFromFAQ(faqText)}
                  >
                    <span className="FAQ-button-text">{faqText}</span>
                  </button>
                  <button 
                    className="FAQ-edit-btn"
                    onClick={() => startEditing(index)}
                    aria-label="FAQ 수정"
                  >
                    <img 
                      src={`${process.env.PUBLIC_URL}/assets/icons/edit.svg`}
                      alt="수정"
                      className="edit-icon"
                    />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== 하단 입력창 ===== */}
      <div className="footer-input">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask Lumee about the weather..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="mic-button" onClick={handleVoiceInput}>
            <img 
              src={`${process.env.PUBLIC_URL}/assets/icons/microphone.svg`}
              alt="음성입력"
            />
          </button>
        </div>
        <button className="send-button" onClick={handleSend}>
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/send.svg`}
            alt="전송"
          />
        </button>
      </div>
    </div>
  );
};

// ===== 날짜 포맷팅 유틸리티 함수 =====
function formatDate(date) {
  const options = { month: 'short', day: 'numeric', weekday: 'long' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);

  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const weekday = parts.find(p => p.type === 'weekday').value;

  return `${month} ${day}, ${weekday}`;
}

export default Home;