import { apiFetch } from "./api.js";

export const dashboardService = {
  getFreelancerDashboard: async () => {
    return await apiFetch("/dashboard/freelancer");
  },

  getClientDashboard: async () => {
    return await apiFetch("/dashboard/client");
  }
};
