// src/shared/ui/Layout.tsx
import { Outlet, Link } from "react-router-dom";

export const Layout = () => {
	return (
		<div>
			<header>
				<nav>
					<Link to="/">홈</Link> | <Link to="/about">소개</Link>
				</nav>
			</header>
			<main>
				<Outlet />
			</main>
			<footer>© 2025 My App</footer>
		</div>
	);
};
