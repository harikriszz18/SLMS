import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7013/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getBalance = async () => {
  const response = await api.get("/Leave/balance");
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get(
    "/Notification/unread-count"
  );

  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get(
    "/Report/dashboard"
  );

  return response.data;
};