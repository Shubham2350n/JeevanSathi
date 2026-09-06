import axios from "axios";


const API = axios.create({
  baseURL: "https://jeevansathi-backend.onrender.com/api",
});


/* =========================================================
   JWT AUTHORIZATION
========================================================= */

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


/* =========================================================
   AUTH
========================================================= */

export const registerUser = async (data) => {
  const response = await API.post(
    "/auth/register",
    data
  );

  return response.data;
};


export const loginUser = async (data) => {
  const response = await API.post(
    "/auth/login",
    data
  );

  return response.data;
};


/* =========================================================
   WORKERS
========================================================= */

export const getWorkers = async () => {
  const response = await API.get(
    "/citizen/workers"
  );

  return response.data;
};


/* =========================================================
   LOCATION
========================================================= */

export const updateMyLocation = async (data) => {
  const response = await API.post(
    "/location/update",
    data
  );

  return response.data;
};


export const getJobLocations = async (jobId) => {
  const response = await API.get(
    `/location/job/${jobId}`
  );

  return response.data;
};


/* =========================================================
   DEFAULT API
========================================================= */

export default API;