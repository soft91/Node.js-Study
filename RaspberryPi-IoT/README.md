# RaspberryPi IoT Project

Raspberry Pi와 블루투스(BLE) 장치를 연결하여 IoT 기능을 구현하는 프로젝트입니다.

## 프로젝트 구조

```
RaspberryPi-IoT/
├── client/          # React + TypeScript 프론트엔드
│   ├── src/
│   │   ├── app/           # 앱 설정 (라우터 등)
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스 레이어
│   │   ├── shared/        # 공유 컴포넌트
│   │   └── types/         # TypeScript 타입 정의
│   └── ...
└── server/          # NestJS 백엔드
    ├── src/
    │   ├── ble/           # BLE 관련 기능
    │   │   ├── constants/ # 상수 정의
    │   │   ├── dto/       # 데이터 전송 객체
    │   │   ├── ble.controller.ts
    │   │   ├── ble.service.ts
    │   │   └── ble.module.ts
    │   ├── app.module.ts
    │   └── main.ts
    └── ...
```

## 기술 스택

### 백엔드

-  **NestJS**: Node.js 프레임워크
-  **@abandonware/noble**: BLE(Bluetooth Low Energy) 통신 라이브러리
-  **@nestjs/config**: 환경변수 관리
-  **TypeScript**: 타입 안전성

### 프론트엔드

-  **React 18**: UI 라이브러리
-  **TypeScript**: 타입 안전성
-  **Vite**: 빌드 도구
-  **React Router**: 라우팅
-  **Tailwind CSS**: 스타일링

## 시작하기

### 환경 변수 설정

#### 서버 (.env)

```bash
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

#### 클라이언트 (.env)

```bash
VITE_API_URL=http://localhost:3000
```

### 설치 및 실행

#### 서버

```bash
cd server
npm install
npm run dev
```

#### 클라이언트

```bash
cd client
npm install
npm run dev
```

## 주요 기능

### BLE 장치 관리

-  **장치 스캔**: 주변 BLE 장치 검색 (60초 자동 타임아웃)
-  **장치 연결**: 발견된 장치에 연결
-  **데이터 읽기**: 연결된 장치의 특성(characteristic) 데이터 읽기

### API 엔드포인트

```
GET  /ble/start-scan                               # 장치 스캔 시작
GET  /ble/devices                                  # 발견된 장치 목록
POST /ble/connect/:deviceId                        # 장치 연결
GET  /ble/connected-device                         # 연결된 장치 정보
GET  /ble/read-data/:serviceId/:characteristicId  # 데이터 읽기
```

## 리팩토링 개선사항

### 서버 측

1. **DTO 및 타입 정의**: 명확한 데이터 구조 정의
2. **상수 분리**: 하드코딩된 값을 상수로 분리
3. **에러 처리 개선**: 표준 NestJS 예외 처리 방식 적용
4. **코드 구조화**: 메서드 분리 및 가독성 향상
5. **환경변수 관리**: @nestjs/config를 통한 설정 관리

### 클라이언트 측

1. **API 서비스 레이어**: API 호출 로직 분리
2. **타입 정의**: 명확한 타입 시스템 구축
3. **에러 처리**: 사용자 피드백 추가
4. **환경변수**: API URL 환경변수화
5. **코드 정리**: 불필요한 파일 제거

## 개발 팁

### BLE 디바이스 테스트

-  macOS/Linux에서는 별도의 설정 없이 Noble 라이브러리가 작동합니다
-  Windows에서는 추가 설정이 필요할 수 있습니다

### 문제 해결

-  BLE 스캔이 작동하지 않는 경우: 블루투스가 켜져 있는지 확인
-  CORS 에러: 서버의 CORS_ORIGIN 설정 확인
-  연결 실패: 장치가 연결 가능한 상태인지 확인

## 라이선스

UNLICENSED
