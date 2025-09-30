const CampService = require('../services/campService');

class CampController {
  // Get all camps
  static async getAllCamps(req, res) {
    try {
      const result = await CampService.getAllCamps();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting all camps:', error.message);
      res.status(500).json({ error: 'Failed to fetch camps' });
    }
  }

  // Get camp by ID
  static async getCampById(req, res) {
    try {
      const { id } = req.params;
      const result = await CampService.getCampById(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting camp by ID:', error.message);
      if (error.message === 'Camp not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch camp' });
      }
    }
  }

  // Get camps by employee ID
  static async getCampsByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      const result = await CampService.getCampsByEmployeeId(employeeId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting camps by employee ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch camps' });
    }
  }

  // Create camp
  static async createCamp(req, res) {
    try {
      const campData = req.body;
      const result = await CampService.createCamp(campData);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating camp:', error.message);
      res.status(500).json({ error: 'Failed to create camp' });
    }
  }

  // Update camp
  static async updateCamp(req, res) {
    try {
      const { id } = req.params;
      const campData = req.body;
      const result = await CampService.updateCamp(id, campData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating camp:', error.message);
      if (error.message === 'Camp not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update camp' });
      }
    }
  }

  // Delete camp
  static async deleteCamp(req, res) {
    try {
      const { id } = req.params;
      const result = await CampService.deleteCamp(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting camp:', error.message);
      if (error.message === 'Camp not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete camp' });
      }
    }
  }

  // Get camps by status
  static async getCampsByStatus(req, res) {
    try {
      const { status } = req.params;
      const result = await CampService.getCampsByStatus(status);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting camps by status:', error.message);
      res.status(500).json({ error: 'Failed to fetch camps' });
    }
  }

  // Search camps
  static async searchCamps(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const result = await CampService.searchCamps(q);
      res.json(result);
    } catch (error) {
      console.error('❌ Error searching camps:', error.message);
      res.status(500).json({ error: 'Failed to search camps' });
    }
  }
}

module.exports = CampController;
