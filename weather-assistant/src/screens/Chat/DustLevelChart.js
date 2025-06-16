import React from 'react';
import './DustLevelChart.css';

const getLevelLabel = (value) => {
  if (value <= 15) return 'Good';
  if (value <= 35) return 'Moderate';
  if (value <= 75) return 'Poor';
  return 'Very Poor';
};

const getBadgeColor = (value) => {
  // 바의 그라데이션에 따른 색상 계산
  if (value <= 15) return '#7ED6A8'; // Good - 녹색
  if (value <= 35) return '#FFE57F'; // Moderate - 노란색
  if (value <= 75) return '#FFA059'; // Poor - 주황색
  return '#F36C6C'; // Very Poor - 빨간색
};

const DustLevelChart = ({ value }) => {
  const level = getLevelLabel(value);
  const badgeColor = getBadgeColor(value);
  const position = Math.min((value / 100) * 100, 100); // 최대 100 기준

  return (
    <div className="dust-air-box">
      <div className="dust-air-header">
        <div className="title-row">
          <div className="title-left">
            <p className="title">Today's Air Quality</p>
            <div className="subtitle-left">
              <p className="subtitle">PM2.5 Standard</p>
              <span 
                className="badge" 
                style={{ backgroundColor: badgeColor, color: 'black' }}
              >
                {level}
              </span>
            </div>
          </div>
          <div className="title-right">
            <p className="value-large" style={{ color: badgeColor}}>
                {Math.ceil(value)}
            </p>
            <p className="unit-text">µg/m³</p>
          </div>
        </div>
      </div>

      <div className="dust-graph-container">
        <div className="circle-indicator" style={{ left: `${position}%` }} />
      </div>

      <div className="dust-labels">
        <p>Good</p>
        <p>Moderate</p>
        <p>Poor</p>
        <p>Very Poor</p>
      </div>
    </div>
  );
};

export default DustLevelChart;