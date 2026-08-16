import { apiFetch } from "./api.js";

export const freelancerService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/freelancers${query ? `?${query}` : ""}`);
  },

  getProfile: async (userId) => {
    return await apiFetch(`/freelancers/${userId}`);
  },

  createProfile: async (profileData) => {
    return await apiFetch("/freelancers", {
      method: "POST",
      body: profileData
    });
  },

  updateProfile: async (profileData) => {
    return await apiFetch("/freelancers", {
      method: "PUT",
      body: profileData
    });
  }
};
