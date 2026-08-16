import { apiFetch } from "./api.js";

export const adminService = {
  getStats: async () => {
    return await apiFetch("/admin/stats");
  },

  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/admin/users${query ? `?${query}` : ""}`);
  },

  toggleUserStatus: async (userId) => {
    return await apiFetch(`/admin/users/${userId}/status`, {
      method: "PATCH"
    });
  },

  getProjects: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/admin/projects${query ? `?${query}` : ""}`);
  },

  deleteProject: async (projectId) => {
    return await apiFetch(`/admin/projects/${projectId}`, {
      method: "DELETE"
    });
  },

  getApplications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/admin/applications${query ? `?${query}` : ""}`);
  },

  getReviews: async () => {
    return await apiFetch("/admin/reviews");
  },

  deleteReview: async (reviewId) => {
    return await apiFetch(`/admin/reviews/${reviewId}`, {
      method: "DELETE"
    });
  }
};
