import axios from "axios";

const API = axios.create({
  baseURL: "https://jeevansetu-2.onrender.com/api",
});

// Automatically attach JWT token to every protected request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register
export const registerUser = async (data) => {
  const response = await API.post(
    "/auth/register",
    data
  );

  return response.data;
};

// Login
export const loginUser = async (data) => {
  const response = await API.post(
    "/auth/login",
    data
  );

  return response.data;
};

// Get workers
export const getWorkers = async () => {
  const response = await API.get(
    "/citizen/workers"
  );

  return response.data;
};

export default API;