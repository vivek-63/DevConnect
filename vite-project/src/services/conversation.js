import axios from 'axios'

export const api = axios.create({
  baseURL: "http://localhost:8080" || "https://devconnect-mvfy.onrender.com",
  withCredentials: true,
});

export const getConversations = async () => {
  try {
    const res = await api.get("/conversation");
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};
export const createConversation = async (receiverId) => {
  const res = await api.post("/conversation", {
    receiverId,
  });

  return res.data;
};

export const getMessages = async (conversationId) => {
  const res = await api.get(`/message/${conversationId}`);
  return res.data;
};


export const sendMessage = async (conversationId, content) => {
  const res = await api.post("/message", {
    conversationId,
    content,
  });

  return res.data?.message || res.data;
};

export const markMessagesAsRead = async (conversationId) => {
  const res = await api.patch(
    `/conversation/${conversationId}/read`
  );

  return res.data;
};