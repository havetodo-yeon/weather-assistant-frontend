import React, { useEffect, useRef } from 'react';
import './Chat.css';
import WeatherLineChart from './WeatherLineChart'; // 경로는 파일 위치에 따라 조절

// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
// } from 'recharts';

const Chat = ({
  messages,
  input,
  setInput,
  handleSend
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.graph) {
      console.log('📊 최종 렌더링 대상 m.graph:', last.graph);

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        console.log('🔁 window.resize 트리거됨');
      }, 100);
    }
  }, [messages]);

  return (
    <div className="app-container">
      <div className="chat-screen">
        <div className="messages">
          {messages.map((m, i) => (
            <div className={`bubble ${m.type}`}>
  {m.text && <div>{m.text}</div>}
  {Array.isArray(m.graph) && m.graph.length > 0 && (
    <div className="graph-card">
      <WeatherLineChart graph={m.graph} />
    </div>
  )}
</div>

          ))}
        </div>
      </div>

      <div className="footer-input">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </div>
  );
};

export default Chat;
