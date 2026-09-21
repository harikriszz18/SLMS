import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7013/api/Notification",
});

// Always dynamically attach the latest token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getNotifications = async () => {
  const response = await api.get("");
  return response.data;
};

export const markAsRead = async (id: number) => {
  const response = await api.put(`/read/${id}`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get("/unread-count");
  return response.data;
};