import api from '@/utils/api'

export const adminService = {
  /**
   * Fetch admin analytics data
   * @returns {Promise<Object>} Analytics data object
   */
  getDashboardAnalytics: async () => {
    const response = await api.get('/admin/analytics')
    return response.data || {}
  },

  /**
   * Fetch all users
   * @returns {Promise<Array>} Array of user objects
   */
  getAllUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data?.users || []
  },

  /**
   * Fetch all custom requests
   * @returns {Promise<Array>} Array of custom requests
   */
  getCustomRequests: async () => {
    const response = await api.get('/custom-requests/admin')
    return response.data?.requests || []
  }
}
