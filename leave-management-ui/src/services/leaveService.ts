import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7013/api/Leave",
});

// Dynamic interceptor ensures the active user's token is always attached
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const applyLeave = async (
  leaveType: string,
  startDate: string,
  endDate: string,
  reason: string
) => {
  const response = await api.post("/apply", {
    leaveType,
    startDate,
    endDate,
    reason,
  });
  return response.data;
};

export const getLeaveHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};