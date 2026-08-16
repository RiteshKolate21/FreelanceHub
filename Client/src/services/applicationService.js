import { apiFetch } from "./api.js";

export const applicationService = {
  create: async (appData) => {
    return await apiFetch("/applications", {
      method: "POST",
      body: appData
    });
  },

  getProjectApplications: async (projectId, status = "") => {
    const query = status ? `?status=${status}` : "";
    return await apiFetch(`/applications/project/${projectId}${query}`);
  },

  getMyApplications: async (status = "") => {
    const query = status ? `?status=${status}` : "";
    return await apiFetch(`/applications/my-applications${query}`);
  },

  getClientReceivedApplications: async (status = "") => {
    const query = status ? `?status=${status}` : "";
    return await apiFetch(`/applications/client-received${query}`);
  },

  getById: async (id) => {
    return await apiFetch(`/applications/${id}`);
  },

  updateStatus: async (applicationId, status) => {
    return await apiFetch(`/applications/${applicationId}/status`, {
      method: "PATCH",
      body: { status }
    });
  }
};
