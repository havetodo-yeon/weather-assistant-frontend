import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const WeatherLineChart = ({ graph }) => {
  const temps = graph.map(p => p.temp);
  const max = Math.max(...temps);
  const min = Math.min(...temps);

  const data = {
    labels: graph.map(p => p.hour),
    datasets: [
      {
        label: '기온 (°C)',
        data: temps,
        fill: false,
        borderColor: '#8884d8',
        pointBackgroundColor: graph.map(p =>
          p.temp === max ? 'red' : p.temp === min ? 'blue' : '#8884d8'
        ),
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true
      }
    }
  };

  return (
    <div style={{ height: 250 }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default WeatherLineChart;
