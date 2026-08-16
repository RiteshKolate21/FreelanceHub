import { apiFetch, setAuthToken } from "./api.js";

export const authService = {
  login: async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password }
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (username, email, password, userType) => {
    return await apiFetch("/auth/register", {
      method: "POST",
      body: { username, email, password, userType }
    });
  },

  getMe: async () => {
    return await apiFetch("/auth/me");
  },

  logout: () => {
    setAuthToken(null);
  }
};
