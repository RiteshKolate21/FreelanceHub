import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../../services/dashboardService.js";
import { projectService } from "../../services/projectService.js";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { SkillTag } from "../../components/SkillTag.jsx";
import { Modal } from "../../components/Modal.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Plus, Search, ArrowUpRight, Trash2 } from "lucide-react";

export const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getClientDashboard();
      setProjects(data.projects?.all || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete open project "${title}"?`)) return;
    try {
      await projectService.delete(id);
      fetchProjects();
    } catch (err) {
      alert(err.message || "Failed to delete project");
    }
  };

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
      fetchProjects();
    } catch (err) {
      alert(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="main-content">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Management
          </span>
          <h1 className="font-serif" style={{ marginTop: "4px" }}>My Created Projects</h1>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-accent">
          <Plus size={16} />
          Post Project
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["ALL", "Open", "In Progress", "Submitted", "Completed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? "btn-dark" : "btn-secondary"}`}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px", fontSize: "13px" }}
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching project directory..." />
      ) : filteredProjects.length === 0 ? (
        <EmptyState title="No projects found" description="No projects matching your search filter." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="editorial-project-card"
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr auto",
                alignItems: "center",
                gap: "20px",
                marginBottom: 0
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <StatusBadge status={project.status} />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Link to={`/client/projects/${project._id}`} style={{ textDecoration: "none" }}>
                  <h3 style={{ fontSize: "1.2rem", color: "var(--text-main)", fontWeight: 500 }}>{project.title}</h3>
                </Link>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  {project.skills?.map((s, idx) => (
                    <SkillTag key={idx} skill={s} />
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Budget
                </div>
                <div style={{ fontSize: "18px", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
                  {formatCurrency(project.budget)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Assigned Freelancer
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-main)", fontWeight: 500 }}>
                  {project.freelancerId ? project.freelancerId.username : "Unassigned"}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link to={`/client/projects/${project._id}`} className="btn btn-secondary btn-sm">
                  Workspace <ArrowUpRight size={14} />
                </Link>
                {project.status === "Open" && (
                  <button
                    onClick={() => handleDelete(project._id, project.title)}
                    className="btn btn-danger btn-sm"
                    title="Delete Open Project"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post a New Project">
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Build a Portfolio Website"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Scope</label>
            <textarea
              className="form-textarea"
              required
              placeholder="Describe deliverables and requirements..."
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
