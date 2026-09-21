import axios from "axios";

const API_BASE = "https://localhost:7013/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registerEmployee = async (employeeData: {
  fullName: string;
  email: string;
  department: string;
  role: string;
  temporaryPassword?: string;
}) => {
  const res = await axios.post(`${API_BASE}/Employee/register`, employeeData, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const changePassword = async (passwords: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) => {
  const res = await axios.post(`${API_BASE}/Employee/change-password`, passwords, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const getAbsencesByDate = async (dateStr: string) => {
  const res = await axios.get(
    `${API_BASE}/ManagerInsights/absences?date=${dateStr}`,
    {
      headers: getAuthHeader(),
    }
  );
  return res.data;
};

export const uploadProfilePicture = async (email: string, profilePicture: string) => {
  const res = await axios.post(
    `${API_BASE}/Employee/profile-picture`,
    { email, profilePicture },
    {
      headers: getAuthHeader(),
    }
  );
  return res.data;
};

export const getProfilePicture = async (email: string) => {
  const res = await axios.get(
    `${API_BASE}/Employee/profile-picture?email=${encodeURIComponent(email)}`,
    {
      headers: getAuthHeader(),
    }
  );
  return res.data;
};

export const removeProfilePicture = async (email: string) => {
  const res = await axios.delete(
    `${API_BASE}/Employee/profile-picture?email=${encodeURIComponent(email)}`,
    {
      headers: getAuthHeader(),
    }
  );
  return res.data;
};