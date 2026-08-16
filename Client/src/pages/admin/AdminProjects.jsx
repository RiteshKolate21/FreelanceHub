import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService.js";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Toast } from "../../components/Toast.jsx";
import { Search, Trash2, ArrowUpRight } from "lucide-react";

export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProjects({
        status: statusFilter === "ALL" ? "" : statusFilter,
        search
      });
      setProjects(res.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, search]);

  const handleDeleteProject = async (projectId, title) => {
    if (!window.confirm(`Admin Moderation: Are you sure you want to permanently delete project "${title}"?`)) return;
    try {
      await adminService.deleteProject(projectId);
      setToast({ message: "Project deleted by admin moderation", type: "success" });
      fetchProjects();
    } catch (err) {
      setToast({ message: err.message || "Failed to delete project", type: "error" });
    }
  };

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-terracotta)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Admin Moderation
        </span>
        <h1 style={{ marginTop: "4px" }}>Project Moderation Console</h1>
      </div>

      {/* Filter Header */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "Open", "In Progress", "Submitted", "Completed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? "btn-dark" : "btn-secondary"}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching project database..." />
      ) : (
        <div className="table-responsive">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Client</th>
                <th>Freelancer</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/client/projects/${p._id}`} style={{ fontWeight: 600, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {p.title} <ArrowUpRight size={13} />
                    </Link>
                  </td>
                  <td>{p.clientId?.username}</td>
                  <td>{p.freelancerId?.username || "Unassigned"}</td>
                  <td style={{ fontSize: "16px", fontWeight: 700 }}>
                    {formatCurrency(p.budget)}
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteProject(p._id, p.title)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
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
