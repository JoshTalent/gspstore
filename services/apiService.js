// src/services/apiService.js
import { API_CONFIG } from '../config/api';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      signal: controller.signal,
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.handleError(response);
        throw error;
      }

      return this.handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic for network errors
      if (this.shouldRetry(error) && retryCount < API_CONFIG.retryAttempts) {
        await this.delay(API_CONFIG.retryDelay);
        return this.request(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }

  async handleError(response) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Not JSON response
    }
    
    return new Error(errorMessage);
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return error.name === 'AbortError' || 
           error.message.includes('Network') || 
           error.message.includes('Failed to fetch');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Items API methods
  async getItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/items${queryString ? `?${queryString}` : ''}`);
  }

  async createItem(itemData) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id, itemData) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Stock API methods
  async stockIn(itemId, quantity, notes = '') {
    return this.request('/stock/in', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, quantity, notes }),
    });
  }

  async stockOut(itemId, quantity, reason, notes = '') {
    return this.request('/stock/out', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, quantity, reason, notes }),
    });
  }

  // User API methods
  async login(username, password) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;