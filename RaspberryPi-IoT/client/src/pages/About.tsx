export const About = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
					{/* 헤더 */}
					<div className="text-center mb-10">
						<div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
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
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h1 className="text-4xl font-bold text-gray-800 mb-2">
							프로젝트 소개
						</h1>
						<p className="text-gray-600">
							Raspberry Pi IoT BLE 연결 프로젝트
						</p>
					</div>

					{/* 내용 */}
					<div className="space-y-8">
						{/* 프로젝트 개요 */}
						<section>
							<h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								프로젝트 개요
							</h2>
							<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
								<p className="text-gray-700 leading-relaxed">
									이 프로젝트는 Raspberry Pi와 BLE(Bluetooth Low
									Energy) 장치를 연결하여 IoT 기능을 구현하는 웹
									애플리케이션입니다. NestJS 백엔드와 React
									프론트엔드로 구성되어 있으며, 실시간으로 블루투스
									장치를 검색하고 연결할 수 있습니다.
								</p>
							</div>
						</section>

						{/* 기술 스택 */}
						<section>
							<h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
										d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
									/>
								</svg>
								기술 스택
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-blue-50 rounded-xl p-6">
									<h3 className="font-bold text-lg text-gray-800 mb-3">
										백엔드
									</h3>
									<ul className="space-y-2 text-gray-700">
										<li className="flex items-center gap-2">
											<span className="w-2 h-2 bg-blue-500 rounded-full" />
											NestJS
										</li>
										<li className="flex items-center gap-2">
											<span className="w-2 h-2 bg-blue-500 rounded-full" />
											TypeScript
										</li>
										<li className="flex items-center gap-2">
											<span className="w-2 h-2 bg-blue-500 rounded-full" />
											@abandonware/noble
										</li>
									</ul>
								</div>
								<div className="bg-purple-50 rounded-xl p-6">
									<h3 className="font-bold text-lg text-gray-800 mb-3">
										프론트엔드
									</h3>
									<ul className="space-y-2 text-gray-700">
										<li className="flex items-center gap-2">
											<span className="w-2 h-2 bg-purple-500 rounded-full" />
											React 18
										</li>
										<li className="flex items-center gap-2">
											<span className="w-2 h-2 bg-purple-500 rounded-full" />
											TypeScript
										</li>
										<li className="flex items-center gap-2">
											<span className="w-2 h-2 bg-purple-500 rounded-full" />
											Tailwind CSS
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* 주요 기능 */}
						<section>
							<h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
										d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
									/>
								</svg>
								주요 기능
							</h2>
							<div className="space-y-3">
								{[
									{
										title: "BLE 장치 스캔",
										desc: "주변 블루투스 저전력 장치 자동 검색",
									},
									{
										title: "장치 연결",
										desc: "발견된 장치에 실시간 연결",
									},
									{
										title: "데이터 읽기",
										desc: "연결된 장치의 특성 데이터 읽기",
									},
									{
										title: "에러 처리",
										desc: "사용자 친화적인 에러 메시지 제공",
									},
								].map((feature, index) => (
									<div
										key={index}
										className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
									>
										<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
											<svg
												className="w-5 h-5 text-white"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<div>
											<h4 className="font-semibold text-gray-800">
												{feature.title}
											</h4>
											<p className="text-sm text-gray-600">
												{feature.desc}
											</p>
										</div>
									</div>
								))}
							</div>
						</section>

						{/* 개발자 정보 */}
						<section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
							<h2 className="text-2xl font-bold mb-3">개발자 정보</h2>
							<p className="opacity-90">
								Node.js와 React를 활용한 IoT 프로젝트
							</p>
							<p className="text-sm opacity-75 mt-2">
								© 2025 Raspberry Pi IoT Project
							</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
};
