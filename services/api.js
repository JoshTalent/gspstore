// src/services/api.js - UPDATED with Reports API

const API_URL = "https://white-tooth-0336.this-enable.workers.dev/api";

// Helper function to get authentication token
const getToken = () => {
  return localStorage.getItem("token");
};

// Helper function to make API requests
const apiRequest = async (endpoint, method = "GET", data = null) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // Add user-id header for endpoints that require it (like delete item)
    const userId = localStorage.getItem("userId");
    if (userId) {
      headers["user-id"] = userId;
    }
  }

  const config = {
    method,
    headers,
  };

  if (data && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  try {
    let url = `${API_URL}${endpoint}`;

    // Handle query parameters for GET requests
    if (method === "GET" && data && Object.keys(data).length > 0) {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    console.log(`🌐 API Request: ${method} ${url}`, data || "");

    const response = await fetch(url, config);

    // Handle 204 No Content responses
    if (response.status === 204) {
      return { success: true, message: "Operation completed successfully" };
    }

    // Handle blob responses for file downloads
    const contentType = response.headers.get("content-type");
    if (
      contentType &&
      (contentType.includes("application/pdf") ||
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ) ||
        contentType.includes("text/csv"))
    ) {
      const blob = await response.blob();
      return { blob, contentType, success: true };
    }

    // Handle non-JSON responses
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error(
        `Server returned ${response.status}: ${response.statusText}`,
      );
    }

    const responseData = await response.json();
    console.log(`📦 API Response: ${method} ${endpoint}`, responseData);

    // Handle session expiration (401 Unauthorized)
    if (response.status === 401 && !endpoint.includes("/login")) {
      console.warn("Session expired or unauthorized. Logging out...");

      // Clear all authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("user_role"); // Some systems use this

      // Redirect to login page with a session expired message
      window.location.href = "/login?expired=true";
      return;
    }

    if (!response.ok) {
      throw new Error(
        responseData.error ||
          responseData.message ||
          `HTTP error! status: ${response.status}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error("❌ API Error:", error);
    throw error;
  }
};

// Items API
export const itemsApi = {
  // Get all items with optional filters
  getAllItems: async (params = {}) => {
    try {
      const queryParams = {};
      if (params.category && params.category !== "all") {
        queryParams.category = params.category;
      }
      if (params.search) {
        queryParams.search = params.search;
      }
      if (params.include_daily_limit_status) {
        queryParams.include_daily_limit_status =
          params.include_daily_limit_status;
      }

      const response = await apiRequest("/items", "GET", queryParams);
      console.log("getAllItems raw response:", response);

      // Handle MongoDB response format { success: true, data: [...], pagination: {...} }
      if (response && response.success === true) {
        // Process items to ensure they have the expected structure
        const items = response.data || [];
        return items.map((item) => ({
          ...item,
          id: item.id || item._id,
          currentQty: item.currentQty || item.current_qty || 0,
          minQty: item.minQty || item.min_qty || 0,
          dailyLimit: item.dailyLimit || item.daily_limit || null,
          daily_limit_status: item.daily_limit_status || null,
        }));
      }

      // Handle array response
      if (Array.isArray(response)) {
        return response;
      }

      // Handle response with data property
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // Handle response with items property
      if (response && response.items && Array.isArray(response.items)) {
        return response.items;
      }

      console.warn("Unexpected response format in getAllItems:", response);
      return [];
    } catch (error) {
      console.error("Error in getAllItems:", error);
      throw error;
    }
  },

  // Get single item by ID
  getItem: async (id) => {
    try {
      const response = await apiRequest(`/items/${id}`, "GET");

      if (response && response.success === true) {
        const item = response.item || response.data || response;
        return {
          ...item,
          id: item.id || item._id,
          currentQty: item.currentQty || item.current_qty || 0,
          minQty: item.minQty || item.min_qty || 0,
          dailyLimit: item.dailyLimit || item.daily_limit || null,
        };
      }

      return response;
    } catch (error) {
      console.error("Error in getItem:", error);
      throw error;
    }
  },

  // Create new item
  createItem: async (itemData) => {
    try {
      const data = {
        name: itemData.name,
        category: itemData.category,
        currentQty: Number(itemData.currentQty) || 0,
        unit: itemData.unit,
        minQty: Number(itemData.minQty) || 0,
        dailyLimit:
          itemData.category === "food"
            ? Number(itemData.dailyLimit) || 0
            : null,
      };

      const response = await apiRequest("/items", "POST", data);
      console.log("createItem response:", response);

      if (response && response.success === true) {
        return response.item || response.data || response;
      }

      return response;
    } catch (error) {
      console.error("Error in createItem:", error);
      throw error;
    }
  },

  // Update existing item
  updateItem: async (id, itemData) => {
    try {
      const data = {
        name: itemData.name,
        category: itemData.category,
        currentQty: Number(itemData.currentQty) || 0,
        unit: itemData.unit,
        minQty: Number(itemData.minQty) || 0,
        dailyLimit:
          itemData.category === "food"
            ? Number(itemData.dailyLimit) || 0
            : null,
      };

      const response = await apiRequest(`/items/${id}`, "PUT", data);

      if (response && response.success === true) {
        return response.item || response.data || response;
      }

      return response;
    } catch (error) {
      console.error("Error in updateItem:", error);
      throw error;
    }
  },

  // Delete item
  deleteItem: async (id, force = false) => {
    try {
      const endpoint = force ? `/items/${id}?force=true` : `/items/${id}`;
      const response = await apiRequest(endpoint, "DELETE");
      return response;
    } catch (error) {
      console.error("Error in deleteItem:", error);
      throw error;
    }
  },

  // Get item statistics
  getItemStats: async () => {
    try {
      const response = await apiRequest("/items/stats", "GET");
      console.log("getItemStats response:", response);

      if (response && response.success === true) {
        return (
          response.stats || {
            foodCount: 0,
            equipmentCount: 0,
            toolsCount: 0,
            limitedItemsCount: 0,
          }
        );
      }

      return response || {};
    } catch (error) {
      console.error("Error in getItemStats:", error);
      return {
        foodCount: 0,
        equipmentCount: 0,
        toolsCount: 0,
        limitedItemsCount: 0,
      };
    }
  },
};

// Stock API
export const stockApi = {
  // Stock in (add stock)
  stockIn: async (item_id, quantity, notes = "", userId = null) => {
    try {
      // Get userId from localStorage if not provided
      const currentUserId = userId || localStorage.getItem("userId");
      const requestBody = {
        item_id: item_id,
        quantity: Number(quantity),
        notes,
      };

      // Add user_id if provided (using underscore as backend expects)
      if (currentUserId) {
        requestBody.user_id = currentUserId;
      }

      const response = await apiRequest("/stock/in", "POST", requestBody);
      return response;
    } catch (error) {
      console.error("Error in stockIn:", error);
      throw error;
    }
  },

  // Stock out (remove stock) - UPDATED with confirm_limit_exceeded
  stockOut: async (
    item_id,
    quantity,
    reason,
    notes = "",
    userId = null,
    confirmLimitExceeded = false,
  ) => {
    try {
      // Get userId from localStorage if not provided
      const currentUserId = userId || localStorage.getItem("userId");

      const requestBody = {
        item_id: item_id,
        quantity: Number(quantity),
        reason,
        notes,
      };

      // Add user_id if provided (using underscore as backend expects)
      if (currentUserId) {
        requestBody.user_id = currentUserId;
      }

      // Add confirm_limit_exceeded flag if true
      if (confirmLimitExceeded) {
        requestBody.confirm_limit_exceeded = true;
      }

      console.log("Stock out request body:", requestBody);

      const response = await apiRequest("/stock/out", "POST", requestBody);
      return response;
    } catch (error) {
      console.error("Error in stockOut:", error);
      throw error;
    }
  },

  // Check daily limit before stock out - NEW FUNCTION
  checkDailyLimit: async (itemId, quantity) => {
    try {
      console.log("Checking daily limit:", { itemId, quantity });
      const response = await apiRequest(
        `/stock/check-limit/${itemId}?quantity=${quantity}`,
        "GET",
      );
      return response;
    } catch (error) {
      console.error("Error checking daily limit:", error);
      // Return a default response if endpoint is not available
      return {
        success: true,
        within_limit: true,
        daily_limit: null,
        message: "Daily limit check unavailable",
        current_usage: {
          used_today: 0,
          requested: quantity,
          total_after_transaction: quantity,
          remaining: null,
        },
      };
    }
  },

  // Get stock transactions
  getTransactions: async (params = {}) => {
    try {
      const queryParams = {};
      if (params.item_id) queryParams.item_id = params.item_id;
      if (params.type) queryParams.type = params.type;
      if (params.start_date) queryParams.start_date = params.start_date;
      if (params.end_date) queryParams.end_date = params.end_date;
      if (params.limit) queryParams.limit = params.limit;
      if (params.page) queryParams.page = params.page;
      if (params.include_limit_exceeded)
        queryParams.include_limit_exceeded = params.include_limit_exceeded;

      const response = await apiRequest(
        "/stock/transactions",
        "GET",
        queryParams,
      );

      if (response && response.success === true) {
        return response.data || [];
      }

      return response || [];
    } catch (error) {
      console.error("Error in getTransactions:", error);
      throw error;
    }
  },

  // Get stock summary
  getStockSummary: async () => {
    try {
      const response = await apiRequest("/stock/summary", "GET");

      if (response && response.success === true) {
        return response.summary || response.data || response;
      }

      return response || {};
    } catch (error) {
      console.error("Error in getStockSummary:", error);
      return {};
    }
  },

  // Get daily usage
  getDailyUsage: async (date = null) => {
    try {
      const queryParams = date ? { date } : {};
      const response = await apiRequest(
        "/stock/daily-usage",
        "GET",
        queryParams,
      );
      return response;
    } catch (error) {
      console.error("Error in getDailyUsage:", error);
      throw error;
    }
  },

  // Request quantity change (for daily limits)
  requestQuantityChange: async (item_id, new_quantity, reason) => {
    try {
      const response = await apiRequest("/stock/change-request", "POST", {
        item_id: item_id,
        new_quantity: Number(new_quantity),
        reason,
      });
      return response;
    } catch (error) {
      console.error("Error in requestQuantityChange:", error);
      throw error;
    }
  },

  // Get change requests (manager only)
  getChangeRequests: async (status = null) => {
    try {
      const queryParams = status ? { status } : {};
      const response = await apiRequest(
        "/stock/change-requests",
        "GET",
        queryParams,
      );

      if (response && response.success === true) {
        return response.data || [];
      }

      return response || [];
    } catch (error) {
      console.error("Error in getChangeRequests:", error);
      throw error;
    }
  },

  // Review change request (manager only)
  reviewChangeRequest: async (requestId, status) => {
    try {
      const response = await apiRequest(
        `/stock/change-request/${requestId}/review`,
        "PUT",
        { status },
      );
      return response;
    } catch (error) {
      console.error("Error in reviewChangeRequest:", error);
      throw error;
    }
  },
};

// Users API - UPDATED with all missing methods
export const usersApi = {
  // Login
  login: async (username, password) => {
    try {
      const response = await apiRequest("/users/login", "POST", {
        username,
        password,
      });
      return response;
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async (userId = null) => {
    try {
      // If userId is provided, add as query param
      const params = userId ? { userId } : {};
      const response = await apiRequest("/users/profile", "GET", params);

      if (response && response.success === true) {
        return response.user || response;
      }

      return response;
    } catch (error) {
      console.error("Error in getProfile:", error);
      throw error;
    }
  },

  // Update user profile - FIXED endpoint
  updateProfile: async (userData) => {
    try {
      // Using the correct endpoint '/users/profile' (not '/users/update-profile')
      const response = await apiRequest("/users/profile", "PUT", {
        userId: userData.userId,
        username: userData.username,
        full_name: userData.full_name,
        email: userData.email,
        currentPassword: userData.currentPassword,
      });
      return response;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (
    userId,
    currentPassword,
    newPassword,
    confirmPassword,
  ) => {
    try {
      const response = await apiRequest("/users/password", "PUT", {
        userId,
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return response;
    } catch (error) {
      console.error("Error in updatePassword:", error);
      throw error;
    }
  },

  // Get all users (manager only)
  getAllUsers: async () => {
    try {
      const response = await apiRequest("/users", "GET");

      if (response && response.success === true) {
        return response.users || response.data || [];
      }

      return response || [];
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw error;
    }
  },

  // Create new user (manager only)
  createUser: async (userData) => {
    try {
      const response = await apiRequest("/users", "POST", userData);
      return response;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  },

  // Deactivate user
  deactivateUser: async (userId, adminId) => {
    try {
      const response = await apiRequest("/users/deactivate", "PUT", {
        userId,
        adminId,
      });
      return response;
    } catch (error) {
      console.error("Error in deactivateUser:", error);
      throw error;
    }
  },

  // Activate user
  activateUser: async (userId, adminId) => {
    try {
      const response = await apiRequest("/users/activate", "PUT", {
        userId,
        adminId,
      });
      return response;
    } catch (error) {
      console.error("Error in activateUser:", error);
      throw error;
    }
  },

  // Get users by role
  getUsersByRole: async (role) => {
    try {
      const response = await apiRequest(`/users/role/${role}`, "GET");

      if (response && response.success === true) {
        return response.users || [];
      }

      return response || [];
    } catch (error) {
      console.error("Error in getUsersByRole:", error);
      throw error;
    }
  },

  // Search users
  searchUsers: async (searchTerm) => {
    try {
      const response = await apiRequest(
        `/users/search?q=${encodeURIComponent(searchTerm)}`,
        "GET",
      );

      if (response && response.success === true) {
        return response.users || [];
      }

      return response || [];
    } catch (error) {
      console.error("Error in searchUsers:", error);
      throw error;
    }
  },

  // Check database status - NEW FUNCTION for Profile component
  checkDatabaseStatus: async () => {
    try {
      const response = await apiRequest("/users/db-status", "GET");
      return response;
    } catch (error) {
      console.error("Error checking database status:", error);
      // Return a fallback response instead of throwing
      return {
        success: false,
        status: "unknown",
        message: "Database status check failed",
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get current user (alias for getProfile)
  getCurrentUser: async (userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await apiRequest("/users/current", "GET", params);

      if (response && response.success === true) {
        return response.user || response;
      }

      return response;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await apiRequest("/users/stats", "GET");

      if (response && response.success === true) {
        return response.stats || response;
      }

      return response || {};
    } catch (error) {
      console.error("Error in getUserStats:", error);
      return {};
    }
  },

  // Check if username exists
  checkUsername: async (username, excludeUserId = null) => {
    try {
      let url = `/users/check-username/${encodeURIComponent(username)}`;
      if (excludeUserId) {
        url += `?excludeUserId=${excludeUserId}`;
      }
      const response = await apiRequest(url, "GET");
      return response;
    } catch (error) {
      console.error("Error in checkUsername:", error);
      throw error;
    }
  },

  // Check if email exists
  checkEmail: async (email, excludeUserId = null) => {
    try {
      let url = `/users/check-email/${encodeURIComponent(email)}`;
      if (excludeUserId) {
        url += `?excludeUserId=${excludeUserId}`;
      }
      const response = await apiRequest(url, "GET");
      return response;
    } catch (error) {
      console.error("Error in checkEmail:", error);
      throw error;
    }
  },
};

// Losses API - UPDATED to use user_id
export const lossesApi = {
  // Report loss - UPDATED to use user_id
  reportLoss: async (
    item_id,
    quantity,
    loss_type,
    description = "",
    userId = null,
    date = null,
  ) => {
    try {
      // Get userId from localStorage if not provided
      const currentUserId = userId || localStorage.getItem("userId");

      const requestBody = {
        item_id: item_id,
        quantity: Number(quantity),
        loss_type,
        description,
      };

      // Add user_id if provided (using underscore as backend expects)
      if (currentUserId) {
        requestBody.user_id = currentUserId;
      }

      // Add date if provided
      if (date) {
        requestBody.date = date;
      }

      console.log("Report loss request body:", requestBody);

      const response = await apiRequest("/losses", "POST", requestBody);
      return response;
    } catch (error) {
      console.error("Error in reportLoss:", error);
      throw error;
    }
  },

  // Get all losses
  getLosses: async (params = {}) => {
    try {
      const queryParams = {};
      if (params.start_date) queryParams.start_date = params.start_date;
      if (params.end_date) queryParams.end_date = params.end_date;
      if (params.loss_type) queryParams.loss_type = params.loss_type;
      if (params.limit) queryParams.limit = params.limit;
      if (params.page) queryParams.page = params.page;

      const response = await apiRequest("/losses", "GET", queryParams);

      if (response && response.success === true) {
        return response.data || [];
      }

      return response || [];
    } catch (error) {
      console.error("Error in getLosses:", error);
      throw error;
    }
  },

  // Get loss statistics
  getLossStats: async () => {
    try {
      const response = await apiRequest("/losses/stats", "GET");

      if (response && response.success === true) {
        return response.stats || response;
      }

      return response || {};
    } catch (error) {
      console.error("Error in getLossStats:", error);
      return {};
    }
  },
};

// ============================================
// REPORTS API - NEW SECTION FOR REPORTS
// ============================================
export const reportsApi = {
  // Get dashboard report
  getDashboardReport: async () => {
    try {
      const response = await apiRequest("/reports/dashboard", "GET");
      return response;
    } catch (error) {
      console.error("Error fetching dashboard report:", error);
      throw error;
    }
  },

  // Get stock level report
  getStockLevelReport: async (filters = {}) => {
    try {
      const queryParams = {};
      if (filters.category) queryParams.category = filters.category;
      if (filters.status) queryParams.status = filters.status;
      if (filters.min_qty) queryParams.min_qty = filters.min_qty;
      if (filters.max_qty) queryParams.max_qty = filters.max_qty;
      if (filters.item_id) queryParams.item_id = filters.item_id;
      if (filters.limit) queryParams.limit = filters.limit;

      const response = await apiRequest(
        "/reports/stock-level",
        "GET",
        queryParams,
      );
      return response;
    } catch (error) {
      console.error("Error fetching stock level report:", error);
      throw error;
    }
  },

  // Get stock movement report
  getStockMovementReport: async (filters = {}) => {
    try {
      const queryParams = {};
      if (filters.item_id) queryParams.item_id = filters.item_id;
      if (filters.category) queryParams.category = filters.category;
      if (filters.type) queryParams.type = filters.type;
      if (filters.start_date) queryParams.start_date = filters.start_date;
      if (filters.end_date) queryParams.end_date = filters.end_date;
      if (filters.user_id) queryParams.user_id = filters.user_id;
      if (filters.limit) queryParams.limit = filters.limit;

      const response = await apiRequest(
        "/reports/stock-movement",
        "GET",
        queryParams,
      );
      return response;
    } catch (error) {
      console.error("Error fetching stock movement report:", error);
      throw error;
    }
  },

  // Get loss analysis report
  getLossAnalysisReport: async (filters = {}) => {
    try {
      const queryParams = {};
      if (filters.item_id) queryParams.item_id = filters.item_id;
      if (filters.category) queryParams.category = filters.category;
      if (filters.loss_type) queryParams.loss_type = filters.loss_type;
      if (filters.start_date) queryParams.start_date = filters.start_date;
      if (filters.end_date) queryParams.end_date = filters.end_date;
      if (filters.status) queryParams.status = filters.status;
      if (filters.limit) queryParams.limit = filters.limit;

      const response = await apiRequest(
        "/reports/loss-analysis",
        "GET",
        queryParams,
      );
      return response;
    } catch (error) {
      console.error("Error fetching loss analysis report:", error);
      throw error;
    }
  },

  // Get item performance report
  getItemPerformanceReport: async (filters = {}) => {
    try {
      const queryParams = {};
      if (filters.category) queryParams.category = filters.category;
      if (filters.item_id) queryParams.item_id = filters.item_id;
      if (filters.period) queryParams.period = filters.period;
      if (filters.limit) queryParams.limit = filters.limit;

      const response = await apiRequest(
        "/reports/item-performance",
        "GET",
        queryParams,
      );
      return response;
    } catch (error) {
      console.error("Error fetching item performance report:", error);
      throw error;
    }
  },

  // Export report (CSV, Excel, PDF, JSON)
  exportReport: async (reportType, format, filters = {}) => {
    try {
      const queryParams = {
        report_type: reportType,
        format: format,
        ...filters,
      };

      const response = await apiRequest("/reports/export", "GET", queryParams);

      // If response contains blob (for file downloads)
      if (response.blob) {
        return response;
      }

      return response;
    } catch (error) {
      console.error("Error exporting report:", error);
      throw error;
    }
  },

  // Get export options
  getExportOptions: async () => {
    try {
      const response = await apiRequest("/reports/export-options", "GET");
      return response;
    } catch (error) {
      console.error("Error fetching export options:", error);
      throw error;
    }
  },

  // Test reports connection
  testReports: async () => {
    try {
      const response = await apiRequest("/reports/test", "GET");
      return response;
    } catch (error) {
      console.error("Error testing reports:", error);
      throw error;
    }
  },

  // Health check for reports
  reportsHealthCheck: async () => {
    try {
      const response = await apiRequest("/reports/health", "GET");
      return response;
    } catch (error) {
      console.error("Reports health check error:", error);
      return { success: false, status: "unhealthy" };
    }
  },
};

// Health check
export const healthApi = {
  check: async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.json();
    } catch (error) {
      console.error("Health check error:", error);
      return { status: "error" };
    }
  },
};

// Test API connection
export const testApi = {
  // Test if backend is reachable
  ping: async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  // Test authentication
  testAuth: async () => {
    try {
      const response = await apiRequest("/users/profile", "GET");
      return response;
    } catch (error) {
      console.error("Auth test error:", error);
      throw error;
    }
  },
};

// Utility functions
export const apiUtils = {
  // Handle file uploads (if needed)
  uploadFile: async (endpoint, file, formData = {}) => {
    const token = getToken();
    const data = new FormData();

    data.append("file", file);

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: data,
      });

      return response.json();
    } catch (error) {
      throw error;
    }
  },

  // Export data to CSV/Excel
  exportData: async (endpoint, format = "csv") => {
    const token = getToken();

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}?format=${format}`, {
        headers,
      });

      if (response.ok) {
        return response.blob();
      }
      throw new Error("Export failed");
    } catch (error) {
      throw error;
    }
  },
};

// Default export with all APIs
export default {
  items: itemsApi,
  stock: stockApi,
  users: usersApi,
  losses: lossesApi,
  reports: reportsApi,
  health: healthApi,
  test: testApi,
  utils: apiUtils,
};
