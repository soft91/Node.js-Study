import { Outlet, Link, useLocation } from "react-router-dom";

export const Layout = () => {
	const location = useLocation(); // 현재 경로 확인

	return (
		<div className="flex flex-col min-h-screen">
			{/* 헤더 */}
			<header className="sticky top-0 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg z-50">
				<div className="max-w-screen-lg mx-auto flex justify-between items-center py-4 px-6">
					<h1 className="text-2xl font-bold tracking-wide">
						<Link to="/">🚀 My App</Link>
					</h1>
					<nav>
						<ul className="flex space-x-6">
							{["/", "/about"].map((path) => (
								<li key={path}>
									<Link
										to={path}
										className={`relative text-lg tracking-wide transition-all duration-200 hover:underline underline-offset-4 ${
											location.pathname === path
												? "font-bold underline"
												: "opacity-80"
										}`}
									>
										{path === "/" ? "Home" : "About"}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</header>

			{/* 메인 컨텐츠 */}
			<main className="flex-grow flex flex-col items-center justify-center px-4 py-6">
				<div className="w-full max-w-screen-lg">
					<Outlet />
				</div>
			</main>

			{/* 푸터 */}
			<footer className="bg-gray-900 text-white text-center py-6">
				<p className="text-sm">
					&copy; {new Date().getFullYear()} My App. All rights reserved.
				</p>
			</footer>
		</div>
	);
};
