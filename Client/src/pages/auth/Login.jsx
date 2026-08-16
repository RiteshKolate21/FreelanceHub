import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ArrowRight } from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      const userType = data.user?.userType;
      if (userType === "Client") navigate("/client/dashboard");
      else if (userType === "Freelancer") navigate("/freelancer/dashboard");
      else if (userType === "Admin") navigate("/admin/overview");
      else navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials or account disabled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="brand-logo" style={{ fontSize: "28px", justifyContent: "center" }}>
            <span className="brand-sparkle">✦</span>
            <span>FreelanceHub</span>
          </span>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
            Sign in to access your editorial workspace
          </p>
        </div>

        <div className="card-editorial">
          {error && (
            <div style={{ padding: "12px", backgroundColor: "var(--status-rejected-bg)", color: "var(--status-rejected-text)", borderRadius: "var(--radius-sm)", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "20px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: 600, color: "var(--accent-terracotta)", textDecoration: "underline" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
