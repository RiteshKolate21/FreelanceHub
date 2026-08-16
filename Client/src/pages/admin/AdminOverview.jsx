import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService.js";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Users, Briefcase, FileText, Star, ShieldAlert } from "lucide-react";

export const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        setStats(res.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Loading platform stats console..." />;

  return (
    <div className="main-content">
      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent-terracotta)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldAlert size={14} /> Operations Console
        </span>
        <h1 className="font-serif" style={{ marginTop: "4px" }}>Admin Platform Overview</h1>
      </div>

      {/* Stats Cards Grid */}
      <div className="editorial-stats">
        <div className="stat-box">
          <div className="stat-value">{stats?.users?.total || 0}</div>
          <div className="stat-label">Total Users</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {stats?.users?.clients || 0} Clients • {stats?.users?.freelancers || 0} Freelancers
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats?.projects?.total || 0}</div>
          <div className="stat-label">Total Projects</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {stats?.projects?.open || 0} Open • {stats?.projects?.inProgress || 0} In Progress
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats?.applications?.total || 0}</div>
          <div className="stat-label">Total Applications</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {stats?.applications?.approved || 0} Approved
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-value">{stats?.reviews?.total || 0}</div>
          <div className="stat-label">Completed Reviews</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <div className="card-editorial">
          <Users size={24} style={{ marginBottom: "12px", color: "var(--text-main)" }} />
          <h3 style={{ fontSize: "1.2rem", marginBottom: "6px" }}>User Management</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Moderate user accounts, review roles, and disable problematic accounts.
          </p>
          <Link to="/admin/users" className="btn btn-primary btn-sm">
            Manage Users
          </Link>
        </div>

        <div className="card-editorial">
          <Briefcase size={24} style={{ marginBottom: "12px", color: "var(--text-main)" }} />
          <h3 style={{ fontSize: "1.2rem", marginBottom: "6px" }}>Project Moderation</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Review all platform projects and moderate inappropriate listings.
          </p>
          <Link to="/admin/projects" className="btn btn-primary btn-sm">
            Moderate Projects
          </Link>
        </div>

        <div className="card-editorial">
          <Star size={24} style={{ marginBottom: "12px", color: "var(--text-main)" }} />
          <h3 style={{ fontSize: "1.2rem", marginBottom: "6px" }}>Review Moderation</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Inspect client reviews and remove abusive content.
          </p>
          <Link to="/admin/reviews" className="btn btn-primary btn-sm">
            Moderate Reviews
          </Link>
        </div>
      </div>
    </div>
  );
};
