const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const getAuthToken = () => {
  return localStorage.getItem("fh_token");
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("fh_token", token);
  } else {
    localStorage.removeItem("fh_token");
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "An unexpected error occurred");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
