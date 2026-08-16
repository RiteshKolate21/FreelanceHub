import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { freelancerService } from "../../services/freelancerService.js";
import { reviewService } from "../../services/reviewService.js";
import { RatingStars } from "../../components/RatingStars.jsx";
import { SkillTag } from "../../components/SkillTag.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Star, Mail, Briefcase, Award, CheckCircle2 } from "lucide-react";

export const FreelancerProfileView = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const freeRes = await freelancerService.getProfile(userId);
        setProfile(freeRes.freelancer);

        const revRes = await reviewService.getFreelancerReviews(userId);
        setReviewsData(revRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <LoadingState message="Loading portfolio profile..." />;
  if (!profile) return <div className="main-content"><p>Freelancer profile not found.</p></div>;

  return (
    <div className="main-content">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Portfolio Card Header */}
        <div className="card-editorial" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "72px", height: "72px", backgroundColor: "var(--accent-dark)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontFamily: "var(--font-serif)" }}>
                {profile.userId?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-serif" style={{ fontSize: "2.2rem", lineHeight: "1.1" }}>{profile.userId?.username}</h1>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--accent-terracotta)", marginTop: "2px" }}>
                  {profile.experience || "Full Stack Developer"}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                  <RatingStars rating={profile.rating} size={16} />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    ({reviewsData?.count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "var(--status-open-bg)", color: "var(--status-open-text)", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600 }}>
              <span style={{ width: "8px", height: "8px", backgroundColor: "var(--status-open-text)", borderRadius: "50%", display: "inline-block" }}></span>
              Available for work
            </div>
          </div>

          <div style={{ padding: "16px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              Email Contact
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--text-main)", fontWeight: 500 }}>
              {profile.userId?.email}
            </div>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>About</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", whiteSpace: "pre-line", marginBottom: "24px" }}>
            {profile.bio || "No biography provided."}
          </p>

          <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "10px", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            Tech Stack & Skills
          </h3>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {profile.skills?.map((s, idx) => (
              <SkillTag key={idx} skill={s} />
            ))}
          </div>
        </div>

        {/* Client Reviews Section */}
        <div className="card-editorial">
          <h2 className="font-serif" style={{ fontSize: "1.6rem", marginBottom: "20px" }}>
            Client Feedback & Reviews ({reviewsData?.count || 0})
          </h2>

          {reviewsData?.reviews?.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              No reviews left yet for this freelancer.
            </p>
          ) : (
            reviewsData?.reviews?.map((rev) => (
              <div key={rev._id} style={{ padding: "16px 0", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "14px" }}>
                      Project: {rev.projectId?.title}
                    </span>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Reviewed by {rev.clientId?.username} on {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <RatingStars rating={rev.rating} size={15} />
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-main)", fontStyle: "italic" }}>
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
