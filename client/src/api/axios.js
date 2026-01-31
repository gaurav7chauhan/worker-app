import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // change if needed
  withCredentials: true, // important if you use cookies later
});

// ...................(Request bhejne se pehle)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error),
);

// ....................(Response aane ke baad)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // IMPORTANT: call refresh WITHOUT api instance
        const res = axios.post(
          `${import.meta.env.VITE_API_URL}/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = (await res).data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        // Update original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token invalid or revoked
        localStorage.removeItem("accessToken");

        // Optional: clear app state
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
