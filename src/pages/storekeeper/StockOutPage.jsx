import React, { useState, useEffect, useCallback } from "react";
import DashboardWrapper from "../../components/storekeeperDashboardlayout";
import {
  Search,
  Package,
  Utensils,
  Wrench,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  BarChart3,
  TrendingDown,
  AlertCircle,
  Clock,
  ShieldAlert,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronLeft,
  Filter,
  Box,
  FileText,
  Save,
  Trash2,
  Activity as ActivityIcon
} from "lucide-react";
import { itemsApi, stockApi, lossesApi } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

// Premium Modal Component
const PremiumModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveText = "Confirm",
  saveButtonStyle = "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
  saveDisabled = false,
  icon: Icon = Package
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/50"
        >
          <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Operational Protocol</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-rose-500 shadow-sm hover:shadow-md border border-transparent hover:border-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            {children}
          </div>

          <div className="flex justify-end gap-3 p-8 border-t border-slate-50 bg-slate-50/30">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 rounded-2xl hover:bg-white transition-all text-slate-600 font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saveDisabled}
              className={`px-8 py-3 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl ${saveButtonStyle} ${
                saveDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
              }`}
            >
              {saveText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Warning Modal for daily limit exceeded
const PremiumWarningModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[110] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-rose-100"
        >
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-100">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            </div>

            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 mb-6">
              <p className="text-sm font-bold text-amber-900 mb-4">{message}</p>
              {details && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/50 p-2 px-3 rounded-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Daily Limit</span>
                    <span className="text-sm font-black text-slate-800">{details.daily_limit} {details.unit}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 p-2 px-3 rounded-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Used Today</span>
                    <span className="text-sm font-black text-slate-800">{details.already_used} {details.unit}</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-50 p-2 px-3 rounded-xl">
                    <span className="text-[10px] font-black text-rose-400 uppercase">Exceeds By</span>
                    <span className="text-sm font-black text-rose-600">{details.exceeded_by} {details.unit}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs font-bold text-slate-400 text-center mb-8 px-4">
              This issuance protocol deviates from standard daily quotas. Authorization will be logged.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600 font-black text-xs uppercase tracking-widest"
              >
                Abort
              </button>
              <button
                onClick={onConfirm}
                className="flex-[2] py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-100 hover:scale-105"
              >
                Proceed with Protocol
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const StockOutPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [successMessage, setSuccessMessage] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showLostItemModal, setShowLostItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Daily limit warning state
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [limitWarningData, setLimitWarningData] = useState(null);
  const [pendingStockOut, setPendingStockOut] = useState(null);

  const [stockOutData, setStockOutData] = useState({
    quantity: "",
    reason: "",
    notes: "",
  });

  const [lostItemData, setLostItemData] = useState({
    quantity: "",
    lossType: "damaged",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const categories = [
    { id: "all", name: "Full Catalog", icon: Package, color: "from-slate-500 to-slate-600", bgColor: "bg-slate-50", textColor: "text-slate-600" },
    { id: "food", name: "Food Items", icon: Utensils, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
    { id: "equipment", name: "Equipment", icon: Box, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { id: "tools", name: "Tools", icon: Wrench, color: "from-violet-500 to-violet-600", bgColor: "bg-violet-50", textColor: "text-violet-600" },
  ];

  const lossTypes = [
    { id: "damaged", name: "Damaged", icon: AlertTriangle, color: "bg-rose-500", textColor: "text-rose-600" },
    { id: "stolen", name: "Stolen", icon: ShieldAlert, color: "bg-orange-500", textColor: "text-orange-600" },
    { id: "expired", name: "Expired", icon: Clock, color: "bg-amber-500", textColor: "text-amber-600" },
  ];

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) { return null; }
  };

  const getUserId = () => {
    const user = getCurrentUser();
    return user?.id || user?._id;
  };

  const checkDailyLimit = async (itemId, quantity) => {
    try {
      const response = await stockApi.checkDailyLimit(itemId, quantity);
      return response;
    } catch (error) {
      return { within_limit: true };
    }
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { include_daily_limit_status: true };
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await itemsApi.getAllItems(params);
      const data = response?.data || response || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(timeoutId);
  }, [fetchItems]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredItems = Array.isArray(items)
    ? items.filter((item) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStockOutClick = (item) => {
    setSelectedItem(item);
    const defaultQty = item.category === "food" ? item.dailyLimit || 0 : "";
    setStockOutData({ quantity: defaultQty > 0 ? defaultQty.toString() : "", reason: "", notes: "" });
    setShowStockOutModal(true);
  };

  const handleLostItemClick = (item) => {
    setSelectedItem(item);
    setLostItemData({ quantity: "", lossType: "damaged", description: "", date: new Date().toISOString().split("T")[0] });
    setShowLostItemModal(true);
  };

  const handleStockOutSubmit = async () => {
    const quantity = parseFloat(stockOutData.quantity);
    if (!selectedItem || isNaN(quantity) || quantity <= 0) return alert("Please enter a valid quantity");
    if (quantity > selectedItem.currentQty) return alert(`Insufficient stock. Available: ${selectedItem.currentQty} ${selectedItem.unit}`);
    if (!stockOutData.reason.trim()) return alert("Please provide a reason for issuance");
    if (!stockOutData.notes.trim()) return alert("Verification notes are required for this transaction");

    if (selectedItem.category === "food" && selectedItem.dailyLimit) {
      const limitCheck = await checkDailyLimit(selectedItem.id, quantity);
      if (!limitCheck.within_limit) {
        setPendingStockOut({ item: selectedItem, quantity, reason: stockOutData.reason, notes: stockOutData.notes });
        setLimitWarningData({
          daily_limit: limitCheck.daily_limit,
          already_used: limitCheck.current_usage.used_today,
          requested: quantity,
          exceeded_by: limitCheck.current_usage.total_after_transaction - limitCheck.daily_limit,
          unit: limitCheck.unit,
        });
        setShowLimitWarning(true);
        setShowStockOutModal(false);
        return;
      }
    }
    await processStockOut(selectedItem, quantity, stockOutData.reason, stockOutData.notes);
  };

  const processStockOut = async (item, quantity, reason, notes, skipLimitCheck = false) => {
    try {
      const userId = getUserId();
      if (!userId) return alert("User not authenticated.");

      const response = await stockApi.stockOut(item.id, quantity, reason, notes, userId, skipLimitCheck);
      setShowStockOutModal(false);
      setSelectedItem(null);
      setStockOutData({ quantity: "", reason: "", notes: "" });
      setPendingStockOut(null);
      await fetchItems();
      setSuccessMessage(response?.warning === "DAILY_LIMIT_EXCEEDED" ? `Protocol verified! Daily limit exceeded by ${response.daily_limit_info.exceeded_by} ${item.unit}.` : "Asset issuance recorded successfully!");
    } catch (error) {
      alert(`Failed to record issuance: ${error.message || "Please try again"}`);
    }
  };

  const handleLimitExceededConfirm = async () => {
    setShowLimitWarning(false);
    if (pendingStockOut) {
      await processStockOut(pendingStockOut.item, pendingStockOut.quantity, pendingStockOut.reason, pendingStockOut.notes, true);
    }
  };

  const handleLostItemSubmit = async () => {
    const quantity = parseFloat(lostItemData.quantity);
    if (!selectedItem || isNaN(quantity) || quantity <= 0) return alert("Please enter a valid quantity");
    if (quantity > selectedItem.currentQty) return alert(`Cannot record loss exceeding current stock.`);
    if (!lostItemData.description.trim()) return alert("Description required.");

    try {
      const userId = getUserId();
      if (!userId) return alert("User not authenticated.");

      await lossesApi.reportLoss(selectedItem.id, quantity, lostItemData.lossType, lostItemData.description, userId, lostItemData.date);
      setShowLostItemModal(false);
      setSelectedItem(null);
      setLostItemData({ quantity: "", lossType: "damaged", description: "", date: new Date().toISOString().split("T")[0] });
      await fetchItems();
      setSuccessMessage("Loss protocol registered successfully.");
    } catch (error) {
      alert(`Failed: ${error.message}`);
    }
  };

  const getStockStatus = (item) => {
    if (item.category !== "food") return { text: "EQUIPMENT", color: "text-blue-600", dot: "bg-blue-500", bgColor: "bg-blue-50" };
    if (item.daily_limit_status?.is_exceeded) return { text: "LIMIT_EXCEEDED", color: "text-orange-600", dot: "bg-orange-500", bgColor: "bg-orange-50" };
    if (item.currentQty <= item.minQty * 0.5) return { text: "CRITICAL", color: "text-rose-600", dot: "bg-rose-500", bgColor: "bg-rose-50" };
    if (item.currentQty <= item.minQty) return { text: "LOW", color: "text-amber-600", dot: "bg-amber-500", bgColor: "bg-amber-50" };
    return { text: "OPERATIONAL", color: "text-emerald-600", dot: "bg-emerald-500", bgColor: "bg-emerald-50" };
  };

  if (loading && items.length === 0) {
    return (
      <DashboardWrapper>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
             <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
             <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Inventory...</span>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-100">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-rose-600 uppercase tracking-[0.2em]">Operational Dispatch</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Asset <span className="text-indigo-600">Issuance Hub</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                Process resource distribution and report operational losses. Maintain high-fidelity tracking protocols.
              </p>
            </div>
            
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-emerald-600 text-white px-6 py-4 rounded-[1.5rem] shadow-xl flex items-center gap-3"
                >
                  <CheckCircle size={20} />
                  <span className="text-sm font-black uppercase tracking-widest">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           {[
             { label: "Dispatchable Assets", val: items.length, icon: Package, color: "from-blue-500 to-indigo-600" },
             { label: "Food Inventory", val: items.filter(i => i.category === 'food').length, icon: Utensils, color: "from-emerald-500 to-teal-600" },
             { label: "Asset Health", val: items.filter(i => i.currentQty <= i.minQty).length, icon: AlertCircle, color: "from-amber-500 to-orange-600" },
             { label: "Limit Exceptions", val: items.filter(i => i.daily_limit_status?.is_exceeded).length, icon: ShieldAlert, color: "from-rose-500 to-rose-700" },
           ].map((stat, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 overflow-hidden relative group"
             >
               <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
               <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                 <stat.icon size={28} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                 <CountUp end={stat.val} duration={2} />
               </h3>
             </motion.div>
           ))}
        </div>

        {/* Filters & Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-10">
          {/* Sidebar Filters */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
               <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                 <Filter className="w-5 h-5 text-indigo-600" />
                 Classification
               </h2>
               <div className="space-y-2">
                 {categories.map((cat) => (
                   <motion.button
                     key={cat.id}
                     whileHover={{ x: 4 }}
                     onClick={() => setSelectedCategory(cat.id)}
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                       selectedCategory === cat.id 
                       ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                       : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl ${selectedCategory === cat.id ? "bg-white/20" : "bg-white shadow-sm"}`}>
                         <cat.icon size={16} className={selectedCategory === cat.id ? "text-white" : "text-indigo-600"} />
                       </div>
                       <span className="font-bold text-sm">{cat.name}</span>
                     </div>
                     {selectedCategory === cat.id && <ChevronRight className="w-4 h-4" />}
                   </motion.button>
                 ))}
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
               <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                 <Search className="w-5 h-5 text-indigo-600" />
                 Identification
               </h2>
               <div className="relative">
                 <input
                   type="text"
                   placeholder="Locate asset..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Issuance Manifest</h2>
                  <p className="text-slate-500 font-medium">Verify levels and record resource dispatch</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400">
                  <ClipboardList size={20} />
                </div>
              </div>
              
              <div className="overflow-x-auto no-scrollbar p-4 md:p-8">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Quota</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentItems.map((item, idx) => {
                      const status = getStockStatus(item);
                      const dailyLimitStatus = item.daily_limit_status;
                      return (
                        <motion.tr 
                          key={item.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                {item.category === "food" ? <Utensils className="text-emerald-500" size={18} /> : 
                                 item.category === "equipment" ? <Box className="text-blue-500" size={18} /> : 
                                 <Wrench className="text-violet-500" size={18} />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800">{item.name}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">REF: {item.id.slice(-8).toUpperCase()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 font-black text-slate-800 text-sm">
                            {item.currentQty} <span className="text-[10px] text-slate-400 uppercase">{item.unit}</span>
                          </td>
                          <td className="px-6 py-6">
                            {item.category === "food" && dailyLimitStatus ? (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                  <span>{dailyLimitStatus.used_today} used</span>
                                  <span>Limit: {dailyLimitStatus.daily_limit}</span>
                                </div>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (dailyLimitStatus.used_today / dailyLimitStatus.daily_limit) * 100)}%` }}
                                    className={`h-full ${dailyLimitStatus.is_exceeded ? "bg-rose-500" : "bg-emerald-500"}`}
                                  />
                                </div>
                              </div>
                            ) : <span className="text-xs text-slate-300 font-bold tracking-widest">---</span>}
                          </td>
                          <td className="px-6 py-6 text-center">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${status.bgColor} ${status.color} border-transparent shadow-sm`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                               {status.text}
                             </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                             <div className="flex justify-end gap-2">
                               <motion.button
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.9 }}
                                 onClick={() => handleStockOutClick(item)}
                                 className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                               >
                                 <TrendingDown size={16} />
                               </motion.button>
                               <motion.button
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.9 }}
                                 onClick={() => handleLostItemClick(item)}
                                 className="p-2.5 bg-white border border-slate-200 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                               >
                                 <AlertTriangle size={16} />
                               </motion.button>
                             </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination UI */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-slate-100 gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="text-slate-800">{filteredItems.length}</span> resources
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                          currentPage === i + 1 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <PremiumModal
          isOpen={showStockOutModal}
          onClose={() => setShowStockOutModal(false)}
          title="Stock Outbound Protocol"
          onSave={handleStockOutSubmit}
          saveText="Verify & Issue"
          saveDisabled={!stockOutData.quantity || parseFloat(stockOutData.quantity) <= 0 || !stockOutData.reason || !stockOutData.notes.trim()}
          icon={TrendingDown}
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                 <Box />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issuing Item</p>
                 <h4 className="font-black text-slate-800">{selectedItem?.name}</h4>
                 <p className="text-[10px] font-bold text-slate-400">AVAILABLE: {selectedItem?.currentQty} {selectedItem?.unit}</p>
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Issuance Quantity</span>
                <span className="text-rose-500">* Required</span>
              </label>
              <input
                type="number"
                placeholder="Enter amount..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                value={stockOutData.quantity}
                onChange={(e) => setStockOutData(p => ({ ...p, quantity: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Operational Reason</span>
                <span className="text-rose-500">* Required</span>
              </label>
              <select
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                value={stockOutData.reason}
                onChange={(e) => setStockOutData(p => ({ ...p, reason: e.target.value }))}
              >
                <option value="">Select reason...</option>
                <option value="Morning Consumption">Morning Consumption</option>
                <option value="Lunch Consumption">Lunch Consumption</option>
                <option value="Dinner Consumption">Dinner Consumption</option>
                <option value="Event Preparation">Event Preparation</option>
                <option value="Maintenance Requirement">Maintenance Requirement</option>
                <option value="Staff Usage">Staff Usage</option>
                <option value="Internal Transfer">Internal Transfer</option>
                <option value="Other">Other Protocol</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Verification Notes</span>
                <span className="text-rose-500">* Required</span>
              </label>
              <textarea
                rows="3"
                placeholder="Log additional details..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 resize-none"
                value={stockOutData.notes}
                onChange={(e) => setStockOutData(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
        </PremiumModal>

        <PremiumModal
          isOpen={showLostItemModal}
          onClose={() => setShowLostItemModal(false)}
          title="Loss Reporting Protocol"
          onSave={handleLostItemSubmit}
          saveText="Register Loss"
          saveButtonStyle="bg-rose-600 hover:bg-rose-700 shadow-rose-100"
          icon={AlertTriangle}
        >
          <div className="space-y-6">
            <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex items-center gap-4 text-rose-600">
               <AlertCircle size={32} />
               <div>
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Damaged/Lost Asset</p>
                 <h4 className="font-black text-rose-800">{selectedItem?.name}</h4>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lost Quantity</label>
                <input
                  type="number"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500"
                  value={lostItemData.quantity}
                  onChange={(e) => setLostItemData(p => ({ ...p, quantity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loss Vector</label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500"
                  value={lostItemData.lossType}
                  onChange={(e) => setLostItemData(p => ({ ...p, lossType: e.target.value }))}
                >
                  {lossTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incident Description</label>
              <textarea
                rows="3"
                placeholder="Narrative of loss..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 resize-none"
                value={lostItemData.description}
                onChange={(e) => setLostItemData(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incident Date</label>
              <input
                type="date"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500"
                value={lostItemData.date}
                onChange={(e) => setLostItemData(p => ({ ...p, date: e.target.value }))}
              />
            </div>
          </div>
        </PremiumModal>

        <PremiumWarningModal
          isOpen={showLimitWarning}
          onClose={() => setShowLimitWarning(false)}
          onConfirm={handleLimitExceededConfirm}
          title="Daily Quota Breach"
          message={`The issuance of ${limitWarningData?.requested} ${limitWarningData?.unit} exceeds the standardized daily quota for ${pendingStockOut?.item?.name}.`}
          details={limitWarningData}
        />
      </div>
    </DashboardWrapper>
  );
};

export default StockOutPage;
