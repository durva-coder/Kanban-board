import { Navigate } from "react-router-dom";

export default async function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  let isValidUser;
  if (token)
    isValidUser = await fetch("/is-authenticated", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return isValidUser ? children : <Navigate to="/signup" />;
}
