# IoT Client (React + Vite)

Raspberry Pi IoT 프로젝트의 React 프론트엔드 클라이언트입니다.

## 설치

```bash
npm install
```

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
VITE_API_URL=http://localhost:3000
```

## 실행

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 프로젝트 구조

```
src/
├── app/
│   └── providers/
│       └── routers.tsx   # 라우터 설정
├── pages/                # 페이지 컴포넌트
│   ├── Home.tsx          # 홈 페이지 (BLE 장치 관리)
│   └── About.tsx         # 소개 페이지
├── services/             # API 서비스 레이어
│   ├── api.ts            # 기본 API 클라이언트
│   └── ble.service.ts    # BLE API 서비스
├── shared/               # 공유 컴포넌트
│   └── ui/
│       └── Layout.tsx    # 레이아웃 컴포넌트
├── types/                # TypeScript 타입 정의
│   └── ble.types.ts      # BLE 관련 타입
├── App.tsx               # 루트 컴포넌트
└── main.tsx              # 앱 진입점
```

## 주요 기능

### 블루투스 장치 관리

-  BLE 장치 스캔
-  장치 목록 표시
-  장치 연결/연결 해제
-  에러 처리 및 사용자 피드백

### 기술 스택

-  React 18
-  TypeScript
-  React Router v6
-  Tailwind CSS
-  Vite

## 린트 및 포맷

```bash
# ESLint 실행
npm run lint

# Prettier 포맷팅
npm run format
```
