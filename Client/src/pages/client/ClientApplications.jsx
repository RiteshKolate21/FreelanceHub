import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationService } from "../../services/applicationService.js";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Toast } from "../../components/Toast.jsx";
import { ArrowUpRight } from "lucide-react";

export const ClientApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [toast, setToast] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getClientReceivedApplications(filterStatus === "ALL" ? "" : filterStatus);
      setApplications(res.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      await applicationService.updateStatus(appId, status);
      setToast({ message: `Application ${status.toLowerCase()} successfully`, type: "success" });
      fetchApplications();
    } catch (err) {
      setToast({ message: err.message || "Failed to update status", type: "error" });
    }
  };

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Candidate Comparison
        </span>
        <h1 style={{ marginTop: "4px" }}>Received Proposals & Bids</h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
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
        <LoadingState message="Fetching submitted proposals..." />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications found" description="There are no proposals matching this filter." />
      ) : (
        <div className="table-responsive">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Freelancer</th>
                <th>Bid Amount</th>
                <th>Est. Time</th>
                <th>Proposal Cover Letter</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <Link to={`/client/projects/${app.projectId?._id}`} style={{ fontWeight: 600, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {app.projectId?.title} <ArrowUpRight size={13} />
                    </Link>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{app.freelancerId?.username}</span>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{app.freelancerId?.email}</div>
                  </td>
                  <td style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>
                    {formatCurrency(app.bidAmount)}
                  </td>
                  <td>{app.estimatedTime} days</td>
                  <td style={{ maxWidth: "260px", fontSize: "14px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {app.proposal}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    {app.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleUpdateStatus(app._id, "Approved")}
                          className="btn btn-accent btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app._id, "Rejected")}
                          className="btn btn-secondary btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <Link to={`/client/projects/${app.projectId?._id}`} className="btn btn-secondary btn-sm">
                        Workspace
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
