import React, { useState, useEffect } from "react";
import { freelancerService } from "../../services/freelancerService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Toast } from "../../components/Toast.jsx";
import { RatingStars } from "../../components/RatingStars.jsx";
import { User, Save, Sparkles } from "lucide-react";

export const FreelancerProfileEdit = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await freelancerService.getProfile(user.id);
        if (res.freelancer) {
          setProfile(res.freelancer);
          setSkillsInput((res.freelancer.skills || []).join(", "));
          setExperience(res.freelancer.experience || "");
          setBio(res.freelancer.bio || "");
          setIsExisting(true);
        }
      } catch (err) {
        setIsExisting(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (isExisting) {
        await freelancerService.updateProfile({ skills, experience, bio });
      } else {
        await freelancerService.createProfile({ skills, experience, bio });
        setIsExisting(true);
      }
      setToast({ message: "Portfolio profile saved successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Failed to save profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading portfolio settings..." />;

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Portfolio Profile
          </span>
          <h1 className="font-serif" style={{ marginTop: "4px" }}>Freelancer Portfolio</h1>
        </div>

        <div className="card-editorial">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ width: "54px", height: "54px", backgroundColor: "var(--accent-dark)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 600 }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: "1.4rem" }}>{user.username}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <RatingStars rating={profile?.rating || 0} size={16} />
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Professional Summary & Bio</label>
              <textarea
                className="form-textarea"
                required
                style={{ minHeight: "120px" }}
                placeholder="Introduce yourself, your background, and your key specialties..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. 5+ years building full-stack web applications"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "28px" }}>
              <label className="form-label">Skills & Tech Stack (Comma separated)</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="React, TypeScript, Express, MongoDB, Node.js, GraphQL"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-accent btn-lg" style={{ width: "100%" }} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving Portfolio..." : "Save Portfolio Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
