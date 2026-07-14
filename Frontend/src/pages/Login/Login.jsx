import React, { useState } from "react";
import "../../styles/login.css";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router";

const Login = () => {
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    rememberDevice: false,
  });
  const navigate = useNavigate();

  const { handleLogin, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await handleLogin({
      mobile: formData.mobile,
      password: formData.password,
    });

    if (result?.success) {
      navigate("/jobs");
      return;
    }

    window.alert(result?.message || "Login failed. Please try again.");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Brand Header */}
          <header className="login-header">
            <div className="brand-icon">
              <span role="img" aria-label="PackFlow Logo">
                📲
              </span>
            </div>
            <div className="brand-text">
              <h1>P SQUARE</h1>
            </div>
          </header>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="mobile">Mobile Number</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  placeholder="Enter your Mobile Number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberDevice"
                  checked={formData.rememberDevice}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Remember device
              </label>
            </div>

            <button type="submit" className="btn-signin" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}{" "}
              <span className="arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
