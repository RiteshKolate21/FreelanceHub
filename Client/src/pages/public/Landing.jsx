import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../../services/projectService.js";
import { formatCurrency } from "../../utils/currency.js";
import { SkillTag } from "../../components/SkillTag.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { ArrowRight, Briefcase, Users, ShieldCheck, Sparkles } from "lucide-react";

export const Landing = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await projectService.getAll();
        setFeaturedProjects((res.projects || []).slice(0, 3));
      } catch (err) {
        // silent fallback
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="main-content">
      {/* Editorial Hero Section */}
      <div style={{ padding: "64px 0 48px 0", borderBottom: "1px solid var(--border-color)", marginBottom: "48px" }}>
        <div style={{ maxWidth: "800px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-terracotta)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Editorial Marketplace
          </span>
          <h1 className="font-serif" style={{ fontSize: "3.5rem", lineHeight: "1.1", margin: "12px 0 20px 0" }}>
            Find talent. Find meaningful work. Build better things.
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", marginBottom: "32px", maxWidth: "640px" }}>
            FreelanceHub is a modern freelance marketplace connecting ambitious clients with skilled engineering and design professionals.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link to="/register" className="btn btn-accent btn-lg">
              Post a Project <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Discover Open Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Value Pillars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "64px" }}>
        <div className="card-editorial">
          <Briefcase size={28} color="var(--accent-terracotta)" style={{ marginBottom: "12px" }} />
          <h3 className="font-serif" style={{ marginBottom: "8px" }}>Verified Projects</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Clear project briefs, transparent fixed budgets, and defined deliverables for every engagement.
          </p>
        </div>

        <div className="card-editorial">
          <Users size={28} color="var(--accent-terracotta)" style={{ marginBottom: "12px" }} />
          <h3 className="font-serif" style={{ marginBottom: "8px" }}>Independent Talent</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Discover top-tier engineering, UI/UX, and development talent with verified portfolio feedback.
          </p>
        </div>

        <div className="card-editorial">
          <ShieldCheck size={28} color="var(--accent-terracotta)" style={{ marginBottom: "12px" }} />
          <h3 className="font-serif" style={{ marginBottom: "8px" }}>Seamless Workflow</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Integrated proposals comparison, project chat messaging, work submission, and star rating reviews.
          </p>
        </div>
      </div>

      {/* Featured Projects Preview Section */}
      {featuredProjects.length > 0 && (
        <div style={{ marginBottom: "64px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Curated Listings
              </span>
              <h2 className="font-serif" style={{ marginTop: "4px" }}>Open Marketplace Projects</h2>
            </div>
            <Link to="/register" style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-terracotta)" }}>
              View All Openings →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {featuredProjects.map((proj, idx) => (
              <div key={proj._id} className="editorial-project-card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <span className="editorial-number">{String(idx + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 style={{ fontSize: "1.4rem", color: "var(--text-main)", fontWeight: 400 }}>{proj.title}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{proj.description}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", minWidth: "120px" }}>
                    <div style={{ fontSize: "22px", fontFamily: "var(--font-serif)", fontWeight: 600, color: "var(--text-main)" }}>
                      {formatCurrency(proj.budget)}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Fixed Budget</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border-color)", marginTop: "12px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {proj.skills?.map((s, i) => (
                      <SkillTag key={i} skill={s} />
                    ))}
                  </div>

                  <Link to="/register" className="btn btn-secondary btn-sm">
                    View Project <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA Banner */}
      <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "48px 32px", textAlign: "center" }}>
        <h2 className="font-serif" style={{ fontSize: "2.25rem", marginBottom: "12px" }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 24px auto" }}>
          Join clients and freelancers on FreelanceHub today.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Link to="/register" className="btn btn-accent btn-lg">
            Create an Account
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
