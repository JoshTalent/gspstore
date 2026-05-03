import React, { useState, useEffect, useCallback } from "react";
import DashboardWrapper from "../../components/storekeeperDashboardlayout";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Plus,
  BarChart3,
  Bell,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Box,
  ClipboardList,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity as ActivityIcon,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { itemsApi, stockApi } from "../../../services/api";

const StoreKeeperDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    pendingRequests: 0,
    todayUsage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [dailyUsage, setDailyUsage] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [itemsRes, transactionsRes] = await Promise.all([
        itemsApi.getAllItems({ include_daily_limit_status: true }),
        stockApi.getTransactions({ limit: 10 })
      ]);

      const items = itemsRes || [];
      const transactions = transactionsRes || [];

      // Calculate stats
      const today = new Date().toDateString();
      const todayOutTransactions = transactions.filter(t => 
        (t.type === 'out' || t.transaction_type === 'OUT') && 
        new Date(t.date || t.transaction_date).toDateString() === today
      );

      setStats({
        totalItems: items.length,
        lowStock: items.filter(i => (i.currentQty || i.quantity) <= (i.minQty || i.min_quantity)).length,
        pendingRequests: 0,
        todayUsage: todayOutTransactions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0),
      });

      setLowStockItems(items.filter(i => (i.currentQty || i.quantity) <= (i.minQty || i.min_quantity)).slice(0, 3));
      
      // Process activities from transactions
      const processedActivities = transactions.map(t => ({
        id: t.id || t._id,
        item: t.item_name || t.item?.name || "Resource",
        action: t.type === 'in' ? "Stock In" : (t.type === 'out' || t.transaction_type === 'OUT') ? "Stock Out" : "Loss",
        quantity: `${t.quantity} ${t.item?.unit || t.unit || 'pcs'}`,
        time: new Date(t.date || t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: t.type?.toUpperCase() || t.transaction_type || 'OUT'
      }));

      setRecentActivities(processedActivities);

      // Extract food reserves from items list (more reliable than broken daily-usage endpoint)
      const foodReserves = items
        .filter(i => i.category === 'food' && i.daily_limit_status)
        .slice(0, 3)
        .map(i => ({
          name: i.name,
          used_today: i.daily_limit_status.used_today,
          daily_limit: i.daily_limit_status.daily_limit,
          unit: i.unit,
          percentage: i.daily_limit_status.percentage_used
        }));
      
      setDailyUsage(foodReserves);

    } catch (err) {
      console.error("Storekeeper Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const quickActions = [
    { title: "Record Stock In", icon: TrendingUp, color: "bg-emerald-600", desc: "Add arriving inventory", link: "/storekeeper/items" },
    { title: "Record Stock Out", icon: TrendingDown, color: "bg-indigo-600", desc: "Issue resources", link: "/storekeeper/stock-out" },
    { title: "Report Loss", icon: AlertTriangle, color: "bg-rose-600", desc: "Log damaged assets", link: "/storekeeper/stock-out" },
    { title: "View Manifest", icon: ClipboardList, color: "bg-amber-600", desc: "Full inventory check", link: "/storekeeper/items" },
  ];

  if (loading && stats.totalItems === 0) {
    return (
      <DashboardWrapper>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
             <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
             <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Intelligence...</span>
          </div>
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
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em]">Operational Console</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Store <span className="text-indigo-600">Commander</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                Real-time inventory management. tracking stock levels and coordinating operational logistics.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={fetchData}
                 className="p-4 bg-white border border-slate-200 rounded-[1.5rem] text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
               >
                 <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
               </motion.button>
               <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] shadow-xl border border-slate-100">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Officer</p>
                    <p className="text-sm font-black text-slate-800">Operational Specialist</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           {[
             { label: "Total Assets", val: stats.totalItems, icon: Package, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-100" },
             { label: "Critical Stock", val: stats.lowStock, icon: AlertTriangle, color: "from-rose-500 to-rose-600", shadow: "shadow-rose-100" },
             { label: "Alerts Pending", val: stats.pendingRequests, icon: Bell, color: "from-amber-500 to-amber-600", shadow: "shadow-amber-100" },
             { label: "Today's Yield", val: stats.todayUsage, icon: Activity, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-100" },
           ].map((stat, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 group overflow-hidden relative"
             >
               <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
               <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-6 shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                 <stat.icon size={28} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                 <CountUp end={stat.val} duration={2} />
               </h3>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Console */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
               <div className="flex items-center justify-between mb-10">
                 <div>
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">Protocol Actions</h2>
                   <p className="text-slate-500 font-medium text-sm">Execute core operational tasks</p>
                 </div>
                 <Zap className="text-indigo-600 w-6 h-6 animate-pulse" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {quickActions.map((action, idx) => (
                   <motion.button
                     key={idx}
                     whileHover={{ y: -5, scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     className="group p-6 bg-slate-50 hover:bg-white border border-transparent hover:border-indigo-100 rounded-[2rem] transition-all text-left flex items-start gap-6 shadow-sm hover:shadow-xl"
                   >
                     <div className={`p-4 ${action.color} text-white rounded-2xl shadow-lg group-hover:rotate-12 transition-transform`}>
                        <action.icon size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-slate-800">{action.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{action.desc}</p>
                     </div>
                     <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" size={20} />
                   </motion.button>
                 ))}
               </div>
            </div>

            {/* Activity Stream */}
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-10">
                 <ActivityIcon className="text-indigo-50 w-32 h-32" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8">Operational Stream</h2>
                 <div className="space-y-6">
                   {recentActivities.length > 0 ? (
                     recentActivities.map((act, idx) => (
                       <div key={idx} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-100 transition-all hover:bg-white group">
                         <div className="flex items-center gap-6">
                           <div className={`p-3 rounded-2xl ${act.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : act.type === 'OUT' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                             {act.type === 'IN' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                           </div>
                           <div>
                             <p className="font-black text-slate-800">{act.item}</p>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{act.action} • {act.time}</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-lg font-black text-slate-800">{act.quantity}</p>
                           <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Verified</p>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-10">
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent activity detected</p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>

          {/* Critical Monitors */}
          <div className="space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
               <h2 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                 <AlertTriangle className="text-rose-600" />
                 Low Stock Radar
               </h2>
               <div className="space-y-6">
                 {lowStockItems.length > 0 ? (
                   lowStockItems.map((item, idx) => (
                     <div key={idx} className="space-y-3">
                       <div className="flex justify-between items-end">
                         <div>
                           <p className="font-black text-slate-800">{item.name}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depletion Alert</p>
                         </div>
                         <span className="text-rose-600 font-black text-xs uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full animate-pulse">Critical</span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${Math.min(100, ((item.currentQty || item.quantity) / (item.minQty || item.min_quantity)) * 100)}%` }}
                           className="h-full bg-rose-600"
                         />
                       </div>
                       <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Current: {item.currentQty || item.quantity} {item.unit}</span>
                         <span>Safety: {item.minQty || item.min_quantity} {item.unit}</span>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="p-6 bg-emerald-50 rounded-2xl text-center">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">All stock levels nominal</p>
                   </div>
                 )}
               </div>
               <motion.button 
                 whileHover={{ x: 5 }}
                 className="w-full mt-10 py-4 border-2 border-indigo-600 text-indigo-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-50"
               >
                 Review All Criticals
               </motion.button>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
               <h2 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                 <ClipboardList className="text-indigo-600" />
                 Shift Metrics
               </h2>
               <div className="space-y-6">
                 {dailyUsage.length > 0 ? (
                   dailyUsage.map((usage, idx) => (
                     <div key={idx} className="space-y-3">
                       <div className="flex justify-between text-xs font-black text-slate-800 uppercase tracking-widest">
                          <span>{usage.name}</span>
                          <span>{usage.used_today}/{usage.daily_limit} {usage.unit}</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${Math.min(100, usage.percentage || (usage.used_today / usage.daily_limit) * 100)}%` }}
                           className={`h-full ${usage.percentage > 90 ? "bg-rose-500" : usage.percentage > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                         />
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-6">
                     <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">No food usage recorded today</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
};

export default StoreKeeperDashboard;
