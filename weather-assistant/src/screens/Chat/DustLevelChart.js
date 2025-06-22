import React, { useState, useEffect, useRef } from 'react';

/**
 * 날짜 문자열을 Air Quality 제목으로 포맷팅
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷된 제목
 */
const formatTitle = (dateString) => {
  if (!dateString) {
    return "Air Quality";
  }
  
  const dateStr = String(dateString);
  
  if (dateStr.match(/^[A-Za-z]+ \d{1,2}, \d{4}$/)) {
    return `${dateStr} Air Quality`;
  }
  
  return "Air Quality";
};

/**
 * PM2.5 수치에 따른 레벨 라벨 반환
 * @param {number} value - PM2.5 수치
 * @returns {string} 레벨 라벨
 */
const getLevelLabel = (value) => {
  if (value <= 15) return 'Good';
  if (value <= 35) return 'Moderate';
  if (value <= 75) return 'Poor';
  return 'Very Poor';
};

/**
 * 현재 위치에 따른 실시간 그라데이션 색상 계산 (CSS 그라데이션과 정확히 일치)
 * @param {number} position - 현재 위치 (0-100)
 * @returns {Object} 색상 정보 객체
 */
const getRealTimeBackgroundColor = (position) => {
  const normalizedPos = position / 100;
  
  // CSS 그라데이션과 정확히 동일한 브레이크포인트와 색상
  const gradientStops = [
    { pos: 0, color: { r: 126, g: 214, b: 168 } },      // #7ED6A8 (0%)
    { pos: 0.19, color: { r: 255, g: 229, b: 127 } },   // #FFE57F (19%)
    { pos: 0.44, color: { r: 255, g: 160, b: 89 } },    // #FFA059 (44%)
    { pos: 1, color: { r: 243, g: 108, b: 108 } }       // #F36C6C (100%)
  ];
  
  // 현재 위치에 해당하는 두 색상 구간 찾기
  for (let i = 0; i < gradientStops.length - 1; i++) {
    const currentStop = gradientStops[i];
    const nextStop = gradientStops[i + 1];
    
    if (normalizedPos >= currentStop.pos && normalizedPos <= nextStop.pos) {
      // 두 색상 사이의 보간 비율 계산
      const segmentLength = nextStop.pos - currentStop.pos;
      const positionInSegment = normalizedPos - currentStop.pos;
      const ratio = segmentLength === 0 ? 0 : positionInSegment / segmentLength;
      
      // RGB 값들을 선형 보간
      const r = Math.round(currentStop.color.r + (nextStop.color.r - currentStop.color.r) * ratio);
      const g = Math.round(currentStop.color.g + (nextStop.color.g - currentStop.color.g) * ratio);
      const b = Math.round(currentStop.color.b + (nextStop.color.b - currentStop.color.b) * ratio);
      
      return { r, g, b, css: `rgb(${r}, ${g}, ${b})` };
    }
  }
  
  // 범위를 벗어난 경우 마지막 색상
  const lastStop = gradientStops[gradientStops.length - 1];
  return { 
    r: lastStop.color.r, 
    g: lastStop.color.g, 
    b: lastStop.color.b, 
    css: `rgb(${lastStop.color.r}, ${lastStop.color.g}, ${lastStop.color.b})` 
  };
};

/**
 * 미세먼지 레벨 차트 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.value - PM2.5 수치 (기본값: 45)
 * @param {string} props.date - 날짜 문자열
 */
