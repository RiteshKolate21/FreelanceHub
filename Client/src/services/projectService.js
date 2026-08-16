import { apiFetch } from "./api.js";

export const projectService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/projects${query ? `?${query}` : ""}`);
  },

  getById: async (id) => {
    return await apiFetch(`/projects/${id}`);
  },

  create: async (projectData) => {
    return await apiFetch("/projects", {
      method: "POST",
      body: projectData
    });
  },

  update: async (id, projectData) => {
    return await apiFetch(`/projects/${id}`, {
      method: "PUT",
      body: projectData
    });
  },

  delete: async (id) => {
    return await apiFetch(`/projects/${id}`, {
      method: "DELETE"
    });
  },

  submit: async (projectId) => {
    return await apiFetch(`/projects/${projectId}/submit`, {
      method: "PATCH"
    });
  },

  complete: async (projectId) => {
    return await apiFetch(`/projects/${projectId}/complete`, {
      method: "PATCH"
    });
  }
};
