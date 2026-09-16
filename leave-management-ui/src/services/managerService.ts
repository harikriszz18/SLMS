import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "https://localhost:7013/api/Leave",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getPendingLeaves = async () => {
  const response = await api.get("/pending");
  return response.data;
};

export const approveLeave = async (
  id: number
) => {
  const response = await api.put(
    `/approve/${id}`
  );

  return response.data;
};

export const rejectLeave = async (
  id: number
) => {
  const response = await api.put(
    `/reject/${id}`
  );

  return response.data;
};
export const getAllLeaves = async () => {
  const response = await api.get("/all");

  return response.data;
};