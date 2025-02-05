import { useState } from "react";

export const Home = () => {
	const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
	const [scanning, setScanning] = useState(false);
	const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

	// 블루투스 장치 검색 API 호출
	const startScan = async () => {
		setScanning(true);
		try {
			const response = await fetch("http://localhost:3000/ble/start-scan");
			const data = await response.json();
			console.log(data.message);
			fetchDevices();
		} catch (error) {
			console.error("장치 검색 실패:", error);
		}
		setScanning(false);
	};

	// 검색된 블루투스 장치 가져오기
	const fetchDevices = async () => {
		try {
			const response = await fetch("http://localhost:3000/ble/devices");
			const data = await response.json();
			setDevices(data);
		} catch (error) {
			console.error("장치 목록 불러오기 실패:", error);
		}
	};

	// 장치 연결 API 호출
	const connectToDevice = async (deviceId: string) => {
		try {
			const response = await fetch(
				`http://localhost:3000/ble/connect/${deviceId}`,
				{ method: "POST" }
			);
			const data = await response.json();
			console.log(data.message);
			setConnectedDevice(deviceId);
		} catch (error) {
			console.error("장치 연결 실패:", error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
			<h1 className="text-2xl font-bold mb-4">🔍 블루투스 장치 검색</h1>

			{/* 검색 버튼 */}
			<button
				className={`px-6 py-2 text-white rounded-lg ${
					scanning
						? "bg-gray-400 cursor-not-allowed"
						: "bg-blue-500 hover:bg-blue-600"
				}`}
				onClick={startScan}
				disabled={scanning}
			>
				{scanning ? "검색 중..." : "장치 검색 시작"}
			</button>

			{/* 장치 목록 */}
			<div className="mt-6 w-full max-w-md">
				<h2 className="text-lg font-semibold mb-2">📡 검색된 장치</h2>
				<ul className="bg-white shadow-md rounded-lg p-4">
					{devices.length > 0 ? (
						devices.map((device) => (
							<li
								key={device.id}
								className="flex justify-between items-center p-2 border-b"
							>
								<span>{device.name || "알 수 없는 장치"}</span>
								<button
									className={`px-3 py-1 text-sm text-white rounded ${
										connectedDevice === device.id
											? "bg-gray-500 cursor-not-allowed"
											: "bg-green-500 hover:bg-green-600"
									}`}
									onClick={() => connectToDevice(device.id)}
									disabled={connectedDevice === device.id}
								>
									{connectedDevice === device.id ? "연결됨" : "연결"}
								</button>
							</li>
						))
					) : (
						<p className="text-gray-500 text-center">장치 없음</p>
					)}
				</ul>
			</div>

			{/* 연결된 장치 표시 */}
			{connectedDevice && (
				<div className="mt-4 text-green-600">
					✅ 연결된 장치: <strong>{connectedDevice}</strong>
				</div>
			)}
		</div>
	);
};
