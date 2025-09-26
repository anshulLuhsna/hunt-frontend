// In development, we use Vite's proxy through /api
// In production, Vercel handles the proxy
const API_BASE_URL = import.meta.env.DEV ? '/api' : '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(credentials) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Hunt endpoints
  async getHint() {
    return this.request('/hunt/hint', {
      method: 'GET',
    });
  }

  async submitCode(code) {
    return this.request('/hunt/code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async submitAnswer(answer) {
    return this.request('/hunt/answer', {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  // Leaderboard endpoint
  async getLeaderboard() {
    return this.request('/leaderboard', {
      method: 'GET',
    });
  }
}

export default new ApiService();