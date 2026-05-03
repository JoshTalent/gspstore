// src/components/storekeeperDashboardlayout.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./storekeeperSidebar";
import { motion, AnimatePresence } from "framer-motion";

const DashboardWrapper = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync with sidebar width (300px expanded, 96px collapsed)
  const sidebarWidth = isMobile ? 0 : (isCollapsed ? 96 : 300);

  return (
    <div className="flex min-h-screen bg-slate-50 relative font-sans text-slate-900">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main Content Area */}
      <motion.main
        initial={false}
        animate={{ 
          marginLeft: isMobile ? 0 : sidebarWidth,
          width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-screen relative z-10"
      >
        <div className="relative">
          {/* Subtle background glow for advanced look */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] -z-10 pointer-events-none" />
          
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardWrapper;
