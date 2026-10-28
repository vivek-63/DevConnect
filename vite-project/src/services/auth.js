import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/register", { username, email, password });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Registration failed";
    throw new Error(message);
  }
}

export async function login({ username, password }) {
  try {
    const response = await api.post("/login", { username, password });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Login failed";
    throw new Error(message);
  }
}

export async function logout() {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (err) {
    console.error("Logout error:", err);
  }
}

export async function getMe() {
  try {
    const response = await api.get("/getMe");
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function getSuggestedUsers() {
  try {
    const response = await api.get("/users/suggested");
    return response.data;
  } catch (err) {
    console.error("Error fetching suggested users:", err);
    return { users: [] };
  }
}

export default api;