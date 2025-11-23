import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Check user session
export const getUser = () => API.get("/auth/user");

// Logout
export const logout = () => API.get("/auth/logout");
