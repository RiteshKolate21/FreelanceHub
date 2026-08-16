import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService.js";
import { projectService } from "../../services/projectService.js";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { SkillTag } from "../../components/SkillTag.jsx";
import { Modal } from "../../components/Modal.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Plus, ArrowUpRight, Clock, Users, Briefcase, UserCheck } from "lucide-react";

export const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getClientDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await projectService.create({
        title,
        description,
        budget: Number(budget),
        skills,
        deadline: deadline || null
      });

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setBudget("");
      setSkillsInput("");
      setDeadline("");
      fetchDashboard();
    } catch (err) {
      alert(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Assembling client workspace..." />;

  const { metrics, projects } = data || {};

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Client Workspace
          </span>
          <h1 className="font-serif" style={{ marginTop: "4px" }}>Project Console</h1>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/freelancers" className="btn btn-secondary">
            <UserCheck size={16} />
            Find Freelancers
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-accent">
            <Plus size={16} />
            Post a Project
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="editorial-stats">
        <div className="stat-box">
          <div className="stat-value">{metrics?.totalProjects || 0}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: "var(--status-open-text)" }}>{metrics?.openProjectsCount || 0}</div>
          <div className="stat-label">Open for Bids</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: "var(--status-progress-text)" }}>{metrics?.inProgressProjectsCount || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: "var(--status-submitted-text)" }}>{metrics?.submittedProjectsCount || 0}</div>
          <div className="stat-label">Submitted Work</div>
        </div>
      </div>

      {/* Split Editorial Sections */}
      <div className="split-view">
        {/* Left Column: Active & Created Projects */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 className="font-serif">Active Projects</h3>
            <Link to="/client/projects" style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-terracotta)", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {projects?.all?.length === 0 ? (
            <div className="card-editorial" style={{ textAlign: "center", padding: "40px 20px" }}>
              <Briefcase size={32} color="var(--text-light)" style={{ marginBottom: "8px" }} />
              <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                No projects posted yet. Create your first project to receive proposals from skilled talent.
              </p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-accent btn-sm">
                Post a Project
              </button>
            </div>
          ) : (
            projects?.all?.slice(0, 5).map((project) => (
              <div key={project._id} className="editorial-project-card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <StatusBadge status={project.status} />
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Budget: {formatCurrency(project.budget)}</span>
                    </div>
                    <Link to={`/client/projects/${project._id}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--text-main)" }}>{project.title}</h3>
                    </Link>
                  </div>
                  <Link to={`/client/projects/${project._id}`} className="btn btn-secondary btn-sm">
                    Workspace <ArrowUpRight size={14} />
                  </Link>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {project.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {project.skills?.slice(0, 3).map((s, idx) => (
                      <SkillTag key={idx} skill={s} />
                    ))}
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span>{project.applicationCount || 0} Applications</span>
                    {project.freelancerId && (
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        Assigned: {project.freelancerId.username}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Attention Needed */}
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h3 className="font-serif" style={{ marginBottom: "16px" }}>Action Required</h3>

            {projects?.submitted?.length > 0 && (
              <div style={{ backgroundColor: "var(--status-submitted-bg)", border: "1px solid #C7D2FE", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--status-submitted-text)", fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>
                  <Clock size={16} />
                  <span>Work Submitted for Review</span>
                </div>
                <p style={{ fontSize: "13px", color: "#3730A3", marginBottom: "12px" }}>
                  {projects.submitted.length} project(s) submitted by freelancers waiting for your completion approval.
                </p>
                <Link to={`/client/projects/${projects.submitted[0]._id}`} className="btn btn-primary btn-sm">
                  Review Deliverable
                </Link>
              </div>
            )}

            {projects?.withApplications?.length > 0 && (
              <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", padding: "16px", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>
                  <Users size={16} color="var(--accent-terracotta)" />
                  <span>Pending Proposals</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Review received freelancer proposals and select an approved candidate.
                </p>
                <Link to="/client/applications" className="btn btn-secondary btn-sm">
                  Compare Proposals
                </Link>
              </div>
            )}

            {projects?.submitted?.length === 0 && projects?.withApplications?.length === 0 && (
              <div className="card-editorial">
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>All active projects are running smoothly with no pending actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post a New Project">
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project Brief Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Build a Responsive Portfolio Website"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Scope</label>
            <textarea
              className="form-textarea"
              required
              placeholder="Describe deliverables, required technical stack, and project scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Fixed Budget (₹ INR)</label>
              <input
                type="number"
                className="form-input"
                required
                placeholder="15000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">Required Skills (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="React, Node.js, MongoDB"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
