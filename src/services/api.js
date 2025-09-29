// Use the backend URL directly
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

    // Debug: Log the request config
    console.log('[API] Request config:', {
      url,
      method: config.method,
      body: config.body,
      headers: config.headers
    });

    // Add authorization header if token exists and not already set
    if (!config.headers.Authorization) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

  async getQuestion() {
    return this.request('/hunt/question', {
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

  // Progress endpoint
  async getProgress() {
    return this.request('/hunt/progress', {
      method: 'GET',
    });
  }

  // Main hunt status endpoint
  async getMainHuntStatus() {
    return this.request('/hunt/status', {
      method: 'GET',
    });
  }

  // Admin timing management endpoints
  async getAdminTimings() {
    return this.request('/admin/timings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async updateAdminTiming(eventName, startTime) {
    return this.request('/admin/timings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({ eventName, startTime }),
    });
  }

  async getAdminTimingStatus() {
    return this.request('/admin/timings/status', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  // Team endpoints
  async updateAvatar(avatarSeed) {
    return this.request('/team/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatarSeed }),
    });
  }

  // Leaderboard endpoint
  async getLeaderboard() {
    return this.request('/leaderboard', {
      method: 'GET',
    });
  }

  async getTeamProgress(teamId) {
    return this.request(`/leaderboard/team/${teamId}`, {
      method: 'GET',
    });
  }

  // Admin endpoints
  async adminLogin(password) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getAdminQuestions() {
    return this.request('/admin/questions', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async addAdminQuestion(question) {
    return this.request('/admin/questions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(question),
    });
  }

  async updateAdminQuestion(id, question) {
    return this.request(`/admin/questions/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(question),
    });
  }

  async deleteAdminQuestion(id) {
    return this.request(`/admin/questions/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async getAdminTeams() {
    return this.request('/admin/teams', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async deleteAdminTeam(id) {
    return this.request(`/admin/teams/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async resetAdminTeamProgress(id) {
    return this.request(`/admin/teams/${id}/reset`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  // Sequence Management endpoints
  async getTeamSequences() {
    return this.request('/admin/sequences', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async regenerateAllSequences() {
    return this.request('/admin/sequences/regenerate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  // Locations Management endpoints
  async getAdminLocations() {
    return this.request('/admin/locations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async addAdminLocation(location) {
    return this.request('/admin/locations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(location),
    });
  }

  async updateAdminLocation(id, location) {
    return this.request(`/admin/locations/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(location),
    });
  }

  async deleteAdminLocation(id) {
    return this.request(`/admin/locations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  // Bonus Round endpoints
  async getBonusStatus(roundId) {
    return this.request(`/bonus/${roundId}/status`, {
      method: 'GET',
    });
  }

  async submitBonusLocationCode(roundId, code) {
    return this.request(`/bonus/${roundId}/scan`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async submitBonusAnswer(roundId, answer) {
    return this.request(`/bonus/${roundId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  async submitBonusWinner(roundId, leaderName, teamName) {
    return this.request(`/bonus/${roundId}/winner`, {
      method: 'POST',
      body: JSON.stringify({ leaderName, teamName }),
    });
  }

  async getBonusLeaderboard(roundId) {
    return this.request(`/bonus/${roundId}/leaderboard`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }

  async endBonusRound(roundId) {
    return this.request(`/bonus/${roundId}/end`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  }
}

export default new ApiService();