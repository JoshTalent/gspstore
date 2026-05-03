import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend,
} from "recharts";
import ManagerDashboardWrapper from "../../components/managerDashboardlayout";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Clock,
  AlertCircle,
  Info,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  ChevronLeft,
  BarChart as BarChartIcon,
  Table,
  Grid,
  Package,
  Truck,
  Shield,
  Database,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  ShieldAlert,
  Utensils,
  Wrench,
  Hammer,
  X,
  Maximize2,
  Minimize2,
  Printer,
  FileSpreadsheet,
  File,
  Settings,
  DownloadCloud,
  ChevronRight as ChevronRightIcon,
  Hash,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Map,
  Zap,
  User,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper function to format date for filename
const formatDateForFilename = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
};

// Helper to convert data to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      const escaped =
        val !== undefined && val !== null
          ? String(val).replace(/"/g, '""')
          : "";
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};

// Helper to download file
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export Progress Modal
const ExportProgressModal = ({ isOpen, onClose, progress, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <DownloadCloud className="w-8 h-8 text-blue-600 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Exporting Report
          </h3>
          <p className="text-gray-600 mb-4">
            Generating {fileName}... Please wait
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{progress}% completed</p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Advanced Export Modal Component
const AdvancedExportModal = ({
  isOpen,
  onClose,
  onExport,
  reportType,
  defaultFilters,
}) => {
  const [exportOptions, setExportOptions] = useState({
    format: "excel",
    dateRange: "monthly",
    customStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    customEnd: new Date().toISOString().split("T")[0],
    category: "",
    status: "",
    lossType: "",
    transactionType: "",
    itemId: "",
    includeSummary: true,
    includeDetails: true,
    groupByCategory: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && defaultFilters) {
      setExportOptions((prev) => ({
        ...prev,
        category: defaultFilters.category || "",
        status: defaultFilters.status || "",
        lossType: defaultFilters.loss_type || "",
        itemId: defaultFilters.item_id || "",
        transactionType: defaultFilters.type || "",
      }));
    }
  }, [isOpen, defaultFilters]);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(exportOptions.format, exportOptions);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formats = [
    { id: "excel", name: "Excel", description: "Microsoft Excel", icon: "📈" },
    {
      id: "pdf",
      name: "PDF",
      description: "Portable Document Format",
      icon: "📄",
    },
    {
      id: "print",
      name: "Print",
      description: "Hardcopy Protocol",
      icon: "🖨️",
    },
  ];

  const dateRanges = [
    { id: "today", name: "Today", days: 1 },
    { id: "yesterday", name: "Yesterday", days: 1 },
    { id: "weekly", name: "Last 7 Days", days: 7 },
    { id: "monthly", name: "Last 30 Days", days: 30 },
    { id: "quarterly", name: "Last 90 Days", days: 90 },
    { id: "custom", name: "Custom Range", days: null },
  ];

  const categories = [
    { id: "food", name: "Food", icon: "🍎" },
    { id: "equipment", name: "Equipment", icon: "🔧" },
    { id: "tools", name: "Tools", icon: "🛠️" },
  ];

  const statuses = [
    { id: "LOW", name: "Low Stock" },
    { id: "WARNING", name: "Warning" },
    { id: "OK", name: "OK" },
    { id: "HIGH", name: "High Stock" },
    { id: "OUT_OF_STOCK", name: "Out of Stock" },
  ];

  const lossTypes = [
    { id: "damaged", name: "Damaged", icon: "💥" },
    { id: "stolen", name: "Stolen", icon: "🚨" },
    { id: "expired", name: "Expired", icon: "📅" },
  ];

  const transactionTypes = [
    { id: "IN", name: "Stock In", icon: "⬇️" },
    { id: "OUT", name: "Stock Out", icon: "⬆️" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Advanced Export</h2>
              <p className="text-blue-100 mt-1">
                Customize your report export options
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-8">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                Export Format
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() =>
                      setExportOptions({ ...exportOptions, format: format.id })
                    }
                    className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center justify-center ${
                      exportOptions.format === format.id
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-3xl mb-2">{format.icon}</span>
                    <span className="font-medium">{format.name}</span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      {format.description}
                    </span>
                    {exportOptions.format === format.id && (
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Time Period
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {dateRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() =>
                      setExportOptions({
                        ...exportOptions,
                        dateRange: range.id,
                      })
                    }
                    className={`p-3 border rounded-lg transition ${
                      exportOptions.dateRange === range.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium">{range.name}</span>
                    {range.days && (
                      <span className="text-xs text-gray-500 block">
                        ({range.days} days)
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {exportOptions.dateRange === "custom" && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={exportOptions.customStart}
                        onChange={(e) =>
                          setExportOptions({
                            ...exportOptions,
                            customStart: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={exportOptions.customEnd}
                        onChange={(e) =>
                          setExportOptions({
                            ...exportOptions,
                            customEnd: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={exportOptions.category}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {reportType === "stock-level" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Status
                    </label>
                    <select
                      value={exportOptions.status}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Status</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {reportType === "loss-analysis" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loss Type
                    </label>
                    <select
                      value={exportOptions.lossType}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          lossType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Types</option>
                      {lossTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {reportType === "stock-movement" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Type
                    </label>
                    <select
                      value={exportOptions.transactionType}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          transactionType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Types</option>
                      {transactionTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={exportOptions.itemId}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        itemId: e.target.value,
                      })
                    }
                    placeholder="Enter item ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Advanced Options
              </h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-700">
                      Include Summary Section
                    </span>
                    <p className="text-sm text-gray-500">
                      Add KPIs and metrics summary
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSummary}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeSummary: e.target.checked,
                      })
                    }
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-700">
                      Include Detailed Data
                    </span>
                    <p className="text-sm text-gray-500">
                      Add detailed transaction records
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDetails}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeDetails: e.target.checked,
                      })
                    }
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-700">
                      Group by Category
                    </span>
                    <p className="text-sm text-gray-500">
                      Organize data by category
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={exportOptions.groupByCategory}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        groupByCategory: e.target.checked,
                      })
                    }
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600 flex items-center">
            <Info className="w-4 h-4 mr-2 text-blue-500" />
            Export will be generated with selected options
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium flex items-center disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4 mr-2" />
              )}
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Record Detail Modal
const RecordDetailModal = ({
  isOpen,
  onClose,
  record,
  getHeaderDisplayName,
  StatusBadge,
  CategoryBadge,
}) => {
  if (!isOpen || !record) return null;

  // Exclude some internal fields
  const excludeFields = [
    "_id",
    "id",
    "item_id",
    "user_id",
    "__v",
    "created_at",
    "updated_at",
    "_internal_id",
    "display_name",
    "itemId",
    "type",
    "transaction_type",
    "loss_type",
    "status",
    "category",
  ];

  const fields = Object.keys(record).filter(
    (key) => !excludeFields.includes(key),
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/50"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Intelligence Report
                </h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                  Entry Verification & Deep Analysis
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-rose-500 transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-10 overflow-y-auto max-h-[70vh] no-scrollbar">
            <div className="space-y-8">
              {/* High-Level Info */}
              <div className="flex flex-col md:flex-row gap-6 p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <Package className="w-24 h-24 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                    Subject Identification
                  </p>
                  <h3 className="text-3xl font-black text-slate-800 leading-tight mb-4">
                    {record.item_name || record.name || "System Record"}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {record.category && (
                      <CategoryBadge category={record.category} />
                    )}
                    {record.status && <StatusBadge status={record.status} />}
                    {record.type && <StatusBadge status={record.type} />}
                    {record.transaction_type && (
                      <StatusBadge status={record.transaction_type} />
                    )}
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-4">
                {fields.map((key) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col space-y-1 group"
                  >
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
                      {getHeaderDisplayName(key)}
                    </span>
                    <span className="text-slate-700 font-black text-sm tracking-tight border-b border-slate-50 pb-2 group-hover:border-indigo-100 transition-all">
                      {key === "transaction_date" ||
                      key === "loss_date" ||
                      key === "date" ||
                      key === "created_at"
                        ? new Date(record[key]).toLocaleString("en-US", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })
                        : String(record[key] || "—")}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
            >
              Acknowledge
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Main StockReports Component
const StockReports = () => {
  // State for API data
  const [reports, setReports] = useState({
    stockLevel: null,
    stockMovement: null,
    lossAnalysis: null,
    dashboard: null,
    itemPerformance: null,
  });

  const [loading, setLoading] = useState({
    dashboard: false,
    stockLevel: false,
    stockMovement: false,
    lossAnalysis: false,
    itemPerformance: false,
  });

  const [error, setError] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [currentExportFile, setCurrentExportFile] = useState("");

  // Time period state
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Report type state
  const [reportType, setReportType] = useState("dashboard");
  const [showDetails, setShowDetails] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    status: "",
    loss_type: "",
    item_id: "",
    type: "",
  });

  // View state
  const [viewMode, setViewMode] = useState("table");
  const [expandedView, setExpandedView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [exporting, setExporting] = useState(false);

  // Export modal state
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);

  // Detail Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sync items per page with view mode
  useEffect(() => {
    if (viewMode === "grid") {
      setItemsPerPage(6);
    } else if (viewMode === "table") {
      setItemsPerPage(5);
    }
  }, [viewMode]);

  // API Configuration
  const API_BASE_URL = "https://white-tooth-0336.this-enable.workers.dev/api";
  const getToken = () => localStorage.getItem("token");

  const apiRequest = async (endpoint, method = "GET", data = null) => {
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config = { method, headers };
    if (data && method !== "GET") config.body = JSON.stringify(data);

    try {
      let url = `${API_BASE_URL}${endpoint}`;
      if (method === "GET" && data && Object.keys(data).length > 0) {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "")
            params.append(key, value);
        });
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
      }

      const response = await fetch(url, config);
      const responseData = await response.json();

      // Handle session expiration (401 Unauthorized)
      if (response.status === 401) {
        console.warn("Session expired or unauthorized. Logging out...");
        localStorage.clear();
        window.location.href = "/login?expired=true";
        return;
      }

      if (!response.ok)
        throw new Error(
          responseData.error || `HTTP error! status: ${response.status}`,
        );
      return responseData;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // Time period options
  const timePeriods = [
    { id: "today", label: "Today", days: 1 },
    { id: "yesterday", label: "Yesterday", days: 1 },
    { id: "weekly", label: "Last 7 Days", days: 7 },
    { id: "monthly", label: "Last 30 Days", days: 30 },
    { id: "quarterly", label: "Last 90 Days", days: 90 },
    { id: "custom", label: "Custom Range", days: null },
  ];

  // Report type configuration
  const reportTypes = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      color: "bg-blue-500",
      endpoint: "dashboard",
    },
    {
      id: "stock-level",
      label: "Stock Levels",
      icon: Package,
      color: "bg-green-500",
      endpoint: "stock-level",
    },
    {
      id: "stock-movement",
      label: "Movement",
      icon: Truck,
      color: "bg-purple-500",
      endpoint: "stock-movement",
    },
    {
      id: "loss-analysis",
      label: "Loss Analysis",
      icon: Shield,
      color: "bg-yellow-500",
      endpoint: "loss-analysis",
    },
    {
      id: "item-performance",
      label: "Performance",
      icon: TrendingUp,
      color: "bg-pink-500",
      endpoint: "item-performance",
    },
  ];

  // View modes
  const viewModes = [
    { id: "table", label: "Table", icon: Table },
    { id: "grid", label: "Grid", icon: Grid },
    { id: "chart", label: "Chart", icon: BarChartIcon },
  ];

  // Fetch functions
  const fetchDashboardReport = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, dashboard: true }));
      const response = await apiRequest("/reports/dashboard", "GET");
      if (response && response.success) {
        setReports((prev) => ({ ...prev, dashboard: response }));
      } else {
        setReports((prev) => ({
          ...prev,
          dashboard: {
            kpis: {},
            recent_transactions: [],
            recent_losses: [],
            recent_alerts: [],
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching dashboard report:", err);
      setReports((prev) => ({
        ...prev,
        dashboard: {
          kpis: {},
          recent_transactions: [],
          recent_losses: [],
          recent_alerts: [],
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, dashboard: false }));
    }
  }, []);

  const fetchStockLevelReport = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, stockLevel: true }));
      const params = {};
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.status) params.status = activeFilters.status;
      if (activeFilters.item_id) params.item_id = activeFilters.item_id;

      const response = await apiRequest("/reports/stock-level", "GET", params);
      if (response && response.success) {
        setReports((prev) => ({ ...prev, stockLevel: response }));
      } else {
        setReports((prev) => ({
          ...prev,
          stockLevel: { items: [], summary: {} },
        }));
      }
    } catch (err) {
      console.error("Error fetching stock level report:", err);
      setReports((prev) => ({
        ...prev,
        stockLevel: { items: [], summary: {} },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, stockLevel: false }));
    }
  }, [activeFilters.category, activeFilters.status, activeFilters.item_id]);

  const fetchStockMovementReport = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, stockMovement: true }));
      const params = {};
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.item_id) params.item_id = activeFilters.item_id;
      if (activeFilters.type) params.type = activeFilters.type;

      if (timePeriod === "custom") {
        params.start_date = customDateRange.start;
        params.end_date = customDateRange.end;
      } else if (timePeriod === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        params.start_date = yesterday.toISOString().split("T")[0];
        params.end_date = yesterday.toISOString().split("T")[0];
      } else {
        const period = timePeriods.find((p) => p.id === timePeriod);
        if (period && period.days) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - period.days);
          params.start_date = startDate.toISOString().split("T")[0];
          params.end_date = new Date().toISOString().split("T")[0];
        }
      }

      const response = await apiRequest(
        "/reports/stock-movement",
        "GET",
        params,
      );
      if (response && response.success) {
        setReports((prev) => ({ ...prev, stockMovement: response }));
      } else {
        setReports((prev) => ({
          ...prev,
          stockMovement: { transactions: [], summary: {} },
        }));
      }
    } catch (err) {
      console.error("Error fetching stock movement report:", err);
      setReports((prev) => ({
        ...prev,
        stockMovement: { transactions: [], summary: {} },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, stockMovement: false }));
    }
  }, [
    timePeriod,
    customDateRange,
    activeFilters.category,
    activeFilters.item_id,
    activeFilters.type,
  ]);

  const fetchLossAnalysisReport = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, lossAnalysis: true }));
      const params = {};
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.loss_type) params.loss_type = activeFilters.loss_type;
      if (activeFilters.item_id) params.item_id = activeFilters.item_id;

      if (timePeriod === "custom") {
        params.start_date = customDateRange.start;
        params.end_date = customDateRange.end;
      } else if (timePeriod === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        params.start_date = yesterday.toISOString().split("T")[0];
        params.end_date = yesterday.toISOString().split("T")[0];
      } else {
        const period = timePeriods.find((p) => p.id === timePeriod);
        if (period && period.days) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - period.days);
          params.start_date = startDate.toISOString().split("T")[0];
          params.end_date = new Date().toISOString().split("T")[0];
        }
      }

      const response = await apiRequest(
        "/reports/loss-analysis",
        "GET",
        params,
      );
      if (response && response.success) {
        setReports((prev) => ({ ...prev, lossAnalysis: response }));
      } else {
        setReports((prev) => ({
          ...prev,
          lossAnalysis: { losses: [], summary: {} },
        }));
      }
    } catch (err) {
      console.error("Error fetching loss analysis report:", err);
      setReports((prev) => ({
        ...prev,
        lossAnalysis: { losses: [], summary: {} },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, lossAnalysis: false }));
    }
  }, [
    timePeriod,
    customDateRange,
    activeFilters.category,
    activeFilters.loss_type,
    activeFilters.item_id,
  ]);

  const fetchItemPerformanceReport = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, itemPerformance: true }));
      const params = {};
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.item_id) params.item_id = activeFilters.item_id;

      if (timePeriod === "today" || timePeriod === "daily") params.period = "1";
      else if (timePeriod === "yesterday") params.period = "1";
      else if (timePeriod === "weekly") params.period = "7";
      else if (timePeriod === "monthly") params.period = "30";
      else if (timePeriod === "quarterly") params.period = "90";

      const response = await apiRequest(
        "/reports/item-performance",
        "GET",
        params,
      );
      if (response && response.success) {
        setReports((prev) => ({ ...prev, itemPerformance: response }));
      } else {
        setReports((prev) => ({
          ...prev,
          itemPerformance: { items: [], summary: {} },
        }));
      }
    } catch (err) {
      console.error("Error fetching item performance report:", err);
      setReports((prev) => ({
        ...prev,
        itemPerformance: { items: [], summary: {} },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, itemPerformance: false }));
    }
  }, [timePeriod, activeFilters.category, activeFilters.item_id]);

  // Load report based on type
  const loadReport = useCallback(() => {
    setError(null);
    setCurrentPage(1);
    setShowDetails(null);

    switch (reportType) {
      case "dashboard":
        fetchDashboardReport();
        break;
      case "stock-level":
        fetchStockLevelReport();
        break;
      case "stock-movement":
        fetchStockMovementReport();
        break;
      case "loss-analysis":
        fetchLossAnalysisReport();
        break;
      case "item-performance":
        fetchItemPerformanceReport();
        break;
      default:
        fetchDashboardReport();
    }
  }, [
    reportType,
    fetchDashboardReport,
    fetchStockLevelReport,
    fetchStockMovementReport,
    fetchLossAnalysisReport,
    fetchItemPerformanceReport,
  ]);

  // Helper function to get item name from ID
  const getItemName = useCallback(
    (itemId) => {
      if (!itemId) return "Unknown";
      const items = reports.stockLevel?.items || [];
      const item = items.find((i) => i.id === itemId || i._id === itemId);
      if (item) return item.name;
      if (typeof itemId === "string" && !itemId.match(/^[0-9a-fA-F]{24}$/)) {
        return itemId;
      }
      return "Unknown Item";
    },
    [reports.stockLevel],
  );

  // Get display data based on report type
  const getDisplayData = useCallback(() => {
    const report =
      reports[
        reportType === "stock-level"
          ? "stockLevel"
          : reportType === "stock-movement"
            ? "stockMovement"
            : reportType === "loss-analysis"
              ? "lossAnalysis"
              : reportType === "item-performance"
                ? "itemPerformance"
                : "dashboard"
      ];
    if (!report) return [];

    switch (reportType) {
      case "stock-level":
        return (report.items || []).map((item) => ({
          ...item,
          display_name: item.name || "Unknown Item",
        }));

      case "stock-movement":
        return (report.transactions || []).map((t) => ({
          ...t,
          type: t.transaction_type?.toLowerCase() === "in" ? "in" : "out",
          item_name: t.item_name || getItemName(t.item_id),
          _internal_id: t.item_id,
        }));

      case "loss-analysis":
        return (report.losses || []).map((l) => ({
          ...l,
          type: "loss",
          item_name: l.item_name || getItemName(l.item_id),
          _internal_id: l.item_id,
        }));

      case "item-performance":
        return (report.items || []).map((item) => ({
          ...item,
          display_name: item.name || "Unknown Item",
        }));

      case "dashboard":
        return [
          ...(report.recent_transactions || []).map((t) => ({
            ...t,
            type: "transaction",
            item_name: t.item_name || getItemName(t.item_id),
          })),
          ...(report.recent_losses || []).map((l) => ({
            ...l,
            type: "loss",
            item_name: l.item_name || getItemName(l.item_id),
          })),
          ...(report.recent_alerts || []).map((a) => ({
            ...a,
            type: "alert",
            item_name: a.name,
          })),
        ];

      default:
        return [];
    }
  }, [reportType, reports, getItemName]);

  // Get summary data
  const getSummaryData = useCallback(() => {
    const report =
      reports[
        reportType === "stock-level"
          ? "stockLevel"
          : reportType === "stock-movement"
            ? "stockMovement"
            : reportType === "loss-analysis"
              ? "lossAnalysis"
              : reportType === "item-performance"
                ? "itemPerformance"
                : "dashboard"
      ];
    return report?.summary || {};
  }, [reportType, reports]);

  // Get displayable headers
  const getDisplayableHeaders = useCallback((data) => {
    if (!data.length) return [];
    const excludeColumns = [
      "_id",
      "id",
      "item_id",
      "user_id",
      "__v",
      "created_at",
      "updated_at",
      "_internal_id",
      "display_name",
      "itemId",
    ];
    return Object.keys(data[0])
      .filter((key) => !excludeColumns.includes(key))
      .slice(0, 12);
  }, []);

  // Get user-friendly header name
  const getHeaderDisplayName = (header) => {
    const nameMap = {
      name: "Item Name",
      display_name: "Item Name",
      item_name: "Item Name",
      current_qty: "Quantity",
      currentQty: "Quantity",
      min_qty: "Min Quantity",
      transaction_date: "Date",
      loss_date: "Date",
      transaction_type: "Type",
      loss_type: "Loss Type",
      stock_status: "Status",
      user_name: "User",
      reported_by: "Reported By",
      quantity: "Quantity",
      estimated_value: "Est. Value",
      description: "Description",
      reason: "Reason",
      category: "Category",
      unit: "Unit",
      turnover_rate: "Turnover Rate",
      turnover_rate_percentage: "Turnover %",
      days_of_supply: "Days Supply",
      demand_level: "Demand",
      safety_stock: "Safety Stock",
      type: "Type",
      notes: "Notes",
      status: "Status",
    };
    return nameMap[header] || header.replace(/_/g, " ").toUpperCase();
  };

  // Filter and sort data
  const getFilteredAndSortedData = useMemo(() => {
    let data = getDisplayData();

    if (searchQuery) {
      data = data.filter((item) => {
        const searchStr = searchQuery.toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(searchStr)) ||
          (item.display_name &&
            item.display_name.toLowerCase().includes(searchStr)) ||
          (item.item_name &&
            item.item_name.toLowerCase().includes(searchStr)) ||
          (item.category && item.category.toLowerCase().includes(searchStr))
        );
      });
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [getDisplayData, searchQuery, sortConfig]);

  // Get paginated data
  const getPaginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return getFilteredAndSortedData.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
  }, [getFilteredAndSortedData, currentPage, itemsPerPage]);

  // Get total pages
  const getTotalPages = useMemo(
    () => Math.ceil(getFilteredAndSortedData.length / itemsPerPage),
    [getFilteredAndSortedData, itemsPerPage],
  );

  // Sort handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const data = getFilteredAndSortedData;
    if (!data.length) {
      setError("No data to export");
      return;
    }
    const cleanData = data.map(({ _internal_id, ...rest }) => rest);
    const csv = convertToCSV(cleanData);
    downloadFile(
      csv,
      `${reportType}_report_${formatDateForFilename()}.csv`,
      "text/csv",
    );
  }, [getFilteredAndSortedData, reportType]);

  // Export to Excel
  const exportToExcel = useCallback(() => {
    const data = getFilteredAndSortedData;
    if (!data.length) {
      setError("No data to export");
      return;
    }
    const cleanData = data.map(({ _internal_id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
    XLSX.writeFile(
      workbook,
      `${reportType}_report_${formatDateForFilename()}.xlsx`,
    );
  }, [getFilteredAndSortedData, reportType]);

  // Export to PDF
  const exportToPDF = useCallback(() => {
    const data = getFilteredAndSortedData;
    if (!data.length) {
      setError("No data to export");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(16);
      doc.text(`${reportType.toUpperCase()} Report`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
      doc.text(`Total Records: ${data.length}`, 14, 35);

      const headers = getDisplayableHeaders(data);
      const rows = data.slice(0, 100).map((row) =>
        headers.map((header) => {
          let value = row[header];
          if (value === undefined || value === null) return "-";
          if (typeof value === "object")
            return JSON.stringify(value).substring(0, 50);
          return String(value).substring(0, 50);
        }),
      );

      const displayHeaders = headers.map((h) => getHeaderDisplayName(h));

      autoTable(doc, {
        head: [displayHeaders],
        body: rows,
        startY: 45,
        theme: "striped",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: { fontSize: 7 },
        margin: { top: 10, left: 10, right: 10 },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
          );
        },
      });

      doc.save(`${reportType}_report_${formatDateForFilename()}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      setError("PDF export failed: " + err.message);
    }
  }, [getFilteredAndSortedData, reportType, getDisplayableHeaders]);

  // Export to JSON
  const exportToJSON = useCallback(() => {
    const data = getFilteredAndSortedData;
    const summary = getSummaryData();
    const cleanData = data.map(({ _internal_id, ...rest }) => rest);
    const exportData = {
      metadata: {
        report_type: reportType,
        generated_at: new Date().toISOString(),
        total_records: cleanData.length,
      },
      summary,
      data: cleanData,
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    downloadFile(
      jsonStr,
      `${reportType}_report_${formatDateForFilename()}.json`,
      "application/json",
    );
  }, [getFilteredAndSortedData, getSummaryData, reportType]);

  // Main export handler
  const handleExport = useCallback(
    async (format, options = {}) => {
      setExporting(true);
      setShowExportProgress(true);
      setExportProgress(0);
      setCurrentExportFile(
        `${reportType}_report.${format === "excel" ? "xlsx" : format}`,
      );

      const progressInterval = setInterval(
        () => setExportProgress((prev) => Math.min(prev + 10, 90)),
        500,
      );

      try {
        setExportProgress(100);

        switch (format) {
          case "excel":
            exportToExcel();
            break;
          case "pdf":
            exportToPDF();
            break;
          case "print":
            printReport();
            break;
          default:
            exportToExcel();
        }

        setTimeout(() => setShowExportProgress(false), 1000);
      } catch (err) {
        console.error("Export error:", err);
        setError("Export failed. Please try again.");
        setShowExportProgress(false);
      } finally {
        clearInterval(progressInterval);
        setExporting(false);
      }
    },
    [reportType, exportToCSV, exportToExcel, exportToPDF, exportToJSON],
  );

  // Quick export
  const handleQuickExport = useCallback(
    (format) => {
      handleExport(format);
    },
    [handleExport],
  );

  // Print report
  const printReport = useCallback(() => {
    const printWindow = window.open("", "_blank");
    const data = getFilteredAndSortedData;
    const headers = getDisplayableHeaders(data);
    const displayHeaders = headers.map((h) => getHeaderDisplayName(h));

    printWindow.document.write(`
      <html><head><title>${reportType} Report</title>
      <style>body{font-family:Arial;margin:20px}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#4CAF50;color:white}</style>
      </head><body>
      <h1>${reportType.toUpperCase()} Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p><strong>Total Records:</strong> ${data.length}</p>
      <table><thead><tr>${displayHeaders.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${data
        .slice(0, 50)
        .map(
          (row) =>
            `<tr>${headers.map((h) => `<td>${row[h] || "-"}</td>`).join("")}</tr>`,
        )
        .join("")}
      </tbody></table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [getFilteredAndSortedData, reportType, getDisplayableHeaders]);

  // Enhanced Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      OK: {
        label: "Operational",
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: CheckCircle,
      },
      WARNING: {
        label: "Warning",
        color: "bg-amber-50 text-amber-700 border-amber-100",
        icon: AlertTriangle,
      },
      LOW: {
        label: "Critical",
        color: "bg-rose-50 text-rose-700 border-rose-100",
        icon: AlertCircle,
      },
      OUT_OF_STOCK: {
        label: "Stock Out",
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: XCircle,
      },
      damaged: {
        label: "Damaged",
        color: "bg-rose-50 text-rose-700 border-rose-100",
        icon: ShieldAlert,
      },
      stolen: {
        label: "Theft",
        color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
        icon: ShieldAlert,
      },
      expired: {
        label: "Expired",
        color: "bg-orange-50 text-orange-700 border-orange-100",
        icon: Clock,
      },
      in: {
        label: "Stock In",
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: ArrowUpRight,
      },
      out: {
        label: "Stock Out",
        color: "bg-rose-50 text-rose-700 border-rose-100",
        icon: ArrowDownRight,
      },
    };
    const {
      label,
      color,
      icon: Icon,
    } = config[status] || {
      label: status,
      color: "bg-gray-50 text-gray-700 border-gray-100",
      icon: Info,
    };
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${color} shadow-sm`}
      >
        <Icon className="w-3 h-3 mr-1.5" />
        {label}
      </motion.span>
    );
  };

  // Enhanced Category badge component
  const CategoryBadge = ({ category }) => {
    const config = {
      food: {
        label: "Food & Consumables",
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        icon: Utensils,
      },
      equipment: {
        label: "Major Equipment",
        color: "bg-blue-50 text-blue-700 border-blue-100",
        icon: Wrench,
      },
      tools: {
        label: "Maintenance Tools",
        color: "bg-amber-50 text-amber-700 border-amber-100",
        icon: Hammer,
      },
    };
    const {
      label,
      color,
      icon: Icon,
    } = config[category] || {
      label: category,
      color: "bg-gray-50 text-gray-700 border-gray-100",
      icon: Package,
    };
    return (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${color}`}
      >
        <Icon className="w-3 h-3 mr-1.5" />
        {label}
      </motion.span>
    );
  };

  // Initialize
  useEffect(() => {
    fetchDashboardReport();
  }, []);
  useEffect(() => {
    fetchStockLevelReport();
  }, []);
  useEffect(() => {
    if (reportType !== "dashboard") loadReport();
  }, [timePeriod, activeFilters, customDateRange, reportType, loadReport]);
  useEffect(() => {
    setShowDetails(null);
  }, [reportType]);

  // Loading component
  const LoadingSpinner = ({ text = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 text-lg">{text}</p>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-red-800">Error Loading Data</h3>
          <p className="text-red-700 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16">
      <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">No data found</p>
      <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
    </div>
  );

  // Render summary cards with animations and mini-charts
  const renderSummaryCards = () => {
    const summary = getSummaryData();
    if (!summary || Object.keys(summary).length === 0) return null;

    const cards = [
      {
        title: "Total Assets",
        value: summary.total_items || 0,
        subtitle: `${summary.total_quantity || 0} units in stock`,
        icon: Package,
        color: "from-emerald-500 to-teal-600",
        bg: "bg-emerald-50",
        textColor: "text-emerald-700",
      },
      {
        title: "Activity Flow",
        value: summary.today_transactions || summary.monthly_transactions || 0,
        subtitle: `${summary.today_stock_in || summary.monthly_stock_in || 0} IN • ${summary.today_stock_out || summary.monthly_stock_out || 0} OUT`,
        icon: Activity,
        color: "from-blue-500 to-indigo-600",
        bg: "bg-blue-50",
        textColor: "text-blue-700",
      },
      {
        title: "Risk Level",
        value: summary.low_stock_items || 0,
        subtitle: `${summary.out_of_stock_items || 0} depleted items`,
        icon: AlertTriangle,
        color: "from-rose-500 to-red-600",
        bg: "bg-rose-50",
        textColor: "text-rose-700",
        isCritical: (summary.low_stock_items || 0) > 0,
      },
      {
        title: "Incident Analysis",
        value: summary.total_losses || 0,
        subtitle: "Total reported losses",
        icon: ShieldAlert,
        color: "from-amber-500 to-orange-600",
        bg: "bg-amber-50",
        textColor: "text-amber-700",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-3xl p-6 ${card.bg} border border-white/50 shadow-xl backdrop-blur-sm group`}
          >
            {/* Decorative background shape */}
            <div
              className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`}
            />

            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg shadow-indigo-100`}
              >
                <card.icon className="w-6 h-6" />
              </div>
              {card.isCritical && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p
                className={`text-sm font-bold uppercase tracking-wider ${card.textColor} opacity-80`}
              >
                {card.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">
                  <CountUp end={card.value} duration={2} />
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render Charts with Recharts
  const renderChartView = () => {
    const data = getFilteredAndSortedData;
    if (!data.length) return <EmptyState />;

    // Prepare data for different report types
    const chartData = data.slice(0, 15).map((item) => ({
      name: (item.item_name || item.name || item.display_name || "").substring(
        0,
        15,
      ),
      quantity: item.current_qty || item.quantity || 0,
      value: item.estimated_value || 0,
    }));

    const COLORS = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Main Bar Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BarChart3 className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
            <div className="w-2 h-8 bg-indigo-600 rounded-full mr-3" />
            Quantities by Item
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="quantity" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Area Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
            <div className="w-2 h-8 bg-emerald-500 rounded-full mr-3" />
            Trend Analysis
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
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
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="quantity"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorQty)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render table view with modern styling
  const renderTableView = () => {
    const data = getPaginatedData;
    if (!data.length) return <EmptyState />;
    const headers = getDisplayableHeaders(data);
    const displayHeaders = headers.map((h) => getHeaderDisplayName(h));

    return (
      <div className="bg-white rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50">
                {displayHeaders.map((header, idx) => (
                  <th
                    key={headers[idx]}
                    onClick={() => handleSort(headers[idx])}
                    className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      {sortConfig.key === headers[idx] && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {sortConfig.direction === "asc" ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                        </motion.span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  {headers.map((header) => (
                    <td key={header} className="px-6 py-4 whitespace-nowrap">
                      {header === "stock_status" ||
                      header === "status" ||
                      header === "loss_type" ||
                      header === "type" ? (
                        <StatusBadge status={item[header]} />
                      ) : header === "category" ? (
                        <CategoryBadge category={item[header]} />
                      ) : (
                        <span className="text-sm font-bold text-slate-700">
                          {String(item[header] || "-").substring(0, 50)}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedRecord(item);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render grid view with premium cards
  const renderGridView = () => {
    const data = getPaginatedData;
    if (!data.length) return <EmptyState />;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            className="group bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package className="w-20 h-20" />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800 leading-tight">
                  {item.item_name || item.name || item.display_name || "Item"}
                </h3>
                <div className="flex items-center gap-2">
                  <CategoryBadge category={item.category} />
                </div>
              </div>
              <StatusBadge
                status={item.stock_status || item.loss_type || item.type}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Quantity
                </p>
                <p className="text-sm font-black text-slate-700">
                  {item.current_qty || item.quantity || 0}{" "}
                  <span className="text-[10px] text-slate-400">
                    {item.unit || ""}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Recorded
                </p>
                <p className="text-[11px] font-bold text-slate-700">
                  {new Date(
                    item.transaction_date || item.loss_date || item.date,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-indigo-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {item.user_name || item.reported_by || "System"}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedRecord(item);
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
              >
                Details
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const isLoading =
    loading[
      reportType === "dashboard"
        ? "dashboard"
        : reportType === "stock-level"
          ? "stockLevel"
          : reportType === "stock-movement"
            ? "stockMovement"
            : reportType === "loss-analysis"
              ? "lossAnalysis"
              : "itemPerformance"
    ];

  const renderPagination = () => {
    if (getFilteredAndSortedData.length === 0 || viewMode === "chart")
      return null;

    return (
      <div className="px-8 py-6 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/20">
        <div className="text-sm font-bold text-slate-400">
          Showing{" "}
          <span className="text-slate-900">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="text-slate-900">
            {Math.min(
              currentPage * itemsPerPage,
              getFilteredAndSortedData.length,
            )}
          </span>{" "}
          of{" "}
          <span className="text-slate-900">
            {getFilteredAndSortedData.length}
          </span>{" "}
          results
        </div>

        <div className="flex items-center gap-4">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={5}>5 / page</option>
            <option value={6}>6 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, getTotalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, getTotalPages))
              }
              disabled={currentPage === getTotalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManagerDashboardWrapper>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key="header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em]">
                    Intelligence Dashboard
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  Stock <span className="text-indigo-600">Analytics</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-2xl">
                  Transforming raw data into actionable inventory insights.
                  Monitor levels, track movements, and optimize your supply
                  chain.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadReport}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-600"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </motion.button>

                <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden lg:block" />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdvancedExport(true)}
                  className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
                >
                  <DownloadCloud className="w-5 h-5" />
                  Export Data
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {error && <ErrorMessage message={error} onRetry={loadReport} />}

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-10">
          {/* Navigation & Filters Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Report Modules
              </h2>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setReportType(type.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      reportType === type.id
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${reportType === type.id ? "bg-white/20" : "bg-white shadow-sm"}`}
                      >
                        <type.icon
                          className={`w-4 h-4 ${reportType === type.id ? "text-white" : "text-indigo-600"}`}
                        />
                      </div>
                      <span className="font-bold text-sm">{type.label}</span>
                    </div>
                    {reportType === type.id && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                Global Filters
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                    Category Range
                  </label>
                  <select
                    value={activeFilters.category}
                    onChange={(e) =>
                      setActiveFilters({
                        ...activeFilters,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    <option value="food">Food & Consumables</option>
                    <option value="equipment">Major Equipment</option>
                    <option value="tools">Maintenance Tools</option>
                  </select>
                </div>

                {reportType === "stock-level" && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                      Stock Health
                    </label>
                    <select
                      value={activeFilters.status}
                      onChange={(e) =>
                        setActiveFilters({
                          ...activeFilters,
                          status: e.target.value,
                        })
                      }
                      className="w-full p-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="OK">Operational</option>
                      <option value="WARNING">Warning</option>
                      <option value="LOW">Critical</option>
                      <option value="OUT_OF_STOCK">Depleted</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                    Search Scope
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Item name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setActiveFilters({
                      category: "",
                      status: "",
                      loss_type: "",
                      item_id: "",
                      type: "",
                    })
                  }
                  className="w-full py-3 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Reset Filters
                </motion.button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Time & View Controls */}
            <div className="bg-white/60 backdrop-blur-xl border border-white p-4 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                {timePeriods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setTimePeriod(period.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      timePeriod === period.id
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-2.5 rounded-xl transition-all ${
                      viewMode === mode.id
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <mode.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Cards */}
            {renderSummaryCards()}

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSpinner
                    text={`Synthesizing ${reportTypes.find((t) => t.id === reportType)?.label} Data...`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={reportType + viewMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {viewMode === "chart" ? (
                    renderChartView()
                  ) : (
                    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-slate-800">
                            {
                              reportTypes.find((t) => t.id === reportType)
                                ?.label
                            }
                          </h2>
                          <p className="text-slate-500 font-medium">
                            Detailed data breakdown and records
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                            {getFilteredAndSortedData.length} Entries
                          </span>
                        </div>
                      </div>
                      <div className="p-2 md:p-8">
                        {viewMode === "table"
                          ? renderTableView()
                          : renderGridView()}
                      </div>
                      {renderPagination()}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modals */}
        <ExportProgressModal
          isOpen={showExportProgress}
          onClose={() => setShowExportProgress(false)}
          progress={exportProgress}
          fileName={currentExportFile}
        />
        <AdvancedExportModal
          isOpen={showAdvancedExport}
          onClose={() => setShowAdvancedExport(false)}
          onExport={handleExport}
          reportType={reportType}
          defaultFilters={activeFilters}
        />
        <RecordDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          record={selectedRecord}
          getHeaderDisplayName={getHeaderDisplayName}
          StatusBadge={StatusBadge}
          CategoryBadge={CategoryBadge}
        />
      </div>
    </ManagerDashboardWrapper>
  );
};

export default StockReports;
