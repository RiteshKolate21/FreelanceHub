import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../../services/projectService.js";
import { applicationService } from "../../services/applicationService.js";
import { formatCurrency } from "../../utils/currency.js";
import { SkillTag } from "../../components/SkillTag.jsx";
import { Modal } from "../../components/Modal.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Toast } from "../../components/Toast.jsx";
import { Search, ArrowUpRight } from "lucide-react";

export const DiscoverProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  // Application Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll({
        search,
        skill: skillFilter
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
  }, [search, skillFilter]);

  const handleApplyModalOpen = (project) => {
    setSelectedProject(project);
    setBidAmount(project.budget || "");
    setEstimatedTime(7);
    setProposal("");
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    try {
      await applicationService.create({
        projectId: selectedProject._id,
        proposal,
        bidAmount: Number(bidAmount),
        estimatedTime: Number(estimatedTime)
      });
      setToast({ message: "Proposal submitted successfully!", type: "success" });
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      setToast({ message: err.message || "Failed to submit proposal", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Editorial Marketplace
        </span>
        <h1 className="font-serif" style={{ marginTop: "4px" }}>Discover Open Projects</h1>
      </div>

      {/* Filter Header Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "32px" }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search projects by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by skill (e.g. React, Node)"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Editorial Listings */}
      {loading ? (
        <LoadingState message="Scanning marketplace listings..." />
      ) : projects.length === 0 ? (
        <EmptyState title="No open projects match your search." description="Try broadening your search query or skill filter." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {projects.map((project, idx) => (
            <div key={project._id} className="editorial-project-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <span className="editorial-number">{String(idx + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 style={{ fontSize: "1.45rem", color: "var(--text-main)", fontWeight: 400, marginBottom: "4px" }}>
                      {project.title}
                    </h2>
                    <p style={{ fontSize: "13.5px", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {project.description}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: "130px" }}>
                  <div style={{ fontSize: "22px", fontFamily: "var(--font-serif)", fontWeight: 600, color: "var(--text-main)" }}>
                    {formatCurrency(project.budget)}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    FIXED PRICE
                  </div>
                  {project.deadline && (
                    <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "2px" }}>
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border-color)", marginTop: "16px" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  {project.skills?.map((s, i) => (
                    <SkillTag key={i} skill={s} />
                  ))}
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>
                    Client: <strong>{project.clientId?.username}</strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Link to={`/client/projects/${project._id}`} className="btn btn-secondary btn-sm">
                    View Project <ArrowUpRight size={13} />
                  </Link>
                  <button onClick={() => handleApplyModalOpen(project)} className="btn btn-accent btn-sm">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Proposal Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={`Submit Proposal: ${selectedProject?.title}`}>
        <form onSubmit={handleSubmitApplication}>
          <div style={{ backgroundColor: "var(--bg-subtle)", padding: "12px 16px", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Client Fixed Budget: <strong>{formatCurrency(selectedProject?.budget)}</strong>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Your Bid (₹ INR)</label>
              <input
                type="number"
                className="form-input"
                required
                placeholder={selectedProject?.budget}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Days</label>
              <input
                type="number"
                className="form-input"
                required
                placeholder="7"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">Cover Letter / Proposal</label>
            <textarea
              className="form-textarea"
              required
              placeholder="Outline your technical approach and relevant experience..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" onClick={() => setSelectedProject(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? "Submitting Proposal..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
