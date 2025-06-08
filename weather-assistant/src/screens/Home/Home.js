import React from 'react';
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
  const today = new Date();
  const formattedDate = formatDate(today); // ex. "May 24, Monday"



  return (
    <div className="app-container"> {/* ✅ 공통 정렬용 래퍼 추가 */}
      {/* 헤더 - 모든 버튼을 일관성 있게 */}
      <header className="weather-header">
        {/* 왼쪽 메뉴 버튼 */}
        <button className="header-menu-btn" aria-label="메뉴">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/menu.svg`}
            alt="메뉴"
            className="menu-icon"
          />
        </button>
        
        {/* 중앙 위치 - 클릭 가능하게 button으로 변경 */}
        <button className="header-location" aria-label="위치 새로고침">
          <img 
            src={`${process.env.PUBLIC_URL}/assets/icons/location.svg`}
            alt="위치"
            className="header-location-icon"
          />
          <span className="header-location-name">{location}</span>
          {/* <span className="header-location-name">{Seongnam-si, KR}</span> 테스트 */} 
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
      
      {/* 날씨 정보 출력 섹션 */}
      <div className="home-weather-info">

        {/* 날짜 출력 */}
        <p className="date">{formattedDate}</p>

        {/* 현재 온도 */}
        <p className="temperature">{weather
          ? `${weather.temp}°` : `00°C` } </p>
                    {/* ? `${weather.temp}°C` : `00°C` } </p> */}
          
        {/* 기상 정보 */}
        <p className="description">
          <WeatherDescriptionWithIcon weather={weather} />
        </p>

        {/* 체감온도/최고/최저 */}
        <p className="sub-summary">
          {weather ? 
          `Feels like ${weather.feelsLike}° | H: ${weather.tempMax}° L: ${weather.tempMin}°` 
          : 'Loading...'}
        </p>
      </div>

      <div className="background-media">

        <video
          className="lumee-magic-orb"
          autoPlay
          loop
          muted
          playsInline
          
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

 
      {/* User에게 인사 섹션 */}
      <div className="user-greeting-section">
        <div className="greeting">Hello, Minseo👋</div>
        <h1 className="main-question">What weather info do you need?</h1>
      </div>

      {/* FAQ 버튼 섹션 */}
      <div className="faq-section">
        <div className="FAQ-buttons">
          <div className="FAQ-card">
            <button 
              className="FAQ-button"
              onClick={() => sendFromFAQ("What's the weather like today?")}
            >
              What's the weather like today?
            </button>
            <button 
              className="FAQ-edit-btn"
              onClick={() => console.log("Edit FAQ 1")}
              aria-label="FAQ 수정"
            >
              <img 
                src={`${process.env.PUBLIC_URL}/assets/icons/edit.svg`}
                alt="수정"
                className="edit-icon"
              />
            </button>
          </div>

          <div className="FAQ-card">
            <button 
              className="FAQ-button"
              onClick={() => sendFromFAQ("How's the air quality today?")}
            >
              How's the air quality today?
            </button>
            <button 
              className="FAQ-edit-btn"
              onClick={() => console.log("Edit FAQ 2")}
              aria-label="FAQ 수정"
            >
              <img 
                src={`${process.env.PUBLIC_URL}/assets/icons/edit.svg`}
                alt="수정"
                className="edit-icon"
              />
            </button>
          </div>

          <div className="FAQ-card">
            <button 
              className="FAQ-button"
              onClick={() => sendFromFAQ("Do I need an umbrella today?")}
            >
              Do I need an umbrella today?
            </button>
            <button 
              className="FAQ-edit-btn"
              onClick={() => console.log("Edit FAQ 3")}
              aria-label="FAQ 수정"
            >
              <img 
                src={`${process.env.PUBLIC_URL}/assets/icons/edit.svg`}
                alt="수정"
                className="edit-icon"
              />
            </button>
          </div>

          <div className="FAQ-card">
            <button 
              className="FAQ-button"
              onClick={() => sendFromFAQ("What should I wear today?")}
            >
              What should I wear today?
            </button>
            <button 
              className="FAQ-edit-btn"
              onClick={() => console.log("Edit FAQ 4")}
              aria-label="FAQ 수정"
            >
              <img 
                src={`${process.env.PUBLIC_URL}/assets/icons/edit.svg`}
                alt="수정"
                className="edit-icon"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="footer-input">
        <div className="input-wrapper">  {/* 새로운 래퍼 추가 */}
          <input
            type="text"
            placeholder="Ask Lumee about the weather..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="mic-button" onClick={handleVoiceInput}>  {/* 마이크 버튼 추가 */}
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


function formatDate(date) {
  const options = { month: 'short', day: 'numeric', weekday: 'long' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);

  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const weekday = parts.find(p => p.type === 'weekday').value;

  return `${month} ${day}, ${weekday}`;  // month -> day -> weekday 순으로 포맷된 문자열 반환 ("May 24, Monday")
}

export default Home;
