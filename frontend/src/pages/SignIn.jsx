import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/config";

const SignIn = ({ setIsSignIn, setRoleId }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password,
      });

      const { token, roleId } = response.data;
      let userId = response.data.userId || response.data.id;

      if (!userId && token) {
        try {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const decoded = JSON.parse(atob(payloadBase64));
            userId = decoded.userId || decoded.id;
          }
        } catch (e) {
          console.error("Error decoding token for userId", e);
        }
      }

      localStorage.setItem("token", token);
      localStorage.setItem("roleId", roleId);
      if (userId) {
        localStorage.setItem("userId", userId);
      }
      setIsSignIn(true);
      setRoleId(parseInt(roleId));
      setError(null);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-blue-600">
      <div className="w-full max-w-md p-8 space-y-6 shadow-lg rounded-lg" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
        <h2 className="text-3xl font-bold text-center">Login</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 rounded-md"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 rounded-md"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <i
                className={`fas fa-eye${
                  showPassword ? "" : "-slash"
                } mt-6`}
                style={{ color: "var(--text-primary)" }}
              ></i>
            </button>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4">
          Don't have an account?
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
