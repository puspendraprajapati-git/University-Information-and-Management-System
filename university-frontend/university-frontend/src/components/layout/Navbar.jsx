import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  Bell,
  CheckCheck,
  Settings,
  AlertTriangle,
  Clock,
  CreditCard,
  Megaphone,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../api/notificationService";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preferences Modal State
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [preferences, setPreferences] = useState({
    inAppEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    attendanceThreshold: 75
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  // Fetch notifications list when dropdown opens
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications(15, 0, false);
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [user]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    const nextState = !showDropdown;
    setShowDropdown(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const openPreferences = async () => {
    setShowDropdown(false);
    setShowPrefModal(true);
    try {
      const res = await notificationService.getMyPreferences();
      if (res.data) {
        setPreferences(res.data);
      }
    } catch {
      // ignore
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await notificationService.updateMyPreferences(preferences);
      toast.success("Notification preferences updated!");
      setShowPrefModal(false);
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  const getRoleBadgeClass = (role) => {
    if (role === "ADMIN") return "badge-role-admin";
    if (role === "FACULTY") return "badge-role-faculty";
    return "badge-role-student";
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "ATTENDANCE_ALERT":
        return <AlertTriangle size={16} className="text-danger" />;
      case "ASSIGNMENT_DUE":
        return <Clock size={16} className="text-warning" />;
      case "FEE_REMINDER":
        return <CreditCard size={16} className="text-info" />;
      default:
        return <Megaphone size={16} className="text-primary" />;
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-4 py-2 sticky-top">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: "36px", height: "36px", backgroundColor: "#eef2ff", color: "#4f46e5" }}
          >
            <GraduationCap size={22} />
          </div>
          <span className="navbar-brand mb-0 fw-bold fs-5 text-dark">
            EduCore <span style={{ color: "#4f46e5" }}>Portal</span>
          </span>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Notifications Bell Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <button
              type="button"
              className="position-relative d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: "42px",
                height: "42px",
                padding: 0,
                borderRadius: "50%",
                backgroundColor: "#eef2ff",
                border: "1.5px solid #c7d2fe",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                outline: "none"
              }}
              onClick={toggleDropdown}
              title="Notifications"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e0e7ff";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#eef2ff";
                e.currentTarget.style.transform = "none";
              }}
            >
              <Bell size={20} color="#4f46e5" strokeWidth={2.3} />
              {unreadCount > 0 && (
                <span
                  className="position-absolute badge rounded-pill bg-danger d-flex align-items-center justify-content-center"
                  style={{
                    top: "-3px",
                    right: "-3px",
                    fontSize: "0.68rem",
                    minWidth: "19px",
                    height: "19px",
                    padding: "0 4px",
                    border: "2px solid #ffffff",
                    boxShadow: "0 2px 4px rgba(220, 38, 38, 0.4)",
                    fontWeight: "700"
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="position-absolute end-0 mt-2 card border-0 shadow-lg"
                style={{
                  width: "360px",
                  maxHeight: "480px",
                  zIndex: 1050,
                  borderRadius: "14px",
                  overflow: "hidden"
                }}
              >
                {/* Header */}
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark fs-6">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="badge bg-primary rounded-pill small">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        className="btn btn-link btn-sm text-decoration-none p-0 text-muted small d-flex align-items-center gap-1"
                        onClick={handleMarkAllRead}
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      className="btn btn-link btn-sm text-decoration-none p-0 text-muted"
                      onClick={openPreferences}
                      title="Notification Settings"
                    >
                      <Settings size={15} />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="card-body p-0 overflow-auto" style={{ maxHeight: "330px" }}>
                  {loading ? (
                    <div className="text-center py-4 text-muted small">Loading alerts...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <Bell size={28} className="opacity-25 mb-2" />
                      <p className="mb-0 small">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.notification_id}
                        className={`p-3 border-bottom d-flex align-items-start gap-2.5 transition-all ${
                          !item.is_read ? "bg-light-subtle" : ""
                        }`}
                        style={{
                          backgroundColor: !item.is_read ? "#f8faff" : "#ffffff",
                          cursor: "default"
                        }}
                      >
                        <div className="mt-0.5 p-1.5 rounded-circle bg-light border d-flex align-items-center justify-content-center">
                          {getNotifIcon(item.type)}
                        </div>

                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex justify-content-between align-items-baseline gap-1">
                            <span
                              className={`small ${!item.is_read ? "fw-bold text-dark" : "fw-medium text-secondary"}`}
                              style={{ fontSize: "0.82rem" }}
                            >
                              {item.title}
                            </span>
                            {!item.is_read && (
                              <button
                                className="btn btn-link p-0 text-primary"
                                style={{ fontSize: "0.7rem" }}
                                onClick={(e) => handleMarkAsRead(item.notification_id, e)}
                                title="Mark as read"
                              >
                                ●
                              </button>
                            )}
                          </div>
                          <p
                            className="text-muted mb-1 text-truncate-2"
                            style={{ fontSize: "0.75rem", lineHeight: "1.3" }}
                          >
                            {item.message}
                          </p>
                          <small className="text-muted" style={{ fontSize: "0.68rem" }}>
                            {new Date(item.created_at).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer link to Announcements */}
                <div className="card-footer bg-light border-top py-2 text-center">
                  <button
                    className="btn btn-link btn-sm text-primary text-decoration-none fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                    onClick={() => {
                      setShowDropdown(false);
                      const base = user?.role === "ADMIN" ? "/admin" : user?.role === "FACULTY" ? "/faculty" : "/student";
                      navigate(`${base}/announcements`);
                    }}
                  >
                    View Campus Announcements & Notices →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{
                width: "36px",
                height: "36px",
                fontSize: "0.9rem",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
              }}
            >
              {initial}
            </div>
            <div className="d-none d-sm-block text-start">
              <div className="fw-semibold text-dark lh-1" style={{ fontSize: "0.9rem" }}>
                {user?.username}
              </div>
              <span
                className={`badge rounded-pill mt-1 ${getRoleBadgeClass(user?.role)}`}
                style={{ fontSize: "0.68rem" }}
              >
                {user?.role}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-3 py-1.5"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Notification Preferences Modal */}
      {showPrefModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-light px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <Settings size={20} className="text-primary" />
                  <h5 className="modal-title fw-bold text-dark fs-6 mb-0">
                    Notification Preferences
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPrefModal(false)}
                />
              </div>

              <form onSubmit={handleSavePreferences}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Configure your communication channels and automated alert rules.
                  </p>

                  <div className="d-flex flex-column gap-3 mb-4">
                    {/* In-App Notifications */}
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-light">
                      <div>
                        <strong className="d-block small text-dark">In-App Notifications</strong>
                        <small className="text-muted">Receive live notifications in the portal</small>
                      </div>
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={preferences.inAppEnabled}
                          onChange={(e) =>
                            setPreferences({ ...preferences, inAppEnabled: e.target.checked })
                          }
                        />
                      </div>
                    </div>

                    {/* Email Alerts */}
                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-light">
                      <div>
                        <strong className="d-block small text-dark">Email Updates</strong>
                        <small className="text-muted">Send alerts for fee deadlines and assignments</small>
                      </div>
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={preferences.emailEnabled}
                          onChange={(e) =>
                            setPreferences({ ...preferences, emailEnabled: e.target.checked })
                          }
                        />
                      </div>
                    </div>

                    {/* Low Attendance Threshold */}
                    <div className="p-3 rounded-3 border bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="small text-dark">Attendance Warning Threshold</strong>
                        <span className="badge bg-primary fw-bold">
                          {preferences.attendanceThreshold}%
                        </span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="50"
                        max="90"
                        step="5"
                        value={preferences.attendanceThreshold}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            attendanceThreshold: parseInt(e.target.value)
                          })
                        }
                      />
                      <small className="text-muted d-block">
                        Warn me when attendance in any course falls below {preferences.attendanceThreshold}%.
                      </small>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-2 border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowPrefModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary fw-semibold px-3"
                    disabled={savingPrefs}
                  >
                    {savingPrefs ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
