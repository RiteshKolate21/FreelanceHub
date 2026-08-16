import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { notificationService } from "../../services/notificationService.js";
import { LoadingState } from "../../components/LoadingState.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Bell, CheckCheck, ArrowUpRight } from "lucide-react";

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content">
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Activity Feed
            </span>
            <h1 className="font-serif" style={{ marginTop: "4px" }}>Notifications Center</h1>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
              <CheckCheck size={16} />
              Mark All as Read
            </button>
          )}
        </div>

        {loading ? (
          <LoadingState message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up! No recent system updates." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  backgroundColor: notif.isRead ? "var(--bg-surface)" : "var(--bg-subtle)",
                  border: "1px solid var(--border-color)",
                  borderLeft: notif.isRead ? "1px solid var(--border-color)" : "3px solid var(--accent-terracotta)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
                      {notif.title}
                    </h3>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      • {new Date(notif.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{notif.message}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {notif.relatedProjectId && (
                    <Link to={`/client/projects/${notif.relatedProjectId}`} className="btn btn-secondary btn-sm">
                      View Project <ArrowUpRight size={13} />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif._id)}
                      className="btn btn-secondary btn-sm"
                      title="Mark as read"
                    >
                      Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
