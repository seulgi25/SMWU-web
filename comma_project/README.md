# 쉼표,

지친 마음을 채우는 힐링 콘텐츠 및 나만의 감정 기록 웹서비스입니다.

**쉼표,**는 학업, 취업, 인간관계 등으로 힘들어하는 사용자가 자신의 감정을 안전하게 기록하고, 비슷한 상황을 겪는 사람들과 익명으로 온기를 나누며, 현재 감정과 상황에 맞는 위로 콘텐츠를 추천받을 수 있도록 구현한 웹서비스입니다.

# 1. 실행방법

본 프로젝트는 React + Vite 기반 웹 프로젝트입니다.

보안을 위해 API Key는 제외되어 있으므로 직접 실행하기 위해서는 별도의 환경 변수 설정이 필요합니다.

**1) 실행환경**

프로젝트 실행을 위해 Node.js와 npm이 필요합니다. 설치가 되어있지 않다면 먼저 설치를 진행한 후 다음 단계로 이동해주세요.

- Node.js
- npm

**2) 프로젝트 소스 코드 준비 (택1)**

**[방법 A] 제출된 압축 파일로 실행하는 경우**

1. 제출된 `정슬기.zip` 파일을 저장하고 원하는 위치에 압축을 해제합니다.

2. 터미널을 열고 해당 프로젝트 폴더 경로로 이동합니다.

**[방법 B] Git 저장소에서 클론(clone)하는 경우**

터미널에서 아래 명령어를 차례대로 입력하여 프로젝트를 내려 받고 폴더로 이동합니다.

```
git clone <Git 저장소 주소>
cd <프로젝트 폴더명>
```

**3) 패키지 설치**

프로젝트에 필요한 라이브러리는 package.json에 정리되어 있습니다.

아래 명령어(npm install)을 실행하면 React, Firebase, React Router, axios, Kakao Map SDK 등 프로젝트 실행에 필요한 패키지가 자동으로 설치됩니다.

`npm install`

**4) 환경 변수 설정**

프로젝트 루트 경로에 .env 파일을 생성하고, 아래 형식에 맞게 발급받은 API Key를 입력합니다.

```
VITE_WEATHER_API_KEY=OpenWeatherMap_API_KEY

VITE_KAKAO_MAP_API_KEY=KaKao_Map_API_KEY

VITE_FIREBASE_API_KEY=Firebase_API_KEY

VITE_FIREBASE_AUTH_DOMAIN=Firebase_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID=Firebase_PROJECT_ID

VITE_FIREBASE_STORAGE_BUCKET=Firebase_STORAGE_BUCKET

VITE_FIREBASE_MESSAGING_SENDER_ID=Firebase_MESSAGING_SENDER_ID

VITE_FIREBASE_APP_ID=Firebase_APP_ID
```

**5) 개발 서버 실행**

`npm run dev`

실행 후 터미널에 표시되는 주소(http://localhost:5173)로 접속합니다.

# 2. 소스코드 구조

```text
src
├─ components #공통 UI 컴포넌트
│  ├─ Header.jsx
│  └─ Footer.jsx
│
├─ pages #주요 화면
│  ├─ Home.jsx # 메인 홈화면
│  ├─ Login.jsx # 로그인 화면
│  ├─ Signup.jsx # 회원가입 화면
│  ├─ Consolation.jsx # 마음 상태 진단
│  ├─ Consolation_result.jsx # 맞춤 위로 결과
│  ├─ Secret_forest_list.jsx # 익명대나무숲 목록
│  ├─ Secret_forest_write.jsx # 익명 대나무숲 글 작성
│  ├─ Secret_forest_details.jsx # 익명 대나무숲 상세 페이지
│  ├─ Secret_note_list.jsx # 비밀 일기장 목록
│  ├─ Secret_note_write.jsx # 비밀 일기장 작성 페이지
│  ├─ Alarm.jsx # 알림 센터
│  ├─ Mypage.jsx
│  └─ Mypage_setting.jsx
│
├─ firebase.js # Firebase 초기화 및 연동
├─ App.jsx # 라우팅 및 전역 상태 관리
└─ main.jsx # React 앱 진입점
```

# 3. 실행 시 주의사항

- `.env` 파일은 API Key 값이 들어있기 때문에 GitHub에 업로드(commit) 하지 않도록 주의합니다.
- Firebase: Authentication에서 '이메일/비밀번호', '구글 로그인' 제공업체를 활성화해야 하며, Firestore Database의 접근 권한이 필요합니다.
- Kakao Map API: KaKao Developers에서 JavaScript 키와 허용 도메인을 등록해야합니다.
- OpenWeatherMap API: 이 API Key가 없다면 날씨 기반 추천 기능이 정상적으로 작동하지 않을 수 있습니다.

# 4. 개발자

- 정슬기
