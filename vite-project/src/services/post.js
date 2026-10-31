import axios from 'axios'

export const api = axios.create({
    baseURL: "http://localhost:8080" || import.meta.env.VITE_API_URL,
    withCredentials: true,
});

export const createPost =
    async (data) => {

        const res =
            await api.post(
                "/posts",
                data
            );
        console.log(res.data);
        return res.data;
    };

export const getFeed =
    async () => {

        const res =
            await api.get(
                "/feed"
            );

        return res.data;
    };

export const getuserPosts =
    async () => {

        const res =
            await api.get(
                "/posts/user"
            );
        console.log(res.data);

        return res.data;
    };


export const deletePost = async (id) => {
    try {
        const res = await api.delete(`/post/${id}`);
        return res.data;
    } catch (err) {
        console.log(err);
    }
}

export const updatePost = async (id, data) => {
    try {
        const res = await api.put(`/posts/${id}`, data);
        return res.data;
    } catch (err) {
        console.log(err);
    }
}
export const getPost =
    async (id) => {

        const res =
            await api.get(
                `/posts/${id}`
            );

        return res.data;
    };

export const likePost = async (id) => {
    const res = await api.post(`/post/${id}/like`);
    return res.data;
}

export const unlikePost = async (id) => {
    const res = await api.delete(`/post/${id}/unlike`);
    return res.data;
}

export const savePost = async (id) => {
    const res = await api.post(`/posts/${id}/save`);
    return res.data;
};

export const unsavePost = async (id) => {
    const res = await api.delete(`/posts/${id}/save`);
    return res.data;
};

export const getSavedPosts = async () => {
    const res = await api.get("/posts/saved");
    return res.data;
}; 