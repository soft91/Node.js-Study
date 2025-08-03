import { WebSocketServer, WebSocket } from "ws";

const server = new WebSocketServer({ port: 3000 });

console.log("WebSocket 서버가 포트 3000에서 시작되었습니다.");

server.on("connection", (ws: WebSocket) => {
	console.log("새로운 클라이언트가 연결되었습니다.");

	ws.send("서버 접속 완료");
	console.log("초기 메시지를 클라이언트에게 전송했습니다.");

	ws.on("message", (message: Buffer) => {
		const messageStr = message.toString();
		console.log("클라이언트로부터 메시지 수신:", messageStr);

		const response = `서버로 부터 응답: ${messageStr}`;
		ws.send(response);
		console.log("클라이언트에게 응답 전송:", response);
	});

	ws.on("close", () => {
		console.log("클라이언트 연결이 종료되었습니다.");
	});

	ws.on("error", (error) => {
		console.error("WebSocket 에러:", error);
	});
});

server.on("error", (error) => {
	console.error("서버 에러:", error);
});
