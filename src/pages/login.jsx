// src/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  EyeOff,
  User,
  Shield,
  AlertCircle,
  Lock,
  Package,
  CheckCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [remember, setRemember] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpArray, setOtpArray] = useState(["", "", "", "", ""]);
  const [tempUserId, setTempUserId] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetUsername, setResetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpInputRefs = useRef([]);

  const canvasRef = useRef(null);
  const particles = useRef([]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Particle background for right side only
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let mouse = { x: null, y: null };
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = window.innerHeight;

    const createParticles = () => {
      particles.current = [];
      for (let i = 0; i < 50; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2,
          color: `rgba(255, 255, 255, ${Math.random() * 0.08 + 0.02})`,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (mouse.x && mouse.y) {
          const distX = mouse.x - p.x;
          const distY = mouse.y - p.y;
          const dist = Math.sqrt(distX ** 2 + distY ** 2);
          if (dist < 100) {
            p.x -= distX / 50;
            p.y -= distY / 50;
          }
        }

        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = window.innerHeight;
      createParticles();
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Check if already logged in or if session expired
  useEffect(() => {
    // Check for expired session parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "true") {
      setError("Your session has expired. Please log in again.");
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const user = localStorage.getItem("user");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (user && isAuthenticated) {
      const userData = JSON.parse(user);
      if (userData.role === "admin") {
        navigate("/manager/dashboard");
      } else if (userData.role === "store_keeper") {
        navigate("/storekeeper/dashboard");
      }
    }
  }, [navigate]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "https://white-tooth-0336.this-enable.workers.dev/api/users/login",
        { username, password },
        { timeout: 30000 },
      );

      if (res.data.success && res.data.otpRequired) {
        setTempUserId(res.data.userId);
        setShowOTP(true);
        setCountdown(60); // Start 60s countdown
        setSuccess(res.data.message);
      } else if (res.data.success && res.data.user) {
        const { user, token } = res.data;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", user.role);

        setSuccess(`Welcome back, ${user.full_name || user.username}!`);
        localStorage.setItem("isAuthenticated", "true");

        setTimeout(() => {
          if (user.role === "admin") navigate("/manager/dashboard");
          else if (user.role === "store_keeper")
            navigate("/storekeeper/dashboard");
          else navigate("/login");
        }, 800);
      } else {
        throw new Error("Invalid login response");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "ECONNABORTED") {
        setError("Server timeout. Please try again.");
      } else if (err.response?.data) {
        setError(err.response.data.error || err.response.data.message);
      } else {
        setError("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = otpArray.join("");
    if (otp.length !== 5) {
      setError("Please enter the full 5-digit code");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "https://white-tooth-0336.this-enable.workers.dev/api/users/verify-otp",
        { userId: tempUserId, otp },
        { timeout: 30000 },
      );

      if (res.data.success && res.data.user) {
        const { user, token } = res.data;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        localStorage.setItem("token", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", user.role);

        setSuccess(
          `Verification successful! Welcome, ${user.full_name || user.username}!`,
        );
        localStorage.setItem("isAuthenticated", "true");

        setTimeout(() => {
          if (user.role === "admin") navigate("/manager/dashboard");
          else if (user.role === "store_keeper")
            navigate("/storekeeper/dashboard");
          else navigate("/login");
        }, 800);
      } else {
        throw new Error("Invalid verification response");
      }
    } catch (err) {
      console.error("OTP Verification error:", err);
      if (err.response?.data) {
        setError(err.response.data.error || err.response.data.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Steps
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!resetUsername) return setError("Please enter your username");
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        "https://white-tooth-0336.this-enable.workers.dev/api/users/forgot-password",
        { username: resetUsername },
      );
      if (res.data.success) {
        setTempUserId(res.data.userId);
        setForgotStep(2);
        setOtpArray(["", "", "", "", ""]);
        setSuccess(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.error || "User not found");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    const otp = otpArray.join("");
    if (otp.length !== 5) return setError("Enter 5-digit code");
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://white-tooth-0336.this-enable.workers.dev/api/users/forgot-password-verify",
        { userId: tempUserId, otp },
      );
      if (res.data.success) {
        setForgotStep(3);
        setSuccess("Verified! Reset your password now.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 5) return setError("Password too short");
    if (newPassword !== confirmPassword) return setError("Passwords mismatch");
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://white-tooth-0336.this-enable.workers.dev/api/users/reset-password",
        { userId: tempUserId, otp: otpArray.join(""), newPassword },
      );
      if (res.data.success) {
        setSuccess("Success! Redirecting to login...");
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep(1);
          setResetUsername("");
          setNewPassword("");
          setConfirmPassword("");
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value.slice(-1);
    setOtpArray(newOtp);

    // Move to next input if value is entered
    if (value && index < 4) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 5).split("");
    const newOtp = [...otpArray];
    pasteData.forEach((char, i) => {
      if (i < 5 && /^\d$/.test(char)) {
        newOtp[i] = char;
      }
    });
    setOtpArray(newOtp);
    // Focus last filled input or the last one
    const focusIndex = Math.min(pasteData.length, 4);
    otpInputRefs.current[focusIndex].focus();
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel - White Background - 50% */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative items-center justify-center p-16">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-lg w-full text-center">
          {/* Logo */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              StockFlow
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Inventory Management System
            </p>
          </div>

          {/* Key Features - Minimal & Clean */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Real-time Tracking
                </h3>
                <p className="text-sm text-gray-500">
                  Monitor stock levels instantly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Smart Analytics</h3>
                <p className="text-sm text-gray-500">
                  Data-driven insights & reports
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="p-2.5 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Fast & Secure</h3>
                <p className="text-sm text-gray-500">
                  Enterprise-grade protection
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-xs text-gray-500 mt-1">Uptime</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">256-bit</div>
              <div className="text-xs text-gray-500 mt-1">Encryption</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-xs text-gray-500 mt-1">Support</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Developed by{" "}
              <span className="font-bold text-blue-800"><a href="https://linktr.ee/kwandagroup">KWANDA GROUP</a></span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Black Background - 50% */}
      <div className="w-full lg:w-1/2 bg-black relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        ></canvas>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-90"></div>

        {/* Animated glow effects */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">StockFlow</h1>
            <p className="text-gray-400 text-sm mt-1">Inventory Management</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.06] shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-5">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-gray-400 mt-2 text-sm">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300 text-sm">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Form Rendering */}
            {showForgot ? (
              // FORGOT PASSWORD FLOW
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => {
                      setShowForgot(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
                  </button>
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                    Step {forgotStep} of 3
                  </span>
                </div>

                {forgotStep === 1 && (
                  <form onSubmit={handleForgotRequest} className="space-y-5">
                    <p className="text-gray-400 text-sm">
                      Enter your username to receive a reset code.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <User size={20} />
                        </div>
                        <input
                          type="text"
                          value={resetUsername}
                          onChange={(e) => setResetUsername(e.target.value)}
                          placeholder="Your account username"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      {loading ? "Checking..." : "Find My Account"}
                    </button>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleForgotVerify} className="space-y-6">
                    <p className="text-gray-400 text-sm">
                      Check your email for a 5-digit verification code.
                    </p>
                    <div className="flex justify-between gap-3">
                      {otpArray.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                          required
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify Code"}
                    </button>
                  </form>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <p className="text-gray-400 text-sm">
                      Create a new secure password for your account.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <Lock size={20} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <CheckCircle size={20} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
              </div>
            ) : !showOTP ? (
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.03] text-white placeholder-gray-500 border ${
                        error ? "border-red-500/50" : "border-white/[0.08]"
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/[0.03] text-white placeholder-gray-500 border ${
                        error ? "border-red-500/50" : "border-white/[0.08]"
                      } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotStep(1);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl flex justify-center items-center gap-3 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  disabled={loading || !username || !password}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-6 text-center">
                    Enter Verification Code
                  </label>
                  <div className="flex justify-between gap-3 mb-6">
                    {otpArray.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        autoFocus={index === 0}
                        className="w-14 h-16 text-center text-2xl font-bold rounded-xl bg-white/[0.03] text-white border border-white/[0.08] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-4">
                    Please enter the 5-digit code sent to your email
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3.5 rounded-xl flex justify-center items-center gap-3 transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || otpArray.join("").length !== 5}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-4">
                  <div className="text-sm">
                    {countdown > 0 ? (
                      <span className="text-gray-500">
                        Resend code in{" "}
                        <span className="text-blue-400 font-mono">
                          {countdown}s
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLogin}
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOTP(false);
                      setOtpArray(["", "", "", "", ""]);
                      setError("");
                      setSuccess("");
                      setCountdown(0);
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* System Status */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="text-gray-500">v2.1.4</div>
              </div>
              <p className="text-xs text-white text-bold mt-4 text-center">
                © {new Date().getFullYear()} KWANDA GROUP
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Developed by{" "}
              <span className="text-blue-800 font-bold">KWANDA GROUP</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
