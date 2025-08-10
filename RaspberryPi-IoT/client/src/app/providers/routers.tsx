// src/app/providers/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { Home } from "../../pages/Home";
import { About } from "../../pages/About";
import { Layout } from "../../shared/ui/Layout";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ index: true, element: <Home /> },
			{ path: "about", element: <About /> },
		],
	},
]);
