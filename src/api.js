import axios from "axios";


const api = axios.create({
  baseURL: "https://examportalbackend-3zxw.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export function getRole() {
  return localStorage.getItem("role");
}

export function login(token, role, profile) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("profile", JSON.stringify(profile || {}));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("profile");
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem("profile") || "{}");
  } catch {
    return {};
  }
}
