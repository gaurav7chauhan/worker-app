import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1", // change if needed
  withCredentials: true,    // important if you use cookies later
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
