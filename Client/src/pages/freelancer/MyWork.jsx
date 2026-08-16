import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService.js";
import { projectService } from "../../services/projectService.js";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { SkillTag } from "../../components/SkillTag.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Toast } from "../../components/Toast.jsx";
import { ArrowUpRight, Send } from "lucide-react";

export const MyWork = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [toast, setToast] = useState(null);

  const fetchWork = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getFreelancerDashboard();
      setProjects(res.projects?.all || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, []);

  const handleSubmitWork = async (projectId, title) => {
    if (!window.confirm(`Submit completed work for project "${title}"?`)) return;
    try {
      await projectService.submit(projectId);
      setToast({ message: "Work submitted successfully for client review!", type: "success" });
      fetchWork();
    } catch (err) {
      setToast({ message: err.message || "Failed to submit work", type: "error" });
    }
  };

  const filteredProjects = projects.filter((p) => filterStatus === "ALL" || p.status === filterStatus);

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Deliverables
        </span>
        <h1 className="font-serif" style={{ marginTop: "4px" }}>My Work Management</h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["ALL", "In Progress", "Submitted", "Completed"].map((st) => (
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
        <LoadingState message="Fetching assigned project work..." />
      ) : filteredProjects.length === 0 ? (
        <EmptyState title="No assigned work found" description="No projects matching this status filter." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredProjects.map((project) => (
            <div key={project._id} className="editorial-project-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <StatusBadge status={project.status} />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Client: {project.clientId?.username}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.3rem", color: "var(--text-main)" }}>{project.title}</h3>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
                    {formatCurrency(project.budget)}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {project.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {project.skills?.map((s, idx) => (
                    <SkillTag key={idx} skill={s} />
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link to={`/client/projects/${project._id}`} className="btn btn-secondary btn-sm">
                    Workspace <ArrowUpRight size={14} />
                  </Link>

                  {project.status === "In Progress" && (
                    <button
                      onClick={() => handleSubmitWork(project._id, project.title)}
                      className="btn btn-accent btn-sm"
                    >
                      <Send size={14} />
                      Submit Work
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
