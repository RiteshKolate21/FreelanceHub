import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ArrowRight, Briefcase, UserCheck } from "lucide-react";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(username, email, password, userType);
      navigate("/login", { state: { message: "Account created successfully. Please log in." } });
    } catch (err) {
      setError(err.message || "Failed to register account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="brand-logo" style={{ fontSize: "28px", justifyContent: "center" }}>
            <span className="brand-sparkle">✦</span>
            <span>FreelanceHub</span>
          </span>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
            Join our editorial freelance marketplace
          </p>
        </div>

        <div className="card-editorial">
          {error && (
            <div style={{ padding: "12px", backgroundColor: "var(--status-rejected-bg)", color: "var(--status-rejected-text)", borderRadius: "var(--radius-sm)", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">I am joining as</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div
                  onClick={() => setUserType("Client")}
                  style={{
                    border: userType === "Client" ? "2px solid var(--accent-terracotta)" : "1px solid var(--border-color)",
                    backgroundColor: userType === "Client" ? "var(--bg-subtle)" : "var(--bg-surface)",
                    padding: "16px 12px",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)", marginBottom: "4px" }}>
                    Client
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.3" }}>
                    Post projects and hire top talent.
                  </div>
                </div>

                <div
                  onClick={() => setUserType("Freelancer")}
                  style={{
                    border: userType === "Freelancer" ? "2px solid var(--accent-terracotta)" : "1px solid var(--border-color)",
                    backgroundColor: userType === "Freelancer" ? "var(--bg-subtle)" : "var(--bg-surface)",
                    padding: "16px 12px",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)", marginBottom: "4px" }}>
                    Freelancer
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.3" }}>
                    Discover projects and submit proposals.
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

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
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "20px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600, color: "var(--accent-terracotta)", textDecoration: "underline" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
