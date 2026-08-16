import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { projectService } from "../../services/projectService.js";
import { applicationService } from "../../services/applicationService.js";
import { reviewService } from "../../services/reviewService.js";
import { chatService } from "../../services/chatService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { SkillTag } from "../../components/SkillTag.jsx";
import { RatingStars } from "../../components/RatingStars.jsx";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Modal } from "../../components/Modal.jsx";
import { Toast } from "../../components/Toast.jsx";
import { CheckCircle2, Send, Star } from "lucide-react";

export const ProjectDetail = () => {
  const { id } = useParams();
  const { user, isClient, isFreelancer } = useAuth();

  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [review, setReview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proposal State for Freelancer
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [myApp, setMyApp] = useState(null);
  const [submittingApp, setSubmittingApp] = useState(false);

  // Review State for Client
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Feedback Toast
  const [toast, setToast] = useState(null);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const projRes = await projectService.getById(id);
      const proj = projRes.project;
      setProject(proj);

      // If client, fetch applications for this project
      if (isClient && proj.clientId?._id === user.id) {
        const appRes = await applicationService.getProjectApplications(id);
        setApplications(appRes.applications || []);
      }

      // If freelancer, check if user applied
      if (isFreelancer) {
        const myAppsRes = await applicationService.getMyApplications();
        const existing = myAppsRes.applications?.find((a) => a.projectId?._id === id);
        if (existing) setMyApp(existing);
      }

      // Fetch review if completed
      if (proj.status === "Completed") {
        const revRes = await reviewService.getProjectReview(id);
        setReview(revRes.review);
      }

      // Fetch chat messages if assigned freelancer or client
      const isParticipant =
        proj.clientId?._id === user.id || (proj.freelancerId && proj.freelancerId._id === user.id);
      if (isParticipant) {
        const chatRes = await chatService.getProjectMessages(id);
        setMessages(chatRes.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, user.id]);

  // Handle Application Submit (Freelancer)
  const handleApply = async (e) => {
    e.preventDefault();
    setSubmittingApp(true);
    try {
      await applicationService.create({
        projectId: id,
        proposal,
        bidAmount: Number(bidAmount),
        estimatedTime: Number(estimatedTime)
      });
      setToast({ message: "Application submitted successfully!", type: "success" });
      fetchProjectData();
    } catch (err) {
      setToast({ message: err.message || "Failed to submit application", type: "error" });
    } finally {
      setSubmittingApp(false);
    }
  };

  // Handle Approve/Reject Application (Client)
  const handleApproveApplication = async (appId, status) => {
    try {
      await applicationService.updateStatus(appId, status);
      setToast({ message: `Application ${status.toLowerCase()} successfully`, type: "success" });
      fetchProjectData();
    } catch (err) {
      setToast({ message: err.message || "Failed to update application status", type: "error" });
    }
  };

  // Handle Submit Project (Freelancer)
  const handleSubmitProjectWork = async () => {
    if (!window.confirm("Submit finished project work for client review?")) return;
    try {
      await projectService.submit(id);
      setToast({ message: "Project submitted for client completion!", type: "success" });
      fetchProjectData();
    } catch (err) {
      setToast({ message: err.message || "Failed to submit project", type: "error" });
    }
  };

  // Handle Complete Project (Client)
  const handleCompleteProject = async () => {
    if (!window.confirm("Mark project as completed?")) return;
    try {
      await projectService.complete(id);
      setToast({ message: "Project marked as completed!", type: "success" });
      setIsReviewModalOpen(true);
      fetchProjectData();
    } catch (err) {
      setToast({ message: err.message || "Failed to complete project", type: "error" });
    }
  };

  // Handle Review Submit (Client)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewService.create(id, rating, comment);
      setToast({ message: "Review submitted successfully!", type: "success" });
      setIsReviewModalOpen(false);
      fetchProjectData();
    } catch (err) {
      setToast({ message: err.message || "Failed to submit review", type: "error" });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Send Chat Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const receiverId =
      project.clientId._id === user.id
        ? project.freelancerId._id
        : project.clientId._id;

    setSendingMessage(true);
    try {
      await chatService.sendMessage(id, receiverId, chatMessage);
      setChatMessage("");
      const chatRes = await chatService.getProjectMessages(id);
      setMessages(chatRes.messages || []);
    } catch (err) {
      setToast({ message: err.message || "Failed to send message", type: "error" });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return <LoadingState message="Loading project workspace..." />;
  if (!project) return <div className="main-content"><p>Project not found.</p></div>;

  const isOwner = project.clientId?._id === user.id;
  const isAssigned = project.freelancerId?._id === user.id;

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb Header */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          PROJECT / #{project._id.slice(-6)}
        </span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginTop: "4px" }}>
          <h1 className="font-serif">{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Main Split View */}
      <div className="split-view">
        {/* Left Primary Details Column */}
        <div>
          {/* Metadata Card */}
          <div className="card-editorial">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Budget
                </div>
                <div style={{ fontSize: "22px", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
                  {formatCurrency(project.budget)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Client
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>
                  {project.clientId?.username}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Deadline
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-main)" }}>
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Project Overview</h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", whiteSpace: "pre-line", marginBottom: "20px" }}>
              {project.description}
            </p>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
              {project.skills?.map((s, idx) => (
                <SkillTag key={idx} skill={s} />
              ))}
            </div>

            {/* Actions Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
              {isOwner && project.status === "Submitted" && (
                <button onClick={handleCompleteProject} className="btn btn-accent btn-lg">
                  <CheckCircle2 size={18} />
                  Complete Project & Approve Deliverable
                </button>
              )}

              {isAssigned && project.status === "In Progress" && (
                <button onClick={handleSubmitProjectWork} className="btn btn-accent btn-lg">
                  <Send size={18} />
                  Submit Completed Work
                </button>
              )}

              {isOwner && project.status === "Completed" && !review && (
                <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-accent">
                  <Star size={16} />
                  Leave Freelancer Review
                </button>
              )}
            </div>
          </div>

          {/* Review Card (If Completed) */}
          {review && (
            <div className="card-editorial" style={{ backgroundColor: "var(--bg-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 className="font-serif">Client Feedback & Review</h3>
                <RatingStars rating={review.rating} />
              </div>
              <p style={{ fontStyle: "italic", color: "var(--text-main)", fontSize: "14px" }}>
                "{review.comment}"
              </p>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>
                By {review.clientId?.username} on {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Integrated Project Chat (For Participant Client & Freelancer) */}
          {(isOwner || isAssigned) && project.freelancerId && (
            <div className="chat-container" style={{ marginTop: "24px" }}>
              <div className="chat-header">
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Project Communication</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Direct line with {isOwner ? project.freelancerId?.username : project.clientId?.username}
                  </span>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", margin: "auto" }}>
                    No messages yet. Send a message to coordinate project deliverables.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId?._id === user.id;
                    return (
                      <div
                        key={msg._id}
                        className={`message-bubble ${isMe ? "message-outgoing" : "message-incoming"}`}
                      >
                        <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "2px" }}>
                          {msg.senderId?.username} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-area">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Write a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-accent" disabled={sendingMessage}>
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Contextual Action Panel */}
        <div>
          {/* CLIENT VIEW: Applicant Comparison Panel */}
          {isOwner && (
            <div>
              <h3 className="font-serif" style={{ marginBottom: "16px" }}>
                Proposals & Bids ({applications.length})
              </h3>

              {applications.length === 0 ? (
                <div className="card-editorial">
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    No proposals submitted yet. Interested freelancers will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {applications.map((app) => (
                    <div key={app._id} className="card-editorial" style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <Link to={`/freelancers/${app.freelancerId?._id}`} style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {app.freelancerId?.username}
                        </Link>
                        <StatusBadge status={app.status} />
                      </div>

                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>
                        <span>Bid: <strong>{formatCurrency(app.bidAmount)}</strong></span>
                        <span>Est: <strong>{app.estimatedTime} days</strong></span>
                      </div>

                      <p style={{ fontSize: "13px", color: "var(--text-main)", backgroundColor: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}>
                        "{app.proposal}"
                      </p>

                      {app.status === "Pending" && project.status === "Open" && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleApproveApplication(app._id, "Approved")}
                            className="btn btn-accent btn-sm"
                            style={{ flex: 1 }}
                          >
                            Approve Candidate
                          </button>
                          <button
                            onClick={() => handleApproveApplication(app._id, "Rejected")}
                            className="btn btn-secondary btn-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FREELANCER VIEW: Application Form / Application Status */}
          {isFreelancer && (
            <div>
              {myApp ? (
                <div className="card-editorial">
                  <h3 className="font-serif" style={{ marginBottom: "12px" }}>Your Application Status</h3>
                  <div style={{ marginBottom: "12px" }}>
                    <StatusBadge status={myApp.status} />
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Bid Amount: <strong>{formatCurrency(myApp.bidAmount)}</strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Estimated Completion: <strong>{myApp.estimatedTime} days</strong>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-main)", backgroundColor: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                    "{myApp.proposal}"
                  </p>
                </div>
              ) : project.status === "Open" ? (
                <div className="card-editorial">
                  <h3 className="font-serif" style={{ marginBottom: "16px" }}>Submit Proposal</h3>
                  <form onSubmit={handleApply}>
                    <div className="form-group">
                      <label className="form-label">Bid Amount (₹ INR)</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        placeholder={project.budget}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Estimated Days to Complete</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        placeholder="7"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: "20px" }}>
                      <label className="form-label">Proposal Cover Letter</label>
                      <textarea
                        className="form-textarea"
                        required
                        placeholder="Explain why you are the ideal fit for this project..."
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-accent" style={{ width: "100%" }} disabled={submittingApp}>
                      {submittingApp ? "Submitting..." : "Apply to Project"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="card-editorial">
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Applications are closed for this project.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Rate & Review Freelancer">
        <form onSubmit={handleSubmitReview}>
          <div className="form-group" style={{ alignItems: "center", marginBottom: "20px" }}>
            <label className="form-label">Star Rating</label>
            <RatingStars rating={rating} onChange={(r) => setRating(r)} size={28} />
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">Written Feedback</label>
            <textarea
              className="form-textarea"
              required
              placeholder="Describe your experience working with the freelancer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" onClick={() => setIsReviewModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={submittingReview}>
              {submittingReview ? "Submitting..." : "Publish Review"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
