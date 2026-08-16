import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService.js";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { RatingStars } from "../../components/RatingStars.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { ArrowUpRight, Briefcase, ArrowRight } from "lucide-react";

export const FreelancerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getFreelancerDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Assembling freelancer console..." />;

  const { profile, metrics, projects, reviews } = data || {};

  return (
    <div className="main-content">
      {/* Top Banner */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Freelancer Console
          </span>
          <h1 className="font-serif" style={{ marginTop: "4px" }}>Welcome Back, {profile?.userId?.username || "Freelancer"}</h1>
        </div>

        <Link to="/discover" className="btn btn-accent btn-lg">
          <Briefcase size={18} />
          Discover Projects
        </Link>
      </div>

      {/* Primary Highlight Card: Earnings & Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: "24px", marginBottom: "32px" }}>
        <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", padding: "28px", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            Total Earnings
          </div>
          <div style={{ fontSize: "3rem", fontFamily: "var(--font-serif)", fontWeight: 400, color: "var(--accent-terracotta)", lineHeight: "1" }}>
            {formatCurrency(metrics?.totalEarnings || 0)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
            Based on {metrics?.completedProjectsCount || 0} completed client engagements
          </div>
        </div>

        <div className="editorial-stats" style={{ marginBottom: 0 }}>
          <div className="stat-box">
            <div className="stat-value">{metrics?.inProgressProjectsCount || 0}</div>
            <div className="stat-label">Active Projects</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{metrics?.totalApplications || 0}</div>
            <div className="stat-label">Applications</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{metrics?.pendingApplicationsCount || 0}</div>
            <div className="stat-label">Pending Bids</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <RatingStars rating={metrics?.averageRating || 0} size={18} />
            </div>
            <div className="stat-label">Rating ({metrics?.reviewsCount || 0})</div>
          </div>
        </div>
      </div>

      {/* Split Editorial Layout */}
      <div className="split-view">
        {/* Left Column: Assigned & Active Work */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 className="font-serif">Active Assigned Work</h3>
            <Link to="/freelancer/work" style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-terracotta)", display: "flex", alignItems: "center", gap: "4px" }}>
              View All Work <ArrowUpRight size={14} />
            </Link>
          </div>

          {projects?.all?.length === 0 ? (
            <div className="card-editorial" style={{ textAlign: "center", padding: "40px 20px" }}>
              <Briefcase size={32} color="var(--text-light)" style={{ marginBottom: "8px" }} />
              <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                Your next client is somewhere in the marketplace.
              </p>
              <Link to="/discover" className="btn btn-accent btn-sm">
                Browse Projects <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            projects?.all?.slice(0, 4).map((project) => (
              <div key={project._id} className="editorial-project-card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <StatusBadge status={project.status} />
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Client: {project.clientId?.username}</span>
                    </div>
                    <Link to={`/client/projects/${project._id}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>{project.title}</h3>
                    </Link>
                  </div>
                  <Link to={`/client/projects/${project._id}`} className="btn btn-secondary btn-sm">
                    Workspace <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-color)", marginTop: "12px" }}>
                  <span style={{ fontSize: "15px", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
                    {formatCurrency(project.budget)}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Feedback & Ratings */}
        <div>
          <h3 className="font-serif" style={{ marginBottom: "16px" }}>Client Feedback</h3>

          {reviews?.length === 0 ? (
            <div className="card-editorial">
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Complete your first project to start building your reputation.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="card-editorial" style={{ marginBottom: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "13px" }}>
                    {rev.projectId?.title}
                  </span>
                  <RatingStars rating={rev.rating} size={14} />
                </div>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "var(--text-main)", marginBottom: "8px" }}>
                  "{rev.comment}"
                </p>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  By {rev.clientId?.username} on {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
