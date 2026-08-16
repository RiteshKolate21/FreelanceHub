import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationService } from "../../services/applicationService.js";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { ArrowUpRight } from "lucide-react";

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await applicationService.getMyApplications(filterStatus === "ALL" ? "" : filterStatus);
        setApplications(res.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [filterStatus]);

  return (
    <div className="main-content">
      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Proposal Tracker
        </span>
        <h1 className="font-serif" style={{ marginTop: "4px" }}>My Submitted Applications</h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["ALL", "Pending", "Approved", "Rejected"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`btn btn-sm ${filterStatus === st ? "btn-dark" : "btn-secondary"}`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Fetching submitted applications..." />
      ) : applications.length === 0 ? (
        <EmptyState title="You haven't submitted any proposals yet." description="Browse open marketplace projects to start submitting proposals." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {applications.map((app) => (
            <div key={app._id} className="editorial-project-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <StatusBadge status={app.status} />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Submitted {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--text-main)" }}>
                    {app.projectId?.title}
                  </h3>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "20px", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
                    {formatCurrency(app.bidAmount)}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Est. {app.estimatedTime} days
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "var(--bg-subtle)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-main)" }}>"{app.proposal}"</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Client: <strong>{app.projectId?.clientId?.username}</strong>
                </span>

                <Link to={`/client/projects/${app.projectId?._id}`} className="btn btn-secondary btn-sm">
                  View Project <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
