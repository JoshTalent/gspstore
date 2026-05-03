import React, { useState, useEffect } from "react";
import DashboardWrapper from "../../components/storekeeperDashboardlayout";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Save,
  Key,
  Mail,
  Shield,
  LogOut,
  RefreshCw,
  Activity,
  AlertTriangle,
  Calendar,
  Database,
  Settings,
  Package,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Clock,
  ArrowRight,
  Fingerprint,
  Zap,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import CountUp from "react-countup";

const API_BASE_URL = "https://white-tooth-0336.this-enable.workers.dev/api";

const Profile = () => {
  const [user, setUser] = useState({
    id: null,
    username: "",
    full_name: "",
    role: "",
    email: "",
    created_at: "",
    updated_at: "",
    is_active: true,
    stats: {
      totalTransactions: 0,
      totalLossesReported: 0,
      totalChangeRequests: 0,
      monthlyActivity: 0,
      lowStockItems: 0,
      pendingRequests: 0,
    },
    activity: [],
  });

  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    full_name: "",
    currentPassword: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState({
    profile: true,
    updateProfile: false,
    updatePassword: false,
    activity: false,
  });

  const [errors, setErrors] = useState({
    profile: {},
    password: {},
  });

  const [notifications, setNotifications] = useState({
    success: "",
    error: "",
    info: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadUserData();
    loadUserActivity();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading((p) => ({ ...p, profile: true }));
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const enhancedUser = {
          ...userData,
          stats: userData.stats || {
            totalTransactions: 0,
            totalLossesReported: 0,
            totalChangeRequests: 0,
            monthlyActivity: 0,
            lowStockItems: 0,
            pendingRequests: 0,
          },
          created_at: userData.created_at || new Date().toISOString(),
          updated_at:
            userData.updated_at ||
            userData.created_at ||
            new Date().toISOString(),
        };
        setUser(enhancedUser);
        setProfileForm({
          username: userData.username || "",
          email: userData.email || "",
          full_name: userData.full_name || "",
          currentPassword: "",
        });
        await fetchUserProfile(userData.id || userData._id);
      }
    } catch (error) {
      showNotification("Failed to load user data", "error");
    } finally {
      setLoading((p) => ({ ...p, profile: false }));
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        params: { userId },
      });
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setProfileForm((prev) => ({
          ...prev,
          username: userData.username || "",
          email: userData.email || "",
          full_name: userData.full_name || "",
        }));
      }
    } catch (e) {}
  };

  const loadUserActivity = async () => {
    try {
      setLoading((p) => ({ ...p, activity: true }));
      const response = await axios.get(`${API_BASE_URL}/stock/transactions`, {
        params: { limit: 5 },
      });
      if (response.data.success) setRecentActivity(response.data.data || []);
    } catch (e) {
    } finally {
      setLoading((p) => ({ ...p, activity: false }));
    }
  };

  const showNotification = (message, type = "success") => {
    setNotifications({ [type]: message });
    setTimeout(
      () => setNotifications({ success: "", error: "", info: "" }),
      5000,
    );
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.currentPassword)
      return showNotification("Verification required", "error");

    setLoading((p) => ({ ...p, updateProfile: true }));
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, {
        userId: user.id || user._id,
        ...profileForm,
      });
      if (response.data.success) {
        showNotification("Identity profile synchronized", "success");
        loadUserData();
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Protocol error",
        "error",
      );
    } finally {
      setLoading((p) => ({ ...p, updateProfile: false }));
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return showNotification("Mismatch in new credentials", "error");

    setLoading((p) => ({ ...p, updatePassword: true }));
    try {
      const response = await axios.put(`${API_BASE_URL}/users/password`, {
        userId: user.id || user._id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      if (response.data.success) {
        showNotification("Security layer updated", "success");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Security protocol failure",
        "error",
      );
    } finally {
      setLoading((p) => ({ ...p, updatePassword: false }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading.profile) {
    return (
      <DashboardWrapper>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                  <Fingerprint className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em]">
                  Officer Identity
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Profile <span className="text-indigo-600">Console</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                Manage your operational credentials and security protocols.
                Maintain system integrity.
              </p>
            </div>

            <AnimatePresence>
              {(notifications.success || notifications.error) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`px-6 py-4 rounded-[1.5rem] shadow-xl flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest ${notifications.success ? "bg-emerald-600" : "bg-rose-600"}`}
                >
                  {notifications.success ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  {notifications.success || notifications.error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Identity Shield */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
              <div className="relative mb-8 mx-auto w-32 h-32">
                <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] rotate-6 group-hover:rotate-12 transition-transform opacity-10" />
                <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] -rotate-3 group-hover:-rotate-6 transition-transform opacity-5" />
                <div className="relative w-full h-full bg-indigo-600 rounded-[2.5rem] shadow-xl flex items-center justify-center text-white">
                  <User size={56} />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {user.full_name || "Active Officer"}
              </h2>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                @{user.username}
              </p>

              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                <ShieldCheck size={14} />
                {user.role?.replace("_", " ") || "OPERATIONAL"}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-4 text-slate-500">
                  <Mail size={18} className="text-indigo-400" />
                  <span className="text-sm font-bold truncate">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <Calendar size={18} className="text-indigo-400" />
                  <span className="text-sm font-bold">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-10 py-4 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
              >
                <LogOut
                  size={16}
                  className="group-hover/btn:-translate-x-1 transition-transform"
                />
                Terminate Session
              </button>
            </motion.div>

            {/* Performance Stats */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 space-y-8">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <Activity className="text-indigo-600" />
                Operational Stats
              </h3>
              <div className="space-y-6">
                {[
                  {
                    label: "Total Actions",
                    val: user.stats.totalTransactions,
                    color: "text-indigo-600",
                  },
                  {
                    label: "Losses Reported",
                    val: user.stats.totalLossesReported,
                    color: "text-rose-600",
                  },
                  {
                    label: "Pending Approvals",
                    val: user.stats.totalChangeRequests,
                    color: "text-amber-600",
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all"
                  >
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {s.label}
                    </span>
                    <span className={`text-xl font-black ${s.color}`}>
                      <CountUp end={s.val || 0} duration={2} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Forms */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex gap-2 p-2 bg-slate-100/50 rounded-[2rem] w-fit">
              {["profile", "security", "activity"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? "bg-white text-indigo-600 shadow-xl"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-2xl border border-slate-100"
                >
                  <div className="flex items-center gap-6 mb-12">
                    <div className="p-4 bg-indigo-50 rounded-[2rem] text-indigo-600">
                      <Settings size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        Identity Settings
                      </h2>
                      <p className="text-slate-500 font-medium">
                        Synchronize your personal operational details
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                          Full Operational Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                            size={18}
                          />
                          <input
                            type="text"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={profileForm.full_name}
                            onChange={(e) =>
                              setProfileForm((p) => ({
                                ...p,
                                full_name: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                          Authorized Email
                        </label>
                        <div className="relative">
                          <Mail
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                            size={18}
                          />
                          <input
                            type="email"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm((p) => ({
                                ...p,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                      <div className="flex items-center gap-4 text-amber-600 mb-2">
                        <Shield size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">
                          Authorization Required
                        </span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                          Current Verification Password
                        </label>
                        <div className="relative">
                          <Lock
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                            size={18}
                          />
                          <input
                            type="password"
                            placeholder="Enter current password to save changes"
                            className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[1.5rem] font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 shadow-sm"
                            value={profileForm.currentPassword}
                            onChange={(e) =>
                              setProfileForm((p) => ({
                                ...p,
                                currentPassword: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading.updateProfile}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading.updateProfile ? (
                          <RefreshCw className="animate-spin" size={18} />
                        ) : (
                          <Save size={18} />
                        )}
                        Sync Identity Protocol
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-2xl border border-slate-100"
                >
                  <div className="flex items-center gap-6 mb-12">
                    <div className="p-4 bg-rose-50 rounded-[2rem] text-rose-600">
                      <Lock size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        Security Protocol
                      </h2>
                      <p className="text-slate-500 font-medium">
                        Update your encrypted access credentials
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                        Master Password
                      </label>
                      <input
                        type="password"
                        placeholder="Current operational password"
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((p) => ({
                            ...p,
                            currentPassword: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                          New Access Code
                        </label>
                        <input
                          type="password"
                          className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                          Verify Access Code
                        </label>
                        <input
                          type="password"
                          className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading.updatePassword}
                      className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <Key size={18} />
                      Overwrite Security Protocol
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-2xl border border-slate-100"
                >
                  <div className="flex items-center gap-6 mb-12">
                    <div className="p-4 bg-emerald-50 rounded-[2rem] text-emerald-600">
                      <ClipboardList size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        Operation Logs
                      </h2>
                      <p className="text-slate-500 font-medium">
                        Review your latest system interactions
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-white transition-all group"
                        >
                          <div className="flex items-center gap-6">
                            <div
                              className={`p-3 rounded-2xl ${act.transaction_type === "IN" || act.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}
                            >
                              <Activity size={20} />
                            </div>
                            <div>
                              <p className="font-black text-slate-800">
                                {act.item_name || "Operational Task"}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(
                                  act.transaction_date || act.date,
                                ).toLocaleDateString()}{" "}
                                •{" "}
                                {act.transaction_type || act.type || "PROTOCOL"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-800">
                              {act.quantity} {act.unit || "pcs"}
                            </p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                              Verified Protocol
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <Clock
                          size={48}
                          className="mx-auto text-slate-200 mb-4"
                        />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                          No Recent Operations Logged
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default Profile;
