const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class ApiError extends Error {
	constructor(message: string, public status?: number) {
		super(message);
		this.name = "ApiError";
	}
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const error = await response.json().catch(() => ({
			message: "An error occurred",
		}));
		throw new ApiError(
			error.message || `Request failed with status ${response.status}`,
			response.status
		);
	}
	return response.json();
}

export const api = {
	get: async <T>(endpoint: string): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`);
		return handleResponse<T>(response);
	},

	post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: data ? JSON.stringify(data) : undefined,
		});
		return handleResponse<T>(response);
	},
};
