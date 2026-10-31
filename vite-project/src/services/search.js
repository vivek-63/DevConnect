import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080" || import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const globalSearch = async (query) => {
  const res = await api.get("/search", {
    params: {
      q: query,
    },
  });

  return res.data;
};

export const discoverDevelopers = async ({ q, skill, college, designation } = {}) => {
  const res = await api.get("/discover/users", {
    params: { q, skill, college, designation },
  });
  return res.data;
};