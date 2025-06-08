// 아이콘 매핑 기준: https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
import { 
  // 맑은 날씨
  Sun,               // 맑음 (낮)
  MoonStar,          // 맑음 (밤)
  
  // 구름
  Cloud,             // 구름 (중간량)
  CloudSun,          // 구름 적음 (낮)
  CloudMoon,         // 구름 적음 (밤)
  Cloudy,            // 구름 많음
  
  // 강수 현상
  CloudSunRain,      // 비 (낮)
  CloudMoonRain,     // 비 (밤)
  CloudDrizzle,      // 이슬비
  Snowflake,         // 눈
  
  // 극한 날씨
  Zap,               // 뇌우
  Tornado,           // 토네이도
  
  // 대기 현상
  CloudFog,          // 안개
  Haze,              // 연무
  Wind,              // 돌풍/먼지/모래
  AlertTriangle      // 화산재 경고
} from 'lucide-react';

// OpenWeatherMap의 weatherId를 기반으로 한 아이콘 매핑
export const getWeatherIcon = (weatherId, timestamp = null) => {
  // 밤/낮 판단 (timestamp가 있으면 사용, 없으면 현재 시간 사용)
  const checkTime = timestamp ? new Date(timestamp) : new Date();
  const hour = checkTime.getHours();
  const isNight = hour < 6 || hour > 18;
  
  // 날씨 ID 범위별 아이콘 매핑
  if (weatherId >= 200 && weatherId < 300) {
    // 뇌우 (Thunderstorm)
    return Zap;

  } else if (weatherId >= 300 && weatherId < 400) {
    // 이슬비 (Drizzle)

    return CloudDrizzle;

  } else if (weatherId >= 500 && weatherId < 600) {
    // 비 (Rain) - 특별한 케이스 먼저 처리
    if (weatherId === 511) {
      // Freezing rain (어는 비)
      return Snowflake;
    } else if (isNight) {
      return CloudMoonRain; // 일반 비 (밤)
    } else {
      return CloudSunRain;  // 일반 비 (낮)
    }
 
  } else if (weatherId >= 600 && weatherId < 700) {
    // 눈 (Snow)
    return Snowflake;

  } else if (weatherId >= 700 && weatherId < 800) {
    // 대기 현상 (Atmosphere) - 각각 어울리는 아이콘으로 매핑
    switch (weatherId) {
      case 701: // Mist (안개) - mist
        return CloudFog;

      case 711: // Smoke (연기) - smoke
        return CloudFog;
        
      case 721: // Haze (연무) - haze
        return Haze;

      case 731: // Dust (먼지) - sand/dust whirls
        return Wind;

      case 741: // Fog (안개) - fog
        return CloudFog;

      case 751: // Sand (모래) - sand
        return Wind;

      case 761: // Dust (먼지) - dust
        return Wind;

      case 762: // Ash (화산재) - volcanic ash
        return AlertTriangle;

      case 771: // Squalls (돌풍) - squalls
        return Wind;

      case 781: // Tornado (토네이도) - tornado
        return Tornado;

      default:
        return Wind;
    }
  } else if (weatherId === 800) {
    // 맑음 (Clear sky)
    return isNight ? MoonStar : Sun;

  } else if (weatherId > 800) {
    // 구름 (Clouds) - 구름량과 밤/낮에 따라 세분화

    if (weatherId === 801) {
      // Few clouds (11-25%) - 해/달과 함께 있는 약간의 구름
      return isNight ? CloudMoon : CloudSun;

    } else if (weatherId === 802) {
      // Scattered clouds (25-50%) - 일반 구름

      return Cloud;
    } else {
      // Broken/Overcast clouds (51-100%) - 많은 구름
      return Cloudy;
    }
  }
  // 기본값
  return Cloud;
};

// 아이콘 컴포넌트 (description과 함께 렌더링)
export const WeatherDescriptionWithIcon = ({ weather, className = "" }) => {
  if (!weather) {
    return <p className={className}>Loading...</p>;
  }

  const IconComponent = getWeatherIcon(weather.weatherId, weather.timestamp);
  const description = weather.description 
    ? weather.description.charAt(0).toUpperCase() + weather.description.slice(1).toLowerCase()
    : 'Loading...';

  return (
    <div className={`weather-description-container ${className}`}>
      <IconComponent 
        size={20} 
        className="weather-icon"
        color="#FFFFFF"
      />
      <span className="weather-text">{description}</span>
    </div>
  );
};