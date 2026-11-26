const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('chargenear_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('chargenear_token', token);
    } else {
      localStorage.removeItem('chargenear_token');
    }
  }

  getUser() {
    try {
      const userStr = localStorage.getItem('chargenear_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }

  setUser(user) {
    if (user) {
      localStorage.setItem('chargenear_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chargenear_user');
    }
  }

  clearAuth() {
    localStorage.removeItem('chargenear_token');
    localStorage.removeItem('chargenear_user');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  demoLogin(role = 'RIDER') {
    return this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Chargers
  getChargers(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return this.request(`/chargers?${query.toString()}`);
  }

  getRecommendations(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return this.request(`/chargers/recommendations?${query.toString()}`);
  }

  getPlatformStats() {
    return this.request('/chargers/public/stats');
  }

  getChargerById(id) {
    return this.request(`/chargers/${id}`);
  }

  createCharger(chargerData) {
    return this.request('/chargers', {
      method: 'POST',
      body: JSON.stringify(chargerData)
    });
  }

  updateCharger(id, chargerData) {
    return this.request(`/chargers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chargerData)
    });
  }

  deleteCharger(id) {
    return this.request(`/chargers/${id}`, {
      method: 'DELETE'
    });
  }

  getMyListings() {
    return this.request('/chargers/host/my-listings');
  }

  // Bookings
  estimateCost(data) {
    return this.request('/bookings/estimate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  checkAvailability(data) {
    return this.request('/bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  payBooking(id, paymentData = {}) {
    return this.request(`/bookings/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  getMyBookings(status) {
    const q = status ? `?status=${status}` : '';
    return this.request(`/bookings/my-bookings${q}`);
  }

  getHostBookings(status) {
    const q = status ? `?status=${status}` : '';
    return this.request(`/bookings/host-bookings${q}`);
  }

  updateBookingStatus(id, status, cancellationReason) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancellationReason })
    });
  }

  // Reviews
  createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  replyReview(id, hostReply) {
    return this.request(`/reviews/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ hostReply })
    });
  }

  getReviews() {
    return this.request('/reviews');
  }

  deleteReview(id) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE'
    });
  }

  // Notifications
  getNotifications() {
    return this.request('/notifications');
  }

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH'
    });
  }

  // Host Analytics
  getHostAnalytics() {
    return this.request('/host/analytics');
  }

  // Admin
  getAdminMetrics() {
    return this.request('/admin/metrics');
  }

  getAdminQueue(status) {
    const q = status ? `?status=${status}` : '';
    return this.request(`/admin/chargers/queue${q}`);
  }

  verifyCharger(id, status, verificationNotes) {
    return this.request(`/admin/chargers/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, verificationNotes })
    });
  }

  getAdminUsers(role) {
    const q = role ? `?role=${role}` : '';
    return this.request(`/admin/users${q}`);
  }

  getAdminBookings() {
    return this.request('/admin/bookings');
  }

  getAdminComplaints() {
    return this.request('/admin/complaints');
  }

  updateComplaint(id, data) {
    return this.request(`/admin/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiClient();
export default api;

