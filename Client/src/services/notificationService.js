import { apiFetch } from "./api.js";

export const notificationService = {
  getAll: async () => {
    return await apiFetch("/notifications");
  },

  getUnreadCount: async () => {
    return await apiFetch("/notifications/unread-count");
  },

  markRead: async (id) => {
    return await apiFetch(`/notifications/${id}/read`, {
      method: "PATCH"
    });
  },

  markAllRead: async () => {
    return await apiFetch("/notifications/read-all", {
      method: "PATCH"
    });
  }
};