const DustLevelChart = ({ value = 45, date }) => {
  // 애니메이션 상태 관리
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0); // 명시적으로 0으로 시작
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const indicatorRef = useRef(null);
  
  const level = getLevelLabel(value);
  const targetPosition = Math.min((value / 100) * 100, 100);
  
  // 실시간 그라데이션 색상을 배지와 수치에도 적용
  const realTimeColor = getRealTimeBackgroundColor(targetPosition);

  // 숫자 카운트업 애니메이션
  useEffect(() => {
    if (!shouldAnimate) return;

    let startTime = null;
    const duration = 2000; // 인디케이터와 맞춤
    const delay = 400; // 인디케이터와 동일한 지연시간

    const animateNumber = (timestamp) => {
      if (!startTime) {
        startTime = timestamp + delay;
        requestAnimationFrame(animateNumber);
        return;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.max(0, Math.min(elapsed / duration, 1)); // progress를 0-1로 확실히 제한
      
      // 간단한 easeOutCubic으로 변경
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // 항상 양수가 되도록 보장
      const currentValue = Math.max(0, easedProgress * value);
      setAnimatedValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setAnimatedValue(value); // 정확한 최종값으로 설정
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animateNumber);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [shouldAnimate, value]);

  // 인디케이터 이동 애니메이션
  useEffect(() => {
    if (!shouldAnimate) return;

    let startTime = null;
    const totalDuration = 2000; // 총 애니메이션 시간
    const delay = 400; // 시작 지연시간

    // 애니메이션 시작 전에 미리 인디케이터를 올바른 상태로 설정
    const presetIndicator = () => {
      if (indicatorRef.current) {
        const startColorInfo = getRealTimeBackgroundColor(0); // 0%에서 시작
        indicatorRef.current.style.backgroundColor = startColorInfo.css;
        indicatorRef.current.style.left = '0%'; // 0%에서 시작
        indicatorRef.current.style.opacity = '0';
        indicatorRef.current.style.transform = 'translate(-50%, -50%) scale(0)';
      }
    };

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp + delay;
        setIndicatorVisible(true); // 인디케이터 표시
        
        // 다음 프레임에서 초기 설정 적용 (DOM이 준비된 후)
        requestAnimationFrame(() => {
          presetIndicator();
          requestAnimationFrame(animate);
        });
        return;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      // 빠른 등장 효과 (처음 10%에서 완료)
      let opacity, scale;
      if (progress < 0.1) { // 15% → 10%로 단축
        const appearProgress = progress / 0.1;
        const easeOutBack = 1 - Math.pow(1 - appearProgress, 3); // 더 빠른 이징
        opacity = easeOutBack;
        scale = 0.2 + (easeOutBack * 0.8); // 0.2에서 1.0으로 (더 큰 변화)
      } else {
        opacity = 1;
        scale = 1;
      }
      
      // easeOutCubic으로 빠른 측정 과정
      const easedProgress = 1 - Math.pow(1 - progress, 2.5); // 더 빠른 이징
      
      // 위치 계산: 0%에서 목표 위치까지 정확하게
      const currentPos = easedProgress * targetPosition; // 0%에서 실제 퍼센트까지
      
      // 실시간 색상 계산
      const colorInfo = getRealTimeBackgroundColor(currentPos);
      
      // 인디케이터 요소에 실시간 적용
      if (indicatorRef.current) {
        // 위치 제한: 테두리가 잘리지 않도록 최소/최대 범위 설정
        const indicatorRadius = 13; // 인디케이터 반지름 (26px / 2)
        const containerWidth = indicatorRef.current.parentElement?.offsetWidth || 300; // 컨테이너 너비
        const minPosition = (indicatorRadius / containerWidth) * 100; // 최소 퍼센트
        const maxPosition = 100 - (indicatorRadius / containerWidth) * 100; // 최대 퍼센트
        const clampedPosition = Math.max(minPosition, Math.min(currentPos, maxPosition));
        
        indicatorRef.current.style.backgroundColor = colorInfo.css;
        indicatorRef.current.style.left = `${clampedPosition}%`;
        indicatorRef.current.style.opacity = opacity;
        indicatorRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
        indicatorRef.current.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'; // 기본 그림자 추가
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 애니메이션 완료 후 펄스 효과 시작
        if (indicatorRef.current) {
          const cleanDate = date?.replace(/[^a-zA-Z0-9]/g, '') || 'default';
          indicatorRef.current.classList.add(`dust-indicator-${value}-${cleanDate}`);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [shouldAnimate, targetPosition, value, date]);

  // 컴포넌트 마운트 시 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 300); // 약간의 지연 후 시작
    
    return () => clearTimeout(timer);
  }, []);

  // 컴포넌트 언마운트 시 애니메이션 정리
  useEffect(() => {
    const currentRef = indicatorRef.current; // 현재 ref 값을 변수에 저장
    return () => {
      if (currentRef) {
        currentRef.style.animation = 'none';
      }
    };
  }, []); // 빈 의존성 배열로 마운트/언마운트 시에만 실행

  // 시작 위치의 색상 (0% 위치 - 항상 Good)
  const startColor = getRealTimeBackgroundColor(0); // 0% 위치의 색상
  const finalColor = getRealTimeBackgroundColor(targetPosition);

  const styles = {
    dustAirBox: {
      background: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '16px 16px 16px 16px',
      color: 'white',
      width: '100%',
      maxWidth: '320px',
      marginTop: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '0.5px solid rgba(255, 255, 255, 0.3)',
    },
    
    progressContainer: {
      marginTop: '10px',
      marginBottom: '8px',
      position: 'relative',
      width: '100%',
      height: '18px',
      background: 'linear-gradient(90deg, #7ED6A8 0%, #FFE57F 19%, #FFA059 44%, #F36C6C 100%)',
      borderRadius: '12px',
      overflow: 'visible', // 테두리가 보이도록 다시 visible로 변경
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  };

  const cleanDate = date?.replace(/[^a-zA-Z0-9]/g, '') || 'default';

  return (
    <div>
      <style>{`
        .dust-indicator-${value}-${cleanDate} {
          animation: dustIndicatorPulse-${value}-${cleanDate} 3s ease-in-out infinite 1.8s;
        }
        
        @keyframes dustIndicatorPulse-${value}-${cleanDate} {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 ${finalColor.css}40;
          }
          50% {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 8px ${finalColor.css}00;
          }
        }
        
        @keyframes dustBadgeReveal {
          0% {
            opacity: 0;
            transform: scale(0.3) rotateZ(-10deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) rotateZ(5deg);
          }
          70% {
            transform: scale(0.95) rotateZ(-2deg);
          }
          85% {
            transform: scale(1.02) rotateZ(1deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateZ(0deg);
          }
        }
        
        .real-time-indicator {
          /* 애니메이션은 JavaScript에서 동적으로 적용 */
        }
        
        .real-time-indicator.animating {
          opacity: 1 !important;
          transform: translate(-50%, -50%) scale(1) !important;
        }
        
        .progress-container {
          position: relative;
          overflow: hidden;
        }
      `}</style>
      
      <div style={styles.dustAirBox}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '400', color: '#ffffff', margin: 0, textShadow: '0 0 10px rgba(255, 255, 255, 0.45)'}}>
                {formatTitle(date)}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '400', margin: 0 }}>
                  PM2.5 Standard
                </p>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '20px',
                  fontSize: '8px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  letterSpacing: '0.5px',
                  backgroundColor: realTimeColor.css, // 인디케이터와 같은 색상
                  color: 'black',
                  opacity: 0, // 항상 숨김으로 시작
                  transform: 'scale(0.3) rotateZ(-10deg)', // 항상 초기 변형 상태
                  animation: shouldAnimate ? 'dustBadgeReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 2.5s forwards' : 'none',
                }}>
                  {level}
                </span>
              </div>
            </div>
            <div>
              <p style={{
                fontSize: '26px',
                fontWeight: '700',
                color: realTimeColor.css, // 인디케이터와 같은 색상
                lineHeight: '1',
                textAlign: 'right',
                margin: 0,
              }}>
                {Math.max(0, Math.ceil(animatedValue))}
              </p>
              <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: '400', textAlign: 'center', margin: 0 }}>
                µg/m³
              </p>
            </div>
          </div>
        </div>

        <div style={styles.progressContainer} className="progress-container">
          {indicatorVisible && (
            <div 
              ref={indicatorRef}
              className="real-time-indicator"
              style={{
                position: 'absolute',
                top: '50%',
                left: '0%', // 정확히 0%에서 시작
                transform: 'translate(-50%, -50%) scale(0)',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: startColor.css, // 시작 색상으로 강제 설정
                border: '2px solid #ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)', // 기본 그림자 추가
                zIndex: 10,
                opacity: 0,
                transition: 'none',
              }} 
            />
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '9px',
          color: 'rgba(255, 255, 255, 0.85)',
          padding: '0 0px',
        }}>
          <p>Good</p>
          <p>Moderate</p>
          <p>Poor</p>
          <p>Very Poor</p>
        </div>
      </div>
    </div>
  );
};

export default DustLevelChart;