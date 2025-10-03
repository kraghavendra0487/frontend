const ClaimService = require('../services/claimService');

class ClaimController {
  // Get all claims
  static async getAllClaims(req, res) {
    try {
      const result = await ClaimService.getAllClaims();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting all claims:', error.message);
      res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }

  // Get claim by ID
  static async getClaimById(req, res) {
    try {
      const { id } = req.params;
      const result = await ClaimService.getClaimById(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting claim by ID:', error.message);
      if (error.message === 'Claim not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch claim' });
      }
    }
  }

  // Get claims by card ID
  static async getClaimsByCardId(req, res) {
    try {
      const { cardId } = req.params;
      const result = await ClaimService.getClaimsByCardId(cardId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting claims by card ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }

  // Get claims by customer ID
  static async getClaimsByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      const result = await ClaimService.getClaimsByCustomerId(customerId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting claims by customer ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }

  // Get claims by employee ID
  static async getClaimsByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      const result = await ClaimService.getClaimsByEmployeeId(employeeId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting claims by employee ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }

  // Create claim
  static async createClaim(req, res) {
    try {
      const claimData = req.body;
      const result = await ClaimService.createClaim(claimData);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating claim:', error.message);
      res.status(500).json({ error: 'Failed to create claim' });
    }
  }

  // Update claim
  static async updateClaim(req, res) {
    try {
      const { id } = req.params;
      const claimData = req.body;
      const result = await ClaimService.updateClaim(id, claimData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating claim:', error.message);
      if (error.message === 'Claim not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update claim' });
      }
    }
  }

  // Delete claim
  static async deleteClaim(req, res) {
    try {
      const { id } = req.params;
      const result = await ClaimService.deleteClaim(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting claim:', error.message);
      if (error.message === 'Claim not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete claim' });
      }
    }
  }

  // Get claims by status
  static async getClaimsByStatus(req, res) {
    try {
      const { status } = req.params;
      const result = await ClaimService.getClaimsByStatus(status);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting claims by status:', error.message);
      res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }
}

module.exports = ClaimController;
