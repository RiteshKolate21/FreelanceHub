import { apiFetch } from "./api.js";

export const chatService = {
  sendMessage: async (projectId, receiverId, message) => {
    return await apiFetch("/chats", {
      method: "POST",
      body: { projectId, receiverId, message }
    });
  },

  getProjectMessages: async (projectId) => {
    return await apiFetch(`/chats/${projectId}`);
  }
};
