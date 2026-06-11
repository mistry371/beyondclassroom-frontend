import api from '@/utils/api'

export const courseService = {
  /**
   * Fetch all active courses
   * @returns {Promise<Array>} Array of course objects
   */
  getAllCourses: async () => {
    const response = await api.get('/courses')
    return response.data?.courses || []
  },

  /**
   * Fetch a single course by ID
   * @param {string} id 
   * @returns {Promise<Object>} Course object
   */
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`)
    return response.data?.course || null
  },

  /**
   * Get modules for a course
   * @param {string} courseId 
   * @returns {Promise<Array>} Array of modules
   */
  getCourseModules: async (courseId) => {
    const response = await api.get(`/modules/course/${courseId}`)
    return response.data?.modules || []
  }
}
