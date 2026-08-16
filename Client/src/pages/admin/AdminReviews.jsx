import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService.js";
import { RatingStars } from "../../components/RatingStars.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Toast } from "../../components/Toast.jsx";
import { Trash2 } from "lucide-react";

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReviews();
      setReviews(res.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Admin Moderation: Delete this review?")) return;
    try {
      const res = await adminService.deleteReview(reviewId);
      setToast({ message: res.message, type: "success" });
      fetchReviews();
    } catch (err) {
      setToast({ message: err.message || "Failed to delete review", type: "error" });
    }
  };

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-terracotta)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Admin Moderation
        </span>
        <h1 style={{ marginTop: "4px" }}>Reviews Moderation</h1>
      </div>

      {loading ? (
        <LoadingState message="Fetching reviews..." />
      ) : (
        <div className="table-responsive">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client (Author)</th>
                <th>Freelancer (Recipient)</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 600 }}>{r.projectId?.title}</td>
                  <td>{r.clientId?.username}</td>
                  <td>{r.freelancerId?.username}</td>
                  <td>
                    <RatingStars rating={r.rating} size={14} />
                  </td>
                  <td style={{ maxWidth: "260px", fontSize: "14px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      "{r.comment}"
                    </div>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteReview(r._id)}
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
