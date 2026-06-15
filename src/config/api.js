/** Base URL for API calls. Empty string = same origin (Vercel / Vite proxy). */
export const getApiBaseUrl = () => import.meta.env.VITE_API_URL ?? "";

export default getApiBaseUrl;
