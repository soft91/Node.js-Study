# IoT Server (NestJS)

Raspberry Pi와 BLE 장치를 관리하는 NestJS 백엔드 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## API 문서

### BLE 장치 스캔

```http
GET /ble/start-scan
```

### 발견된 장치 목록

```http
GET /ble/devices
```

### 장치 연결

```http
POST /ble/connect/:deviceId
```

### 연결된 장치 정보

```http
GET /ble/connected-device
```

### 데이터 읽기

```http
GET /ble/read-data/:serviceId/:characteristicId
```

## 프로젝트 구조

```
src/
├── ble/
│   ├── constants/        # BLE 관련 상수
│   ├── dto/              # 데이터 전송 객체
│   ├── ble.controller.ts # REST API 컨트롤러
│   ├── ble.service.ts    # BLE 비즈니스 로직
│   └── ble.module.ts     # BLE 모듈
├── app.module.ts         # 루트 모듈
└── main.ts               # 앱 진입점
```

## 테스트

```bash
# 단위 테스트
npm run test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```
