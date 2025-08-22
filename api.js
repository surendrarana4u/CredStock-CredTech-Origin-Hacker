// API Service for CredStock
const API_URL = 'http://localhost:5000/api';

// Authentication API calls
const AuthAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('credstock_token', data.token);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('credstock_token', data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Get current user data
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('credstock_token');
      
      if (!token) {
        return null;
      }
      
      const response = await fetch(`${API_URL}/auth/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get user error:', error);
      localStorage.removeItem('credstock_token');
      return null;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('credstock_token');
  }
};

// Portfolio API calls
const PortfolioAPI = {
  // Get user's portfolio
  getPortfolio: async () => {
    try {
      const token = localStorage.getItem('credstock_token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/portfolio`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get portfolio');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get portfolio error:', error);
      throw error;
    }
  },
  
  // Add stock to portfolio
  addStock: async (stockData) => {
    try {
      const token = localStorage.getItem('credstock_token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/portfolio/stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stockData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add stock');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add stock error:', error);
      throw error;
    }
  },
  
  // Update stock in portfolio
  updateStock: async (symbol, stockData) => {
    try {
      const token = localStorage.getItem('credstock_token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/portfolio/stock/${symbol}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stockData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update stock error:', error);
      throw error;
    }
  },
  
  // Remove stock from portfolio
  removeStock: async (symbol) => {
    try {
      const token = localStorage.getItem('credstock_token');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/portfolio/stock/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove stock');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Remove stock error:', error);
      throw error;
    }
  }
};

// Stock API calls
const StockAPI = {
  // Get all stocks
  getAllStocks: async () => {
    try {
      const response = await fetch(`${API_URL}/stocks`);
      
      if (!response.ok) {
        throw new Error('Failed to get stocks');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get stocks error:', error);
      throw error;
    }
  },
  
  // Get stock by symbol
  getStock: async (symbol) => {
    try {
      const response = await fetch(`${API_URL}/stocks/${symbol}`);
      
      if (!response.ok) {
        throw new Error('Failed to get stock');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get stock error:', error);
      throw error;
    }
  },
  
  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await fetch(`${API_URL}/stocks/search/${query}`);
      
      if (!response.ok) {
        throw new Error('Failed to search stocks');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search stocks error:', error);
      throw error;
    }
  }
};

// Export API services
window.CredStockAPI = {
  Auth: AuthAPI,
  Portfolio: PortfolioAPI,
  Stock: StockAPI
};