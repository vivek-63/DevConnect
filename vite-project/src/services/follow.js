import { api } from "./auth";

export const followUser = async (id) => {
  try {
    const res = await api.post(`/follow/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error following user:", err);
    throw err;
  }
};

export const unfollowUser = async (id) => {
  try {
    const res = await api.delete(`/follow/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error unfollowing user:", err);
    throw err;
  }
};

export const checkFollowStatus = async (id) => {
  try {
    const res = await api.get(`/follow/status/${id}`);
    return res.data?.isFollowing || false;
  } catch (err) {
    return false;
  }
};

export const getFollowers = async (id) => {
  try {
    const res = await api.get(`/users/${id}/followers`);
    return res.data?.followers || [];
  } catch (err) {
    console.error("Error fetching followers:", err);
    return [];
  }
};

export const getFollowing = async (id) => {
  try {
    const res = await api.get(`/users/${id}/following`);
    return res.data?.following || [];
  } catch (err) {
    console.error("Error fetching following:", err);
    return [];
  }
};