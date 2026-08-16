import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { notificationService } from "../services/notificationService.js";
import { Bell, LogOut, Menu, X } from "lucide-react";

export const Navbar = () => {
  const { user, logout, isClient, isFreelancer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const res = await notificationService.getUnreadCount();
          setUnreadCount(res.unreadCount || 0);
        } catch (e) {
          // ignore
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" onClick={closeMobileMenu} className="brand-logo">
          <span className="brand-sparkle">✦</span>
          <span>FreelanceHub</span>
        </Link>

        {user ? (
          <>
            {/* Desktop Navigation Links */}
            <nav className="nav-links">
              {isClient && (
                <>
                  <NavLink to="/client/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/client/projects" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    My Projects
                  </NavLink>
                  <NavLink to="/client/applications" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Applications
                  </NavLink>
                  <NavLink to="/freelancers" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Find Freelancers
                  </NavLink>
                </>
              )}

              {isFreelancer && (
                <>
                  <NavLink to="/freelancer/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/discover" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Discover Projects
                  </NavLink>
                  <NavLink to="/freelancer/applications" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    My Applications
                  </NavLink>
                  <NavLink to="/freelancer/work" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    My Work
                  </NavLink>
                  <NavLink to="/freelancer/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    My Profile
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <>
                  <NavLink to="/admin/overview" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Overview
                  </NavLink>
                  <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Users
                  </NavLink>
                  <NavLink to="/admin/projects" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Projects
                  </NavLink>
                  <NavLink to="/admin/reviews" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                    Reviews
                  </NavLink>
                </>
              )}
            </nav>

            <div className="nav-actions">
              <Link to="/notifications" onClick={closeMobileMenu} className="btn btn-secondary btn-sm" style={{ position: "relative", padding: "6px 10px" }}>
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      backgroundColor: "var(--accent-terracotta)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <div style={{ display: "none", alignItems: "center", gap: "8px", fontSize: "13px" }} className="desktop-user-pill">
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{user.username}</span>
                <span className="status-badge status-Open" style={{ fontSize: "10px", textTransform: "none" }}>
                  {user.userType}
                </span>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm desktop-logout-btn" title="Logout">
                <LogOut size={15} />
                <span style={{ display: "inline" }}>Logout</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-nav-toggle"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        ) : (
          <div className="nav-actions">
            <Link to="/login" className="btn btn-secondary btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-accent btn-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {user && (
        <div className={`mobile-nav-drawer ${isMobileMenuOpen ? "open" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{user.username}</span>
            <span className="status-badge status-Open">{user.userType}</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {isClient && (
              <>
                <NavLink to="/client/dashboard" onClick={closeMobileMenu} className="nav-item">Dashboard</NavLink>
                <NavLink to="/client/projects" onClick={closeMobileMenu} className="nav-item">My Projects</NavLink>
                <NavLink to="/client/applications" onClick={closeMobileMenu} className="nav-item">Applications</NavLink>
                <NavLink to="/freelancers" onClick={closeMobileMenu} className="nav-item">Find Freelancers</NavLink>
              </>
            )}

            {isFreelancer && (
              <>
                <NavLink to="/freelancer/dashboard" onClick={closeMobileMenu} className="nav-item">Dashboard</NavLink>
                <NavLink to="/discover" onClick={closeMobileMenu} className="nav-item">Discover Projects</NavLink>
                <NavLink to="/freelancer/applications" onClick={closeMobileMenu} className="nav-item">My Applications</NavLink>
                <NavLink to="/freelancer/work" onClick={closeMobileMenu} className="nav-item">My Work</NavLink>
                <NavLink to="/freelancer/profile" onClick={closeMobileMenu} className="nav-item">My Profile</NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink to="/admin/overview" onClick={closeMobileMenu} className="nav-item">Overview</NavLink>
                <NavLink to="/admin/users" onClick={closeMobileMenu} className="nav-item">Users</NavLink>
                <NavLink to="/admin/projects" onClick={closeMobileMenu} className="nav-item">Projects</NavLink>
                <NavLink to="/admin/reviews" onClick={closeMobileMenu} className="nav-item">Reviews</NavLink>
              </>
            )}
          </nav>

          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width: "100%", justifyContent: "center" }}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
