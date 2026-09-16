import axios from "axios";
const API_URL = "https://localhost:7013/api/Auth";

export const login = async (
  email: string,
  password: string
) => {
  const response = await axios.post(
    `${API_URL}/login`,
    {
      email,
      password,
    }
  );

  return response.data;
};