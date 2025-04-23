import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = unknown, true = authenticated, false = unauthenticated
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation(); // Get current route for redirect

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // Early exit if no token
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Optional: Basic token format validation (e.g., JWT)
      if (!token.match(/^[\w-]+\.[\w-]+\.[\w-]+$/)) {
        console.warn("Invalid token format");
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await axios.get("/api/auth/is-authenticated", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data?.isAuthenticated && data?.user) {
          setIsAuthenticated(true);
          // Store minimal user data (avoid sensitive info)
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: data.user.id,
              username: data.user.username, // Only store non-sensitive fields
            })
          );
        } else {
          throw new Error("Invalid authentication response");
        }
      } catch (error) {
        console.error("Authentication error:", error.message);
        setIsAuthenticated(false);
        // Only clear storage for auth-related errors (e.g., 401, 403)
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        // For network errors, keep token to retry on next mount
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // No dependencies to avoid rechecking on every render

  // Optional: Listen for token changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue) {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}
