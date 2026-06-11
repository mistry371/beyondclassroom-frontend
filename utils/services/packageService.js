import api from '@/utils/api'

export const packageService = {
  /**
   * Fetch all active packages
   * @returns {Promise<Array>} Array of package objects
   */
  getAllPackages: async () => {
    const response = await api.get('/packages')
    return response.data?.packages || []
  },

  /**
   * Fetch a single package by ID
   * @param {string} id 
   * @returns {Promise<Object>} Package object
   */
  getPackageById: async (id) => {
    const response = await api.get(`/packages/${id}`)
    return response.data?.package || null
  }
}
