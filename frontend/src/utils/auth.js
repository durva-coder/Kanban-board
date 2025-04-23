import axios from "axios";

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = async () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const { data } = await axios.get("/api/auth/is-authenticated", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.isAuthenticated;
  } catch (error) {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};
