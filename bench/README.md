# Benchmark Scripts

This folder contains simple HTTP and WebSocket benchmark tools for local testing.

## 설치

```bash
npm install
```

## 실행

### HTTP 벤치

```bash
npm run bench:http -- --url=http://localhost:3000/api/hello --concurrency=50 --requests=500
```

옵션

- `--url` : 테스트할 HTTP 엔드포인트
- `--concurrency` : 동시 요청 수
- `--requests` : 전체 요청 수
- `--duration` : 실행 시간 (초)
- `--method` : `GET` 또는 `POST`
- `--body` : POST 본문
- `--headers` : `Key:Value;Key2:Value2` 형식

### WebSocket 벤치

```bash
npm run bench:ws -- --url=ws://localhost:3000 --clients=50 --messages=20
```

옵션

- `--url` : 테스트할 WebSocket URL
- `--clients` : 동시 WebSocket 연결 수
- `--messages` : 각 연결당 전송할 메시지 수
- `--message` : 보낼 메시지 내용
- `--mode` : `echo` 또는 `fire-and-forget`

## WebSocket 서버

`echo` 모드로 측정하려면 서버가 메시지를 그대로 되돌려주는 echo 동작이 필요합니다.

## 예시

```bash
npm run bench:http -- --url=http://localhost:3000/api/ping --concurrency=20 --duration=15
npm run bench:ws -- --url=ws://localhost:3000/socket --clients=30 --messages=10 --mode=echo
```
