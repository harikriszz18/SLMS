import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "https://localhost:7013/api/Notification",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getNotifications = async () => {
  const response = await api.get("");

  return response.data;
};
export const markAsRead = async (id: number) => {
  await api.put(`/read/${id}`);
};
