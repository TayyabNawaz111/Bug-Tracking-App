// src/pages/SignUp.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config/config";

const SignUp = ({ setIsSignIn, setRoleId }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
        roleId: role,
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

      // Navigate to the dashboard after successful registration
      navigate("/dashboard");
    } catch (err) {
      console.error("Error registering user:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-blue-600">
      <div className="w-full max-w-md p-8 space-y-6 shadow-lg rounded-lg" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
        <h2 className="text-3xl font-bold text-center">
          Create an Account
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mt-1 rounded-md"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
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
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 rounded-md"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <i className={`fas fa-eye${showPassword ? "" : "-slash"}`} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 mt-1 rounded-md"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <i className={`fas fa-eye${showConfirmPassword ? "" : "-slash"}`} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium">
              Select Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 mt-1 rounded-md"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
              required
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="1">Admin</option>
              <option value="2">Developer</option>
              <option value="3">QA Tester</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
          >
            Register
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?
          <Link to="/" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
