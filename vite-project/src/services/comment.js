import axios from 'axios'

export const api = axios.create({
    baseURL: "http://localhost:8080" || import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export const getComments = async (id) => {
    try {
        const res = await api.get(`/posts/${id}/comments`);
        return res.data;
    } catch (err) {
        console.log(err);
    }
}

export const createComment = async (id, data) => {
    try {
        const res = await api.post(`/posts/${id}/comments`, data);
        return res.data;
    } catch (err) {
        console.log(err);
    }
}

export const deleteComment = async (id) => {
    try {
        const res = await api.delete(`/comment/${id}`);
        return res.data;
    } catch (err) {
        console.log(err);
    }
}