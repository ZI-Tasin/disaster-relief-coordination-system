const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://disaster-relief-coordination-system-0z00.onrender.com/api";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  API_URL.replace(/\/api\/?$/, "");

export { API_URL, API_ORIGIN };

export default API_URL;
