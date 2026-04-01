import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';
const nativeFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
	const token = localStorage.getItem('auth_token');
	const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
	const isApiRequest = url.startsWith(`${API_BASE_URL}/api/`) || url.startsWith('/api/');

	if (!token || !isApiRequest) {
		return nativeFetch(input, init);
	}

	const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
	if (!headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	return nativeFetch(input, {
		...init,
		headers,
	});
};

createRoot(document.getElementById("root")!).render(<App />);
