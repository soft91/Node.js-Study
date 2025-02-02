import { Outlet } from "react-router-dom";

export const Layout = () => {
	return (
		<div className="flex flex-col min-h-screen">
			{/* 헤더 */}
			<header className="bg-blue-600 text-white py-4 px-6 shadow-md">
				<div className="container mx-auto flex justify-between items-center">
					<h1 className="text-xl font-bold">My App</h1>
					<nav>
						<ul className="flex space-x-4">
							<li>
								<a href="/" className="hover:underline">
									Home
								</a>
							</li>
							<li>
								<a href="/about" className="hover:underline">
									About
								</a>
							</li>
						</ul>
					</nav>
				</div>
			</header>

			{/* 메인 컨텐츠 */}
			<main className="flex-grow container mx-auto px-4 py-6">
				<Outlet /> {/* 여기 추가 */}
			</main>

			{/* 푸터 */}
			<footer className="bg-gray-800 text-white text-center py-4 mt-8">
				<p>
					&copy; {new Date().getFullYear()} My App. All rights reserved.
				</p>
			</footer>
		</div>
	);
};
