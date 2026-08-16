import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { freelancerService } from "../../services/freelancerService.js";
import { RatingStars } from "../../components/RatingStars.jsx";
import { SkillTag } from "../../components/SkillTag.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Search, ArrowUpRight } from "lucide-react";

export const FreelancerDiscovery = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState("");
  const [username, setUsername] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const res = await freelancerService.getAll({
        skill,
        username,
        minRating: minRating ? Number(minRating) : "",
        page,
        limit: 10
      });
      setFreelancers(res.freelancers || []);
      setPagination(res.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [skill, username, minRating, page]);

  return (
    <div className="main-content">
      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Talent Directory
        </span>
        <h1 style={{ marginTop: "4px" }}>Freelancer Discovery</h1>
      </div>

      {/* Filter Header */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div style={{ position: "relative", flex: 2, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search freelancer by username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by skill (e.g. React, Node)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
        </div>

        <div style={{ width: "160px" }}>
          <select
            className="form-select"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
          </select>
        </div>
      </div>

      {/* Directory Cards */}
      {loading ? (
        <LoadingState message="Searching freelancer talent directory..." />
      ) : freelancers.length === 0 ? (
        <EmptyState title="No freelancers found" description="Try adjusting your search criteria." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {freelancers.map((free) => (
            <div key={free._id} className="card-editorial" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "42px", height: "42px", backgroundColor: "var(--accent-dark)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {free.userId?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 600 }}>
                      {free.userId?.username}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <RatingStars rating={free.rating} size={15} />
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{free.experience || "Experienced Professional"}</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {free.bio || "No summary provided."}
                </p>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {free.skills?.map((s, idx) => (
                    <SkillTag key={idx} skill={s} />
                  ))}
                </div>
              </div>

              <Link to={`/freelancers/${free.userId?._id}`} className="btn btn-secondary btn-sm">
                View Portfolio <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ padding: "6px 12px", fontSize: "14px", color: "var(--text-muted)" }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
