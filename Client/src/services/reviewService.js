import { apiFetch } from "./api.js";

export const reviewService = {
  create: async (projectId, rating, comment) => {
    return await apiFetch("/reviews", {
      method: "POST",
      body: { projectId, rating, comment }
    });
  },

  getFreelancerReviews: async (freelancerId) => {
    return await apiFetch(`/reviews/freelancer/${freelancerId}`);
  },

  getProjectReview: async (projectId) => {
    return await apiFetch(`/reviews/project/${projectId}`);
  }
};
