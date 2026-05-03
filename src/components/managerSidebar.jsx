import React, { useState, useEffect } from "react";
import { 
  Home, 
  User, 
  LogOut, 
  Flag, 
  Menu, 
  Activity, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Bell,
  Search,
  LayoutDashboard,
  Box,
  BarChart3,
  Sparkles,
  Command
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const menus = [
  { 
    name: "Dashboard", 
    icon: <LayoutDashboard size={20} />, 
    path: "/manager/dashboard",
    description: "System overview"
  },
  {
    name: "Items",
    icon: <Box size={20} />,
    path: "/manager/item-list",
    description: "Inventory management"
  },
  { 
    name: "Reports", 
    icon: <BarChart3 size={20} />, 
    path: "/manager/stock-reports",
    description: "Data & analytics"
  },
  { 
    name: "Profile", 
    icon: <User size={20} />, 
    path: "/manager/profile",
    description: "Account settings"
  },
];

const ManagerSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const sidebarWidth = isCollapsed ? "w-24" : "w-72";

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <div className="fixed top-6 left-6 z-[60]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xl text-indigo-600 focus:outline-none"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      )}

      {/* Main Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? (showMobileMenu ? "85%" : "0%") : (isCollapsed ? 96 : 300),
          x: isMobile && !showMobileMenu ? -300 : 0
        }}
        className={`
          fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-100 z-50 flex flex-col
          shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] overflow-hidden
        `}
      >
        {/* Logo Section */}
        <div className="p-8 mb-4">
          <div className="flex items-center gap-4">
            <div className="min-w-[48px] h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 relative overflow-hidden group">
              <Sparkles className="text-white w-6 h-6 z-10" />
              <motion.div 
                className="absolute inset-0 bg-indigo-500"
                initial={false}
                whileHover={{ scale: 1.5, rotate: 15 }}
              />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-lg font-black text-slate-800 tracking-tight leading-none">GSP</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Stock Management System</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <div className="mb-4">
            {!isCollapsed && (
              <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Main Navigation</span>
            )}
          </div>
          
          {menus.map((menu) => (
            <Link
              key={menu.name}
              to={menu.path}
              className="relative block"
              onClick={() => isMobile && setShowMobileMenu(false)}
            >
              <motion.div
                className={`
                  flex items-center gap-4 p-4 rounded-2xl transition-all relative z-10
                  ${isActive(menu.path) ? "text-white" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"}
                `}
              >
                <div className={`
                  flex items-center justify-center min-w-[24px]
                  ${isActive(menu.path) ? "text-white" : "text-inherit"}
                `}>
                  {menu.icon}
                </div>
                
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tight">{menu.name}</span>
                    <span className={`text-[10px] font-bold opacity-60 ${isActive(menu.path) ? "text-indigo-100" : "text-slate-400"}`}>
                      {menu.description}
                    </span>
                  </div>
                )}

                {isActive(menu.path) && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10 shadow-lg shadow-indigo-100"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Footer Section - Profile & Logout */}
        <div className="p-4 mt-auto space-y-2">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl transition-all
                text-slate-500 hover:bg-rose-50 hover:text-rose-600 group
              `}
            >
              <div className="min-w-[24px] flex items-center justify-center">
                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black tracking-tight">Logout</span>
                  <span className="text-[10px] font-bold text-slate-400 opacity-60">End current session</span>
                </div>
              )}
            </button>

            {/* Collapse Toggle (Desktop Only) */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full mt-4 flex items-center justify-center p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-50"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}
        </div>

      </motion.aside>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ManagerSidebar;
