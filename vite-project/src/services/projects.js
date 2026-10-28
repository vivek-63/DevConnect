import { api } from "./auth";

export const getProjects = async () => {
  try {
    const res = await api.get("/user/my-projects");
    return res.data;
  } catch (err) {
    console.error("Error fetching my projects:", err);
    return { projects: [] };
  }
};

export const getAllProjects = async () => {
  try {
    const res = await api.get("/projects/explore");
    return res.data;
  } catch (err) {
    console.error("Error fetching all projects:", err);
    return { projects: [] };
  }
};

export const createProject = async (data) => {
  try {
    const response = await api.post("/user/projects", data);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || "Failed to create project";
    throw new Error(message);
  }
};

export const deleteProject = async (id) => {
  try {
    const res = await api.delete(`/user/project/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting project:", err);
    throw err;
  }
};

export const updateProject = async (id, data) => {
  try {
    const res = await api.put(`/user/project/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Error updating project:", err);
    throw err;
  }
};

export const getProject = async (id) => {
  try {
    const res = await api.get(`/user/project/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching single project:", err);
    throw err;
  }
};