import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = BACKEND_URL;

const token = localStorage.getItem("token");

if (token) {
  if (!axios.defaults.headers) {
    axios.defaults.headers = {};
  }
  if (!axios.defaults.headers.common) {
    axios.defaults.headers.common = {};
  }
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
