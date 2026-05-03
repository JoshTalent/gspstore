import React, { useState, useEffect, useCallback } from "react";
import ManagerDashboardWrapper from "../../components/managerDashboardlayout";
import {
  Search,
  Package,
  Utensils,
  Wrench,
  Plus,
  Edit2,
  Download,
  X,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Trash2,
  Filter,
  FileText,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Activity,
  History,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Info
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
  saveText = "Save",
  saveButtonStyle = "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Configuration & Logic</p>
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

const ItemsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [stats, setStats] = useState({
    foodCount: 0,
    equipmentCount: 0,
    toolsCount: 0,
    limitedItemsCount: 0,
  });

  const categories = [
    { id: "all", name: "Universe", icon: Package, color: "from-slate-500 to-slate-700", bgColor: "bg-slate-50", textColor: "text-slate-600", borderColor: "border-slate-200" },
    { id: "food", name: "Food", icon: Utensils, color: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50", textColor: "text-emerald-600", borderColor: "border-emerald-200" },
    { id: "equipment", name: "Equipment", icon: ShieldCheck, color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50", textColor: "text-blue-600", borderColor: "border-blue-200" },
    { id: "tools", name: "Tools", icon: Wrench, color: "from-violet-500 to-purple-600", bgColor: "bg-violet-50", textColor: "text-violet-600", borderColor: "border-violet-200" },
  ];

  const units = ["kg", "liters", "pcs", "boxes", "packets"];

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await itemsApi.getAllItems(params);
      let itemsData = [];

      if (Array.isArray(response)) {
        itemsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        itemsData = response.data;
      } else if (response?.items && Array.isArray(response.items)) {
        itemsData = response.items;
      } else if (response?.success === true && response.data) {
        itemsData = response.data;
      }

      setItems(itemsData);
    } catch (error) {
      setError(error.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await itemsApi.getItemStats();
        setStats({
          foodCount: statsData?.foodCount || 0,
          equipmentCount: statsData?.equipmentCount || 0,
          toolsCount: statsData?.toolsCount || 0,
          limitedItemsCount: statsData?.limitedItemsCount || 0,
        });
      } catch (error) {
        console.error("Stats Error:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchItems]);

  const handleOpenAddModal = () => {
    setNewItem({ name: "", category: "food", currentQty: "", unit: "kg", minQty: "", dailyLimit: "" });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedItem(item);
    setNewItem({
      ...item,
      dailyLimit: item.dailyLimit || "",
      currentQty: item.currentQty?.toString() || "",
      minQty: item.minQty?.toString() || "",
    });
    setShowEditModal(true);
  };

  const handleOpenStockInModal = (item) => {
    setSelectedItem(item);
    setStockInQuantity("");
    setStockInNotes("");
    setShowStockInModal(true);
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedItem(item);
    setDeleteConfirmation("");
    setIsDeleteEnabled(false);
    setForceDelete(false);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || newItem.currentQty === "" || newItem.minQty === "") {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await itemsApi.createItem({
        ...newItem,
        currentQty: parseFloat(newItem.currentQty),
        minQty: parseFloat(newItem.minQty),
        dailyLimit: newItem.category === "food" && newItem.dailyLimit !== "" ? parseFloat(newItem.dailyLimit) : 0,
      });
      setShowAddModal(false);
      fetchItems();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditItem = async () => {
    try {
      await itemsApi.updateItem(selectedItem.id, {
        ...newItem,
        currentQty: parseFloat(newItem.currentQty),
        minQty: parseFloat(newItem.minQty),
        dailyLimit: newItem.category === "food" && newItem.dailyLimit !== "" ? parseFloat(newItem.dailyLimit) : 0,
      });
      setShowEditModal(false);
      fetchItems();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await itemsApi.deleteItem(selectedItem.id, forceDelete);
      setShowDeleteModal(false);
      fetchItems();
    } catch (error) {
      setDeleteError(error.message);
      if (!error.message.includes("existing transactions")) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleStockIn = async () => {
    const quantity = parseFloat(stockInQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    if (!stockInNotes.trim()) {
      alert("Verification notes are required");
      return;
    }
    try {
      await stockApi.stockIn(selectedItem.id, quantity, stockInNotes);
      setShowStockInModal(false);
      fetchItems();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      setIsDeleteEnabled(deleteConfirmation === `delete ${selectedItem.name}`);
    }
  }, [deleteConfirmation, selectedItem]);

  const getStockStatus = (current, min) => {
    if (current <= min * 0.3)
      return { text: "CRITICAL", color: "bg-rose-500", dot: "bg-rose-500", bgColor: "bg-rose-50", textColor: "text-rose-700", icon: AlertCircle };
    if (current <= min)
      return { text: "LOW", color: "bg-amber-500", dot: "bg-amber-500", bgColor: "bg-amber-50", textColor: "text-amber-700", icon: Clock };
    return { text: "HEALTHY", color: "bg-emerald-500", dot: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700", icon: CheckCircle };
  };

  const StatusBadge = ({ status }) => {
    const Icon = status.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${status.bgColor} ${status.textColor} border-transparent shadow-sm`}>
        <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
        {status.text}
      </span>
    );
  };

  const CategoryBadge = ({ category }) => {
    const config = categories.find(c => c.id === category) || categories[0];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black tracking-widest border ${config.bgColor} ${config.textColor} border-slate-100`}>
        <Icon size={12} />
        {config.name.toUpperCase()}
      </span>
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ManagerDashboardWrapper>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em]">Inventory Hub</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Stock <span className="text-indigo-600">Architect</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                Global inventory control center. Add, modify, and monitor your mission-critical resources.
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
                Deploy New Item
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filters & Stats Row */}
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
                 Intelligence Search
               </h2>
               <div className="relative">
                 <input
                   type="text"
                   placeholder="Identify item..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="xl:col-span-3 space-y-8">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Inventory</h2>
                  <p className="text-slate-500 font-medium">Real-time status and deployment metrics</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400">
                    <Download size={20} className="hover:text-indigo-600 transition-colors cursor-pointer" />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto no-scrollbar p-4 md:p-8">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Class</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Health</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       <tr><td colSpan="5" className="py-20 text-center"><div className="flex flex-col items-center gap-4"><Activity className="animate-spin text-indigo-600" /><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Intelligence...</span></div></td></tr>
                    ) : (
                      currentItems.map((item, idx) => {
                        const status = getStockStatus(item.currentQty, item.minQty);
                        return (
                          <motion.tr 
                            key={item.id} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="hover:bg-indigo-50/30 transition-colors group"
                          >
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                                  {item.category === "food" ? <Utensils className="text-emerald-500" size={18} /> : 
                                   item.category === "equipment" ? <ShieldCheck className="text-blue-500" size={18} /> : 
                                   <Wrench className="text-violet-500" size={18} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-slate-800">{item.name}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">REF: {item.id.slice(-8).toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <CategoryBadge category={item.category} />
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800">{item.currentQty} <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</span></span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (item.currentQty / (item.minQty * 2)) * 100)}%` }}
                                    className={`h-full ${status.color}`}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <StatusBadge status={status} />
                            </td>
                            <td className="px-6 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleOpenStockInModal(item)}
                                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                >
                                  <TrendingUp size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Edit2 size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleOpenDeleteModal(item)}
                                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
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

        {/* Add/Edit Modals */}
        <PremiumModal
          isOpen={showAddModal || showEditModal}
          onClose={() => { setShowAddModal(false); setShowEditModal(false); }}
          title={showAddModal ? "Initialize Resource" : "Update Resource"}
          onSave={showAddModal ? handleAddItem : handleEditItem}
          saveText={showAddModal ? "Deploy" : "Update"}
          icon={showAddModal ? Plus : Edit2}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource Name</label>
              <input
                type="text"
                placeholder="Unique identifier..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                value={newItem.name}
                onChange={(e) => setNewItem(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.category}
                  onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}
                >
                  {categories.slice(1).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Metric</label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.unit}
                  onChange={(e) => setNewItem(p => ({ ...p, unit: e.target.value }))}
                >
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Qty</label>
                <input
                  type="number"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.currentQty}
                  onChange={(e) => setNewItem(p => ({ ...p, currentQty: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical Level</label>
                <input
                  type="number"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.minQty}
                  onChange={(e) => setNewItem(p => ({ ...p, minQty: e.target.value }))}
                />
              </div>
            </div>
            {newItem.category === "food" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Quota Limit</label>
                <input
                  type="number"
                  placeholder="Set limit..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  value={newItem.dailyLimit}
                  onChange={(e) => setNewItem(p => ({ ...p, dailyLimit: e.target.value }))}
                />
              </div>
            )}
          </div>
        </PremiumModal>

        {/* Stock In Modal */}
        <PremiumModal
          isOpen={showStockInModal}
          onClose={() => setShowStockInModal(false)}
          title="Stock Inbound"
          onSave={handleStockIn}
          saveText="Verify & Add"
          saveDisabled={!stockInQuantity || parseFloat(stockInQuantity) <= 0 || !stockInNotes.trim()}
          icon={TrendingUp}
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm">
                 <Package className="text-indigo-600" />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Item</p>
                 <h4 className="font-black text-slate-800">{selectedItem?.name}</h4>
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Arrival Quantity</span>
                <span className="text-rose-500">* Required</span>
              </label>
              <input
                type="number"
                placeholder="Amount to add..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                value={stockInQuantity}
                onChange={(e) => setStockInQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Verification Notes</span>
                <span className="text-rose-500">* Required</span>
              </label>
              <textarea
                rows="3"
                placeholder="Transaction details..."
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 resize-none"
                value={stockInNotes}
                onChange={(e) => setStockInNotes(e.target.value)}
              />
            </div>
          </div>
        </PremiumModal>

        {/* Delete Modal */}
        <PremiumModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Archive Protocol"
          onSave={handleDeleteItem}
          saveText="Confirm Archive"
          saveButtonStyle="bg-rose-600 hover:bg-rose-700 shadow-rose-200"
          saveDisabled={!isDeleteEnabled}
          icon={Trash2}
        >
          <div className="space-y-6">
            <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100 flex items-start gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-500">
                 <AlertCircle />
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Warning: Permanent Action</p>
                 <p className="text-sm font-bold text-rose-800">Archiving {selectedItem?.name} will remove it from active intelligence reports.</p>
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Token</label>
              <input
                type="text"
                placeholder={`Type "delete ${selectedItem?.name}"`}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-rose-500"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
              />
            </div>

            {deleteError && deleteError.includes("existing transactions") && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                    <History size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">History Conflict Detected</p>
                    <p className="text-xs font-medium text-amber-800">
                      This resource has active transaction records. Standard archiving is blocked.
                    </p>
                  </div>
                </div>
                
                <label className="flex items-center gap-3 p-3 bg-white/50 rounded-xl cursor-pointer hover:bg-white transition-all group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 group-hover:text-amber-600">
                    Force Archive (Delete all history)
                  </span>
                </label>
              </motion.div>
            )}
          </div>
        </PremiumModal>
      </div>
    </ManagerDashboardWrapper>
  );
};

export default ItemsList;
