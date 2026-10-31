import axios from 'axios'

export const api = axios.create({
  baseURL: "http://localhost:8080" || import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const getProfile =
  async () => {
    try {
      const res =
        await api.get("/profile");

      return res.data;
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }

  };

export const updateProfile =
  async (data) => {
    try {
      const res =
        await api.put(
          "/profile/edit",
          data
        );

      return res.data;
    } catch (err) {
      console.log(err);
    }

  };

export const getPublicProfile =
  async (username) => {

    const res =
      await api.get(
        `/profile/${username}`
      );

    return res.data;
  };