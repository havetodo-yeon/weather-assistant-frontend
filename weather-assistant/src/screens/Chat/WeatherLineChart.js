import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const WeatherLineChart = ({ graph, date }) => {
  const chartData = graph || [
    { hour: '06:00', temp: 18 },
    { hour: '09:00', temp: 22 },
    { hour: '12:00', temp: 28 },
    { hour: '15:00', temp: 31 },
    { hour: '18:00', temp: 26 },
    { hour: '21:00', temp: 21 }
  ];
  
  const temps = chartData.map(p => p.temp);
  const max = Math.max(...temps);
  const min = Math.min(...temps);

  const formatTitle = (dateString) => {
    if (dateString && dateString !== 'Today') {
      return `${dateString} Temperatures`;
    }
    
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `${formattedDate} Temperatures`;
  };

  const data = {
    labels: chartData.map(p => p.hour),
    datasets: [
      {
        label: '기온 (°C)',
        data: temps,
        fill: {
          target: 'origin',
          above: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.chartArea.bottom);
            gradient.addColorStop(0, 'rgba(151, 245, 253, 0.45)');
            gradient.addColorStop(0.3, 'rgba(168, 240, 255, 0.3)');
            gradient.addColorStop(0.6, 'rgba(194, 245, 255, 0.18)');
            gradient.addColorStop(1, 'rgba(224, 250, 255, 0.04)');
            return gradient;
          }
        },
        borderColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, ctx.chart.chartArea.right, 0);
          gradient.addColorStop(0, '#97F5FD');
          gradient.addColorStop(0.4, '#A8F0FF');
          gradient.addColorStop(0.8, '#C2F5FF');
          gradient.addColorStop(1, '#E0FAFF');
          return gradient;
        },
        borderWidth: 2,
        pointBackgroundColor: '#97F5FD',      
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 2,
        pointStyle: 'circle',
        pointHoverBackgroundColor: '#97F5FD',
        pointHoverBorderColor: '#FFFFFF',
        tension: 0.4,
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 25, 40, 0.96)', 
        titleColor: '#97F5FD',
        bodyColor: '#FFFFFF', 
        borderColor: 'rgba(151, 245, 253, 0.4)',
        borderWidth: 1,
        cornerRadius: 16,
        displayColors: false,
        padding: {
          top: 12,
          bottom: 12,
          left: 16,
          right: 16
        },
        caretSize: 6,
        caretPadding: 8,
        titleFont: {
          family: 'Poppins',
          size: 11,
          weight: '500',
          lineHeight: 1.2
        },
        bodyFont: {
          family: 'Poppins',
          size: 15,
          weight: '600',
          lineHeight: 1.3
        },
        titleMarginBottom: 6,
        animation: {
          duration: 120
        },
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const temp = context.parsed.y;
            let label = `${temp}°C`;
            
            if (temp === max) {
              label += '  •  High';
            } else if (temp === min) {
              label += '  •  Low';
            }
            
            return label;
          }
        }
      },
      legend: {
        display: false
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(151, 245, 253, 0.08)',
          lineWidth: 1,
          drawTicks: false,
          tickLength: 0
        },
        border: {
          display: false
        },
        ticks: {
          color: 'rgba(151, 245, 253, 0.75)',
          padding: 12,
          font: {
            family: 'Poppins',
            weight: 300,
            size: 10
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(151, 245, 253, 0.08)',
          lineWidth: 1,
          drawTicks: false,
          tickLength: 0
        },
        border: {
          display: false
        },
        ticks: {
          color: 'rgba(151, 245, 253, 0.75)',
          padding: 10,
          maxTicksLimit: 5,
          callback: function(value) {
            return `${value}°C`;
          },
          font: {
            family: 'Poppins',
            weight: 300,
            size: 10
          }
        }
      }
    },
    //  더욱 자연스러운 등장 애니메이션
    animation: {
      duration: 2800,  // 조금 더 여유있게
      easing: 'easeOutExpo',  // 더 자연스러운 감속 곡선
      delay: (context) => {
        // 더 부드러운 순차 등장을 위한 개선된 지연
        const baseDelay = context.dataIndex * 120;
        const smoothAcceleration = Math.pow(context.dataIndex, 1.08) * 12;
        return baseDelay + smoothAcceleration;
      }
    },
    animations: {
      // 선 그리기: 왼쪽에서 오른쪽으로 더 부드럽게
      x: {
        type: 'number',
        duration: 2000,
        easing: 'easeOutExpo',
        delay: (ctx) => {
          return ctx.dataIndex * 110; // 조금 더 여유있는 간격
        }
      },
      // Y축: 아래에서 위로 더 자연스럽게
      y: {
        duration: 1800,
        easing: 'easeOutQuart', // Back 대신 Quart로 더 부드럽게
        delay: (ctx) => {
          return 200 + (ctx.dataIndex * 100);
        },
        from: (ctx) => {
          return ctx.chart.scales.y.getPixelForValue(Math.min(...temps) - 1.5);
        }
      },
      // 배경 채우기: 더 부드럽고 자연스럽게
      backgroundColor: {
        duration: 1600,
        easing: 'easeOutQuart',
        delay: (ctx) => {
          return 500 + (ctx.dataIndex * 80); // 조금 더 늦게 시작
        }
      }
    },
    hover: {
      animationDuration: 80,  // 120 → 80으로 더 빠르게
      intersect: false
    }
  };

  return (
    <div style={{ 
      height: 180,
      filter: 'drop-shadow(0 0 12px rgba(151, 245, 253, 0.3)) drop-shadow(0 0 24px rgba(151, 245, 253, 0.12))'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 'auto',
        fontFamily: 'Poppins',
        fontSize: '13px',
        fontWeight: '300',
        color: '#97F5FD',
        letterSpacing: '0.3px',
        textShadow: '0 0 10px rgba(151, 245, 253, 0.45)'
      }}>
        {formatTitle(date)}
      </div>
      
      <div style={{ 
        height: 'calc(100% - 24px)',
        position: 'relative'
      }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default React.memo(WeatherLineChart);