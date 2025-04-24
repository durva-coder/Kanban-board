import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  function handleValueChange(e) {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!user.name || !user.email || !user.password || !user.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.post("/api/auth/signup", {
        name: user.name,
        email: user.email,
        password: user.password,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        axios.defaults.headers = {
          Authorization: `Bearer ${data.token}`,
        };
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card p-4 shadow-sm"
        style={{ width: "100%", maxWidth: "450px" }}
      >
        <h3 className="text-center mb-4">Sign Up</h3>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Enter your full name"
              name="name"
              value={user.name}
              onChange={handleValueChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="signupEmail" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="signupEmail"
              placeholder="Enter your email"
              name="email"
              value={user.email}
              onChange={handleValueChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="signupPassword" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="signupPassword"
              placeholder="Create a password"
              name="password"
              value={user.password}
              onChange={handleValueChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Confirm your password"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleValueChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Sign Up
          </button>
        </form>
        <div className="text-center mt-3">
          <small>
            Already have an account? <Link to="/">Login</Link>
          </small>
        </div>
      </div>
    </div>
  );
}

export default Signup;
