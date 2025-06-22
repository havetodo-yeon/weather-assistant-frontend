# 🔮 Lumee - 똑똑한 감성 날씨 어시스턴트
> "사용자 취향과 건강 민감도를 반영해, 가장 필요한 날씨 정보를 선별해주는 AI 날씨 비서"




## 📌 프로젝트 개요

- 개발 기간: 2025.05.29 - 2025.06.16
- 개발 목적: **Lumee**는 사용자의 기상 민감 요소(예: 꽃가루, 자외선, 미세먼지)와 취미(예: 러닝, 산책 등)를 고려하여 질문 의도에 따라 맞춤형 날씨 정보를 자연스럽게 제공하는 챗봇 기반 날씨 어시스턴트입니다.



## 🚀 주요 기능

- 🔍 LLM 기반 자연어 질문 인식: `"마스크 써야 해?"`, `"서울 비와?"`, `"우산 챙길까?"`
- 🌐 사용자 위치 기반 자동 날씨 제공
- 🎯 사용자 민감 요소/취미 기반 맞춤형 조언
- 📊 기온/미세먼지 그래프 시각화
- 🧠 LLM에게 실시간 날씨 정보를 넘겨 최종 응답 생성

---

## 💻 링크

- DEMO: [Lumee⛅🔮](https://hongsoonil.github.io/weather-assistant-frontend/)
- PREVIEW: 시연 영상 링크
- WORKSPACE: [Team Project: Lumee⛅🔮](https://www.notion.so/Team-Project-Lumee-202d2eacfdb280779c36f2f214d1584e?pvs=21)

---


## 👥 팀원

| 이름 | 역할 |
| --- | --- |
| 기나연 (팀장) | 프론트엔드 UI 구현, 디자인 및 시각화 구성 전반, 모바일 대응 |
| 김도연 | 위치 기반 API 연동, 미세먼지·기온 그래프 시각화,  LLM 아키텍처 재구성, git 관리 |
| 이하형 | 자연어 입력에 대한 정보 추출 및 개인화 응답 생성, Firebase를 통한 사용자 정보 저장 및 불러오기 |
| 홍순일 | 미세먼지/꽃가루 API 연동, 앱 빌드 및 배포 담당 |

---

## 🛠️ 사용 기술 스택

| 분야 | 기술 |
| --- | --- |
| 프론트엔드 | React,Tailwind CSS, Recharts |
| 백엔드 | Node.js |
| AI 모델 | Gemini API (Google Generative AI) |
| 데이터 API | OpenWeather, Ambee API, Google Geocoding |
| DB | Firebase Realtime Database |
| 배포 | GithubPage(FE), Render (BE) |

---

## 📂 프로젝트 구조

### 1. 리포지토리

[**Front** : weather-assistant-frontend](https://github.com/havetodo-yeon/weather-assistant-frontend.git)

[**Back** : weather-assistant-backend](https://github.com/havetodo-yeon/weather-assistant-backend.git)

### 2. 파일구조

```markdown
📦 Mobile-Magicians
┣ 📂 weather-assistant-frontend
┃  ┗ 📂 weather-assistant
┃  ┣ 📜 App.js
┃  ┣ 📜 WeatherLineChart.js
┃  ┣ 📜 Chat.js
┃  ┗ ...
┣ 📂 weather-assistant-backend
┃  ┗ 📂 backend
┃  ┣ 🔒 .env
┃  ┣ 📜 server.js
┃  ┣ 📜 tools.js
┃  ┣ 📜 geminiUtils.js
┃  ┣ 📜 weatherUtils.js
┃  ┣ 📜 userProfileUtils.js
┃  ┗ ...
┗ ...
```

---

## ⚙️ 로컬 실행 방법

### 1. 백엔드 실행

```bash
bash
cd weather-assistant-backend/backend
npm init -y
npm install express cors body-parser axios
npm install firebase
node server.js
```

### 2. 프론트엔드 실행

```bash
cd weather-assistant-frontend/weather-assistant
npm install
npm install chart.js react-chartjs-2
npm start
```

### 3. `.env` 파일 설정

```makefile
GEMINI_API_KEY=YOUR_GEMINI_API_KEY              # Gemini API 키 (LLM 질문 응답)
OPENCAGE_API_KEY=YOUR_OPENCAGE_API_KEY          # 위치 → 주소 변환용
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY    # 날씨 데이터
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY    # 좌표 → 영문 주소
AMBEE_POLLEN_API_KEY=YOUR_AMBEE_POLLEN_API_KEY  # 꽃가루 정보
```

---

## 📢 향후 계획

- 🌐 앱 내 다국어 지원
- 📱 모바일 앱 출시 (React Native 또는 Flutter 전환 고려)
