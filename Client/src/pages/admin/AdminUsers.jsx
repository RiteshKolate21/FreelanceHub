import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService.js";
import { LoadingState } from "../../components/LoadingState.jsx";
import { Toast } from "../../components/Toast.jsx";
import { Search } from "lucide-react";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search,
        userType: userTypeFilter === "ALL" ? "" : userTypeFilter
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, userTypeFilter]);

  const handleToggleStatus = async (userId, username, currentBlocked) => {
    const action = currentBlocked ? "unblock" : "disable";
    if (!window.confirm(`Are you sure you want to ${action} user "${username}"?`)) return;

    try {
      const res = await adminService.toggleUserStatus(userId);
      setToast({ message: res.message, type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message || "Failed to update user status", type: "error" });
    }
  };

  return (
    <div className="main-content">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-terracotta)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Admin Operations
        </span>
        <h1 style={{ marginTop: "4px" }}>User Directory & Moderation</h1>
      </div>

      {/* Filter Header */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search user by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "Client", "Freelancer", "Admin"].map((role) => (
            <button
              key={role}
              onClick={() => setUserTypeFilter(role)}
              className={`btn btn-sm ${userTypeFilter === role ? "btn-dark" : "btn-secondary"}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching user directory..." />
      ) : (
        <div className="table-responsive">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="skill-tag">{u.userType}</span>
                  </td>
                  <td>
                    {u.isBlocked ? (
                      <span className="status-badge status-Rejected">Disabled</span>
                    ) : (
                      <span className="status-badge status-Open">Active</span>
                    )}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.userType !== "Admin" && (
                      <button
                        onClick={() => handleToggleStatus(u._id, u.username, u.isBlocked)}
                        className={`btn btn-sm ${u.isBlocked ? "btn-secondary" : "btn-danger"}`}
                      >
                        {u.isBlocked ? "Enable Account" : "Disable Account"}
                      </button>
                    )}
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
