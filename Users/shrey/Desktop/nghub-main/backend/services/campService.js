const Camp = require('../models/Camp');

class CampService {
  // Get all camps
  static async getAllCamps() {
    try {
      const camps = await Camp.findAll();
      return { camps };
    } catch (error) {
      console.error('Error getting all camps:', error);
      throw error;
    }
  }

  // Get camp by ID
  static async getCampById(id) {
    try {
      const camp = await Camp.findById(id);
      if (!camp) {
        throw new Error('Camp not found');
      }
      return { camp };
    } catch (error) {
      console.error('Error getting camp by ID:', error);
      throw error;
    }
  }

  // Get camps by employee ID
  static async getCampsByEmployeeId(employeeId) {
    try {
      const camps = await Camp.findByEmployeeId(employeeId);
      return { camps };
    } catch (error) {
      console.error('Error getting camps by employee ID:', error);
      throw error;
    }
  }

  // Create camp
  static async createCamp(campData) {
    try {
      const camp = await Camp.create(campData);
      return { camp };
    } catch (error) {
      console.error('Error creating camp:', error);
      throw error;
    }
  }

  // Update camp
  static async updateCamp(id, campData) {
    try {
      const camp = await Camp.update(id, campData);
      if (!camp) {
        throw new Error('Camp not found');
      }
      return { camp };
    } catch (error) {
      console.error('Error updating camp:', error);
      throw error;
    }
  }

  // Delete camp
  static async deleteCamp(id) {
    try {
      const camp = await Camp.delete(id);
      if (!camp) {
        throw new Error('Camp not found');
      }
      return { message: 'Camp deleted successfully' };
    } catch (error) {
      console.error('Error deleting camp:', error);
      throw error;
    }
  }

  // Get camps by status
  static async getCampsByStatus(status) {
    try {
      const camps = await Camp.findByStatus(status);
      return { camps };
    } catch (error) {
      console.error('Error getting camps by status:', error);
      throw error;
    }
  }

  // Search camps
  static async searchCamps(searchTerm) {
    try {
      const camps = await Camp.search(searchTerm);
      return { camps };
    } catch (error) {
      console.error('Error searching camps:', error);
      throw error;
    }
  }
}

module.exports = CampService;
