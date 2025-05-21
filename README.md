# Mobile Magicians
- CAU Art&Technology
- 2025-1 Mobile-Computing project team
## Members
- **ㄱㄴㅇ (팀장)**
- ㄱㄷㅇ
- ㅇㅎㅎ
- ㅎㅅㅇ

# LLM 기반 날씨 React 웹앱
## 프로젝트 규칙
1. 모든 작업은 각각의 branch에서 이루어진다.
2. 일련의 작업은 우선 `dev` branch 로 merge 한다.
3. merge는 본인을 제외한 두 명 이상의 컨펌 이후 이루어진다.
4. 프로토타입, 최종 작업물이 `dev` branch에서 만들어졌을 경우에만 `main`으로 merge 할 수 있다.
### Front : weather-assistant-frontend
https://github.com/havetodo-yeon/weather-assistant-frontend.git
### Back : weather-assistant-backend
https://github.com/havetodo-yeon/weather-assistant-backend.git

## 프로젝트 여는 방법
### Frontend 여는 방법
1. [weather-assistant-frontend](https://github.com/havetodo-yeon/weather-assistant-frontend.git) 프로젝트를 원하는 위치에 clone 한다.
2. 프로젝트 폴더를 vsc로 열어 git bash 터미널을 연 후 `weather-assistant` 폴더로 진입하여 `npm install`을 입력하여 Node-Module을 설치한다.
3. `npm start` 를 터미널에 입력하면 React 웹앱이 실행된다.

### Gemini LLM 기반 Backend 서버 여는 방법
1. [weather-assistant-backend](https://github.com/havetodo-yeon/weather-assistant-backend.git) 프로젝트를 `weather-assistant-frontend` 프로젝트 폴더와 동등한 위치로 clone 한다.  
>▼ 파일 구조  
&nbsp;&nbsp;&nbsp;**weather-assistant-backend/**    ← 백엔드 프로젝트  
&nbsp;&nbsp;└── backend/  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── server.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── package.json  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── node_modules/  
&nbsp;&nbsp;&nbsp;**weather-assistant-frontend/**    ← 프론트엔드 프로젝트  
&nbsp;&nbsp;└── weather-assistant/  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── src/  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── public/  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── package.json  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── ...  
2. 프로젝트 폴더를 vsc로 열어 git bash 터미널을 연 후 `backend` 폴더 위치에서 `npm init -y`와 `npm install express cors body-parser axios` 를 차례로 입력하여 Node-Module을 설치한다.
3. `node server.js` 를 터미널에 입력하면 Gemini 기반 백엔드 서버가 실행된다.
