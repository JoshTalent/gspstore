import React, { useState, useEffect, useCallback } from "react";
import DashboardWrapper from "../../components/storekeeperDashboardlayout";
import {
  Search,
  Package,
  Utensils,
  Wrench,
  Plus,
  Download,
  X,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Filter,
  ChevronRight,
  ChevronLeft,
  Activity,
  ShieldCheck,
  Zap,
  Box,
  Layers,
  ArrowRight,
  ClipboardList,
  LayoutGrid,
  Table,
} from "lucide-react";
import { itemsApi, stockApi } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

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
  icon: Icon = Package,
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
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  {title}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  Operational Log Entry
                </p>
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
                saveDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95"
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

const ItemsListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const itemsPerPage = viewMode === "grid" ? 6 : 5;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [newItem, setNewItem] = useState({
    name: "",
    category: "food",
    currentQty: "",
    unit: "kg",
    minQty: "",
    dailyLimit: "",
  });

  const [stockInQuantity, setStockInQuantity] = useState("");
  const [stockInNotes, setStockInNotes] = useState("");

  const categories = [
    {
      id: "all",
      name: "Full Catalog",
      icon: Box,
      color: "bg-slate-500",
      bgColor: "bg-slate-50",
      textColor: "text-slate-600",
    },
    {
      id: "food",
      name: "Food Items",
      icon: Utensils,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      id: "equipment",
      name: "Equipment",
      icon: ShieldCheck,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      id: "tools",
      name: "Tools",
      icon: Wrench,
      color: "bg-violet-500",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  const units = ["kg", "liters", "pcs", "boxes", "packets"];

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  const getUserId = () => {
    const user = getCurrentUser();
    return user?.id || user?._id;
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const data = await itemsApi.getAllItems(params);
      setItems(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchItems]);

  const [stats, setStats] = useState({
    foodCount: 0,
    equipmentCount: 0,
    toolsCount: 0,
    limitedItemsCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await itemsApi.getItemStats();
        setStats(statsData);
      } catch (error) {
        console.error("Stats Error:", error);
      }
    };
    fetchStats();
  }, []);

  const handleOpenAddModal = () => {
    setNewItem({
      name: "",
      category: "food",
      currentQty: "",
      unit: "kg",
      minQty: "",
      dailyLimit: "",
    });
    setShowAddModal(true);
  };

  const handleOpenStockInModal = (item) => {
    setSelectedItem(item);
    setStockInQuantity("");
    setStockInNotes("");
    setShowStockInModal(true);
  };

  const handleAddItem = async () => {
    // Validate required fields
    if (!newItem.name.trim()) {
      alert("Please enter a resource designation");
      return;
    }
    if (newItem.currentQty === "" || newItem.currentQty === null) {
      alert("Please enter the inaugural quantity");
      return;
    }
    if (newItem.minQty === "" || newItem.minQty === null) {
      alert("Please enter the safety floor quantity");
      return;
    }
    if (
      newItem.category === "food" &&
      (newItem.dailyLimit === "" || newItem.dailyLimit === null)
    ) {
      alert("Please enter the daily limit for food items");
      return;
    }

    try {
      const payload = {
        ...newItem,
        currentQty: parseFloat(newItem.currentQty),
        minQty: parseFloat(newItem.minQty),
        dailyLimit:
          newItem.category === "food" ? parseFloat(newItem.dailyLimit) : 0,
      };
      await itemsApi.createItem(payload);
      setShowAddModal(false);
      fetchItems();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleStockIn = async () => {
    const quantity = parseFloat(stockInQuantity);
    if (quantity <= 0 || isNaN(quantity)) {
      alert("Please enter a valid quantity");
      return;
    }
    if (!stockInNotes.trim()) {
      alert("Transaction notes are required");
      return;
    }
    const userId = getUserId();
    if (!userId) return alert("Session expired. Please re-login.");

    try {
      await stockApi.stockIn(selectedItem.id, quantity, stockInNotes, userId);
      setShowStockInModal(false);
      fetchItems();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  // Check if add item form is valid
  const isAddFormValid = () => {
    if (!newItem.name.trim()) return false;
    if (newItem.currentQty === "" || newItem.currentQty === null) return false;
    if (newItem.minQty === "" || newItem.minQty === null) return false;
    if (
      newItem.category === "food" &&
      (newItem.dailyLimit === "" || newItem.dailyLimit === null)
    )
      return false;
    return true;
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStockStatus = (current, min) => {
    if (current <= min * 0.3)
      return {
        text: "CRITICAL",
        color: "text-rose-600",
        dot: "bg-rose-500",
        bgColor: "bg-rose-50",
      };
    if (current <= min)
      return {
        text: "LOW",
        color: "text-amber-600",
        dot: "bg-amber-500",
        bgColor: "bg-amber-50",
      };
    return {
      text: "OPERATIONAL",
      color: "text-emerald-600",
      dot: "bg-emerald-500",
      bgColor: "bg-emerald-50",
    };
  };

  return (
    <DashboardWrapper>
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
                  Storekeeper Operations
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Inventory <span className="text-indigo-600">Console</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                Maintain high operational readiness. Track levels and record
                inbound shipments with precision.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <Plus size={16} />
                Register New Stock
              </motion.button>
            </div>
          </div>
        </div>

        {/* Action Row: Stats & Filters */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-10">
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dynamic Stats Cards */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
              <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 transition-colors">
                <Utensils className="text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Food Provisions
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {stats.foodCount}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
              <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors">
                <Package className="text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Equipment Assets
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {stats.equipmentCount}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex items-center gap-6 group hover:scale-[1.02] transition-transform">
              <div className="p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-600 transition-colors">
                <Zap className="text-amber-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Limited Access
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {stats.limitedItemsCount}
                </p>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Locate resource..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 shadow-sm"
              }`}
            >
              <cat.icon size={14} />
              {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Main Data Table */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl">
                <Layers className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Active Stock Manifest
                </h2>
                <p className="text-slate-500 font-medium">
                  Monitoring current deployment levels
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm mr-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "table" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Table size={18} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shadow-sm">
                <Download size={20} />
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              {viewMode === "table" ? (
                <motion.div
                  key="table-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="overflow-x-auto no-scrollbar"
                >
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Resource
                        </th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Class
                        </th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Stock Level
                        </th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Operation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="py-20 text-center">
                            <Activity className="animate-spin text-indigo-600 mx-auto" />
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((item, idx) => {
                          const status = getStockStatus(
                            item.currentQty,
                            item.minQty,
                          );
                          return (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.02 }}
                              className="hover:bg-indigo-50/20 transition-colors group"
                            >
                              <td className="px-6 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                    {item.category === "food" ? (
                                      <Utensils
                                        className="text-emerald-500"
                                        size={18}
                                      />
                                    ) : item.category === "equipment" ? (
                                      <ShieldCheck
                                        className="text-indigo-500"
                                        size={18}
                                      />
                                    ) : (
                                      <Wrench
                                        className="text-violet-500"
                                        size={18}
                                      />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                      Min Level: {item.minQty} {item.unit}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6 text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                                {item.category}
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-slate-800">
                                      {item.currentQty}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                      {item.unit}
                                    </span>
                                  </div>
                                  <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${Math.min(100, (item.currentQty / (item.minQty * 2)) * 100)}%`,
                                      }}
                                      className={`h-full ${status.dot}`}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${status.bgColor} ${status.color} border-transparent shadow-sm`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}
                                  />
                                  {status.text}
                                </span>
                              </td>
                              <td className="px-6 py-6 text-right">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleOpenStockInModal(item)}
                                  className="p-3 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-100"
                                >
                                  <TrendingUp size={16} />
                                </motion.button>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </motion.div>
              ) : (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {loading ? (
                    <div className="col-span-full py-20 text-center">
                      <Activity className="animate-spin text-indigo-600 mx-auto" />
                    </div>
                  ) : (
                    currentItems.map((item, idx) => {
                      const status = getStockStatus(
                        item.currentQty,
                        item.minQty,
                      );
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                              {item.category === "food" ? (
                                <Utensils
                                  className="text-emerald-500"
                                  size={24}
                                />
                              ) : item.category === "equipment" ? (
                                <ShieldCheck
                                  className="text-indigo-500"
                                  size={24}
                                />
                              ) : (
                                <Wrench className="text-violet-500" size={24} />
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${status.bgColor} ${status.color}`}
                            >
                              {status.text}
                            </span>
                          </div>

                          <div className="space-y-1 mb-6">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                              {item.category}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Stock
                              </p>
                              <p className="text-base font-black text-slate-800">
                                {item.currentQty}{" "}
                                <span className="text-[10px] text-slate-400">
                                  {item.unit}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Safety
                              </p>
                              <p className="text-base font-black text-slate-800">
                                {item.minQty}{" "}
                                <span className="text-[10px] text-slate-400">
                                  {item.unit}
                                </span>
                              </p>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOpenStockInModal(item)}
                            className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all shadow-sm"
                          >
                            <TrendingUp size={14} />
                            Restock Asset
                          </motion.button>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination UI */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-slate-100 gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing{" "}
              <span className="text-slate-800">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredItems.length)}
              </span>{" "}
              of <span className="text-slate-800">{filteredItems.length}</span>{" "}
              resources
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <PremiumModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="New Resource Entry"
          onSave={handleAddItem}
          saveText="Finalize Registration"
          saveDisabled={!isAddFormValid()}
          icon={Plus}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Resource Designation
              </label>
              <input
                type="text"
                placeholder="Item name..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Classification
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem((p) => ({
                      ...p,
                      category: e.target.value,
                      dailyLimit: e.target.value !== "food" ? "" : p.dailyLimit,
                    }))
                  }
                >
                  {categories.slice(1).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Metric Unit
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, unit: e.target.value }))
                  }
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Inaugural Qty
                </label>
                <input
                  type="number"
                  placeholder="Enter quantity..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.currentQty}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, currentQty: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Safety Floor
                </label>
                <input
                  type="number"
                  placeholder="Enter min quantity..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.minQty}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, minQty: e.target.value }))
                  }
                />
              </div>
            </div>
            {/* Daily Limit Field - Only shown for food category */}
            {newItem.category === "food" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                  <span>Daily Limit</span>
                  <span className="text-rose-500">* Required</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter daily limit..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.dailyLimit}
                  onChange={(e) =>
                    setNewItem((p) => ({ ...p, dailyLimit: e.target.value }))
                  }
                />
              </div>
            )}
          </div>
        </PremiumModal>

        <PremiumModal
          isOpen={showStockInModal}
          onClose={() => setShowStockInModal(false)}
          title="Inbound Log"
          onSave={handleStockIn}
          saveText="Execute Protocol"
          saveDisabled={
            !stockInQuantity ||
            parseFloat(stockInQuantity) <= 0 ||
            !stockInNotes.trim()
          }
          icon={TrendingUp}
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                <ClipboardList />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Inbound For
                </p>
                <h4 className="font-black text-slate-800">
                  {selectedItem?.name}
                </h4>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Received Quantity</span>
                <span className="text-rose-500">* Required</span>
              </label>
              <input
                type="number"
                placeholder="Enter amount..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                value={stockInQuantity}
                onChange={(e) => setStockInQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Transaction Notes</span>
                <span className="text-rose-500">* Required</span>
              </label>
              <textarea
                rows="3"
                placeholder="Log details..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 resize-none"
                value={stockInNotes}
                onChange={(e) => setStockInNotes(e.target.value)}
              />
            </div>
          </div>
        </PremiumModal>
      </div>
    </DashboardWrapper>
  );
};

export default ItemsListPage;
