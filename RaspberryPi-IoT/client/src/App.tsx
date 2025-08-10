import { RouterProvider } from "react-router-dom";
import { router } from "./app/providers/routers";

function App() {
	return <RouterProvider router={router} />;
}

export default App;
