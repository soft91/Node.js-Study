import { useState, useEffect, useRef } from "react";
import { bleService } from "../services/ble.service";
import { ApiError } from "../services/api";
import { BLEDevice } from "../types/ble.types";

export const Home = () => {
	const [devices, setDevices] = useState<BLEDevice[]>([]);
	const [scanning, setScanning] = useState(false);
	const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [countdown, setCountdown] = useState<number>(0);
	const timerRef = useRef<number | null>(null);

	// 컴포넌트 언마운트 시 타이머 정리
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, []);

	// 카운트다운 타이머
	useEffect(() => {
		if (countdown > 0) {
			timerRef.current = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						if (timerRef.current) {
							clearInterval(timerRef.current);
						}
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => {
				if (timerRef.current) {
					clearInterval(timerRef.current);
				}
			};
		}
	}, [countdown]);

	const startScan = async () => {
		setScanning(true);
		setError(null);
		setCountdown(60); // 60초 카운트다운 시작
		try {
			const response = await bleService.startScan();
			console.log(response.message);
			await fetchDevices();
		} catch (err) {
			const errorMessage =
				err instanceof ApiError
					? err.message
					: "장치 검색 중 오류가 발생했습니다";
			setError(errorMessage);
			console.error("장치 검색 실패:", err);
			setCountdown(0); // 에러 발생 시 카운트다운 취소
		} finally {
			setScanning(false);
		}
	};

	const fetchDevices = async () => {
		try {
			const data = await bleService.getDevices();
			setDevices(data);
		} catch (err) {
			const errorMessage =
				err instanceof ApiError
					? err.message
					: "장치 목록을 불러오는 중 오류가 발생했습니다";
			setError(errorMessage);
			console.error("장치 목록 불러오기 실패:", err);
		}
	};

	const connectToDevice = async (deviceId: string) => {
		setError(null);
		try {
			const response = await bleService.connectToDevice(deviceId);
			console.log(response.message);
			setConnectedDevice(deviceId);
		} catch (err) {
			const errorMessage =
				err instanceof ApiError
					? err.message
					: "장치 연결 중 오류가 발생했습니다";
			setError(errorMessage);
			console.error("장치 연결 실패:", err);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
			<div className="max-w-2xl mx-auto">
				{/* 헤더 */}
				<div className="text-center mb-8 pt-8">
					<div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
						<svg
							className="w-12 h-12 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
							/>
						</svg>
					</div>
					<h1 className="text-4xl font-bold text-gray-800 mb-2">
						BLE 장치 검색
					</h1>
					<p className="text-gray-600">
						주변의 블루투스 장치를 찾아 연결하세요
					</p>
				</div>

				{/* 에러 메시지 */}
				{error && (
					<div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md overflow-hidden animate-fadeIn">
						<div className="p-4 flex items-start justify-between">
							<div className="flex items-start">
								<svg
									className="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-red-800 text-sm font-medium">
									{error}
								</span>
							</div>
							<button
								className="text-red-500 hover:text-red-700 transition-colors ml-4"
								onClick={() => setError(null)}
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>
					</div>
				)}

				{/* 검색 버튼 */}
				<div className="mb-8 flex flex-col items-center gap-3">
					<button
						className={`group relative px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform ${
							countdown > 0
								? "bg-gray-400 cursor-not-allowed"
								: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-xl active:scale-95"
						}`}
						onClick={startScan}
						disabled={countdown > 0}
					>
						<span className="flex items-center gap-3">
							{scanning ? (
								<>
									<svg
										className="animate-spin h-5 w-5 text-white"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									장치 검색 중...
								</>
							) : countdown > 0 ? (
								<>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{countdown}초 대기 중
								</>
							) : (
								<>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
									장치 검색 시작
								</>
							)}
						</span>
					</button>

					{/* 카운트다운 프로그레스 바 */}
					{countdown > 0 && (
						<div className="w-full max-w-xs animate-fadeIn">
							<div className="flex items-center justify-between text-sm text-gray-600 mb-2">
								<span>스캔 진행 중</span>
								<span className="font-semibold">
									{countdown}초 남음
								</span>
							</div>
							<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-linear"
									style={{
										width: `${((60 - countdown) / 60) * 100}%`,
									}}
								/>
							</div>
						</div>
					)}
				</div>

				{/* 장치 목록 */}
				<div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-90">
					<div className="flex items-center gap-2 mb-4">
						<svg
							className="w-6 h-6 text-indigo-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
							/>
						</svg>
						<h2 className="text-xl font-bold text-gray-800">
							검색된 장치
						</h2>
						{devices.length > 0 && (
							<span className="ml-auto bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
								{devices.length}개
							</span>
						)}
					</div>

					<div className="space-y-2">
						{devices.length > 0 ? (
							devices.map((device, index) => (
								<div
									key={device.id}
									className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
										connectedDevice === device.id
											? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md"
											: "bg-gray-50 border-transparent hover:border-indigo-300 hover:shadow-md hover:bg-white"
									}`}
									onClick={() => connectToDevice(device.id)}
									style={{
										animationDelay: `${index * 50}ms`,
									}}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={`w-12 h-12 rounded-full flex items-center justify-center ${
													connectedDevice === device.id
														? "bg-green-500"
														: "bg-gradient-to-br from-blue-400 to-indigo-500"
												}`}
											>
												<svg
													className="w-6 h-6 text-white"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
													/>
												</svg>
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<p className="font-semibold text-gray-800">
														{device.name || "알 수 없는 장치"}
													</p>
													{device.address && (
														<span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-mono">
															{device.address}
														</span>
													)}
												</div>
												<div className="flex items-center gap-2 mt-1">
													<p className="text-xs text-gray-500 font-mono">
														ID: {device.id.substring(0, 12)}...
													</p>
													{device.rssi && (
														<div className="flex items-center gap-1">
															<svg
																className="w-3 h-3 text-gray-400"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
																/>
															</svg>
															<span
																className={`text-xs font-medium ${
																	device.rssi > -60
																		? "text-green-600"
																		: device.rssi > -80
																		? "text-yellow-600"
																		: "text-red-600"
																}`}
															>
																{device.rssi} dBm
															</span>
														</div>
													)}
												</div>
												{device.serviceUuids &&
													device.serviceUuids.length > 0 && (
														<div className="mt-1 flex items-center gap-1">
															<span className="text-xs text-gray-400">
																서비스:
															</span>
															<span className="text-xs text-indigo-600 font-mono">
																{device.serviceUuids.length}개
															</span>
														</div>
													)}
											</div>
										</div>

										{connectedDevice === device.id ? (
											<div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-sm">
												<svg
													className="w-5 h-5"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
														clipRule="evenodd"
													/>
												</svg>
												<span className="text-sm font-bold">
													연결됨
												</span>
											</div>
										) : (
											<div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
												<svg
													className="w-6 h-6"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M13 7l5 5m0 0l-5 5m5-5H6"
													/>
												</svg>
											</div>
										)}
									</div>
								</div>
							))
						) : (
							<div className="text-center py-12">
								<svg
									className="w-16 h-16 text-gray-300 mx-auto mb-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="text-gray-400 text-lg">
									장치를 찾을 수 없습니다
								</p>
								<p className="text-gray-400 text-sm mt-2">
									검색 버튼을 눌러 장치를 찾아보세요
								</p>
							</div>
						)}
					</div>
				</div>

				{/* 연결된 장치 정보 */}
				{connectedDevice && (
					<div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white animate-fadeIn">
						<div className="flex items-center gap-3">
							<svg
								className="w-8 h-8"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<div>
								<p className="text-sm opacity-90">현재 연결된 장치</p>
								<p className="font-bold text-lg">
									{devices.find((d) => d.id === connectedDevice)
										?.name || connectedDevice}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
