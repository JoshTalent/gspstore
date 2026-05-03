import React, { useState, useEffect, useCallback, useMemo } from "react";
import ManagerDashboardWrapper from "../../components/managerDashboardlayout";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Package,
  Layers,
  Bell,
  Sparkles,
  ArrowRight,
  PieChart,
  Box,
  Utensils,
  Wrench,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
  Activity as ActivityIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

const AdvancedManagerDashboard = () => {
  const API_BASE_URL = "https://white-tooth-0336.this-enable.workers.dev/api";
  const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        error.response.status === 401 &&
        !error.config.url.includes("/login")
      ) {
        localStorage.clear();
        window.location.href = "/login?expired=true";
      }
      return Promise.reject(error);
    },
  );

  const [dashboardData, setDashboardData] = useState({
    summary: null,
    items: [],
    transactions: [],
    categoryDistribution: {},
    alerts: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, transactionsRes, lossesRes] = await Promise.all([
        api.get("/items"),
        api.get("/stock/transactions"),
        api.get("/losses"),
      ]);

      const items = itemsRes.data?.success
        ? itemsRes.data.data
        : Array.isArray(itemsRes.data)
          ? itemsRes.data
          : [];
      const transactions = transactionsRes.data?.success
        ? transactionsRes.data.data
        : Array.isArray(transactionsRes.data)
          ? transactionsRes.data
          : [];

      const summary = {
        total_items: items.length,
        total_quantity: items.reduce(
          (sum, item) => sum + (Number(item.current_qty || item.quantity) || 0),
          0,
        ),
        low_stock_items: items.filter(
          (i) =>
            Number(i.current_qty || i.quantity) <=
            Number(i.min_qty || i.min_quantity),
        ).length,
        today_activity: transactions.filter(
          (t) =>
            new Date(t.transaction_date || t.date).toDateString() ===
            new Date().toDateString(),
        ).length,
      };

      const categoryDistribution = items.reduce((acc, item) => {
        const cat = item.category || "other";
        if (!acc[cat]) acc[cat] = 0;
        acc[cat]++;
        return acc;
      }, {});

      setDashboardData({
        items,
        transactions,
        summary,
        categoryDistribution,
        alerts: [],
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statsCards = useMemo(() => {
    const s = dashboardData.summary || {};
    return [
      {
        title: "Total Inventory",
        value: s.total_items || 0,
        subtitle: "Active Assets",
        icon: Package,
        trend: "+4.2%",
        color: "from-indigo-500 to-indigo-600",
        shadow: "shadow-indigo-100",
      },
      {
        title: "Stock Volume",
        value: s.total_quantity || 0,
        subtitle: "Total Units",
        icon: Layers,
        trend: "+1.8%",
        color: "from-emerald-500 to-emerald-600",
        shadow: "shadow-emerald-100",
      },
      {
        title: "Operational Flow",
        value: s.today_activity || 0,
        subtitle: "Transactions Today",
        icon: Activity,
        trend: "+12",
        color: "from-amber-500 to-amber-600",
        shadow: "shadow-amber-100",
      },
      {
        title: "System Alerts",
        value: s.low_stock_items || 0,
        subtitle: "Low Stock Detected",
        icon: Bell,
        trend: "CRITICAL",
        color: "from-rose-500 to-rose-600",
        shadow: "shadow-rose-100",
      },
    ];
  }, [dashboardData.summary]);

  const chartData = useMemo(() => {
    // Generate mock history for visual appeal if real history isn't available
    return [
      { name: "Mon", value: 400 },
      { name: "Tue", value: 300 },
      { name: "Wed", value: 600 },
      { name: "Thu", value: 800 },
      { name: "Fri", value: 500 },
      { name: "Sat", value: 900 },
      { name: "Sun", value: 700 },
    ];
  }, []);

  const pieData = useMemo(() => {
    return Object.entries(dashboardData.categoryDistribution).map(
      ([name, value]) => ({ name, value }),
    );
  }, [dashboardData.categoryDistribution]);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading && !dashboardData.summary) {
    return (
      <ManagerDashboardWrapper>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <ActivityIcon className="w-10 h-10 text-indigo-600 animate-spin" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Synchronizing Intelligence...
            </span>
          </div>
        </div>
      </ManagerDashboardWrapper>
    );
  }

  return (
    <ManagerDashboardWrapper>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em]">
                  Administrative Command
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Admin <span className="text-indigo-600">Dashboard</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                Global stock intelligence and operational metrics. monitor
                real-time asset flows and system health.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchDashboardData}
                className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm hover:shadow-md transition-all"
              >
                <RefreshCw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <Download size={16} />
                Export Intelligence
              </motion.button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative group overflow-hidden"
            >
              <div
                className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`}
              />

              <div className="flex items-center justify-between mb-6">
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg ${card.shadow}`}
                >
                  <card.icon size={24} />
                </div>
                <span
                  className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full ${idx === 3 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
                >
                  {card.trend}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {card.title}
                </p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  <CountUp end={card.value} duration={2} />
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Stock Performance
                </h2>
                <p className="text-slate-400 font-medium text-sm text-indigo-500 uppercase font-black tracking-widest text-[10px] mt-1">
                  Flow Analytics • Last 7 Days
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <ActivityIcon size={20} className="text-indigo-600" />
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "24px",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      padding: "16px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 flex flex-col">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 text-center">
              Category Mix
            </h2>
            <p className="text-center text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8">
              Asset Allocation
            </p>

            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {pieData.slice(0, 4).map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter truncate w-20">
                      {entry.name}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {entry.value} Items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Recent Activity
              </h2>
              <p className="text-slate-500 font-medium">
                Latest stock movements across all warehouses
              </p>
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest"
            >
              Full History <ChevronRight size={16} />
            </motion.button>
          </div>

          <div className="p-4 md:p-8 overflow-x-auto no-scrollbar">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Resource
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Protocol
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Officer
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardData.transactions.slice(0, 5).map((t, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-6 py-6 font-black text-slate-800 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                          <Box size={16} className="text-indigo-600" />
                        </div>
                        {t.item_name || t.item?.name || "Resource-X"}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${t.transaction_type === "IN" || t.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                      >
                        {t.transaction_type || t.type || "STOCK_OUT"}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-black text-slate-800">
                        {t.quantity}{" "}
                        <span className="text-[10px] text-slate-400">
                          {t.unit || "pcs"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-slate-500">
                      {t.user_name || "System Auth"}
                    </td>
                    <td className="px-6 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(
                        t.transaction_date || t.date,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ManagerDashboardWrapper>
  );
};

export default AdvancedManagerDashboard;
