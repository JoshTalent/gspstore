// src/config/api.js
export const API_CONFIG = {
  baseUrl:
    process.env.REACT_APP_API_URL ||
    "https://white-tooth-0336.this-enable.workers.dev:3000/api",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export const ENDPOINTS = {
  // Items endpoints
  ITEMS: {
    BASE: "/items",
    STATS: "/items/stats",
    BY_ID: "/items/:id",
  },

  // Stock endpoints
  STOCK: {
    TRANSACTIONS: "/stock/transactions",
    IN: "/stock/in",
    OUT: "/stock/out",
    DAILY_USAGE: "/stock/daily-usage",
    CHANGE_REQUEST: "/stock/change-request",
    CHANGE_REQUESTS: "/stock/change-requests",
    REVIEW_CHANGE: "/stock/change-request/:id/review",
  },

  // Users endpoints
  USERS: {
    LOGIN: "/users/login",
    PROFILE: "/users/profile",
    BASE: "/users",
  },

  // Losses endpoints
  LOSSES: {
    BASE: "/losses",
    STATS: "/losses/stats",
  },

  // Audit endpoints
  AUDIT: {
    BASE: "/audit",
  },

  // System endpoints
  SYSTEM: {
    HEALTH: "/health",
  },
};
