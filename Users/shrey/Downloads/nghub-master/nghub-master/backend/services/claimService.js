const Claim = require('../models/Claim');

class ClaimService {
  // Get all claims
  static async getAllClaims() {
    try {
      const claims = await Claim.findAll();
      return { claims };
    } catch (error) {
      console.error('Error getting all claims:', error);
      throw error;
    }
  }

  // Get claim by ID
  static async getClaimById(id) {
    try {
      const claim = await Claim.findById(id);
      if (!claim) {
        throw new Error('Claim not found');
      }
      return { claim };
    } catch (error) {
      console.error('Error getting claim by ID:', error);
      throw error;
    }
  }

  // Get claims by card ID
  static async getClaimsByCardId(cardId) {
    try {
      const claims = await Claim.findByCardId(cardId);
      return { claims };
    } catch (error) {
      console.error('Error getting claims by card ID:', error);
      throw error;
    }
  }

  // Get claims by customer ID
  static async getClaimsByCustomerId(customerId) {
    try {
      const claims = await Claim.findByCustomerId(customerId);
      return { claims };
    } catch (error) {
      console.error('Error getting claims by customer ID:', error);
      throw error;
    }
  }

  // Get claims by employee ID
  static async getClaimsByEmployeeId(employeeId) {
    try {
      const claims = await Claim.findByEmployeeId(employeeId);
      return { claims };
    } catch (error) {
      console.error('Error getting claims by employee ID:', error);
      throw error;
    }
  }

  // Create claim
  static async createClaim(claimData) {
    try {
      const claim = await Claim.create(claimData);
      return { claim };
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  }

  // Update claim
  static async updateClaim(id, claimData) {
    try {
      const claim = await Claim.update(id, claimData);
      if (!claim) {
        throw new Error('Claim not found');
      }
      return { claim };
    } catch (error) {
      console.error('Error updating claim:', error);
      throw error;
    }
  }

  // Delete claim
  static async deleteClaim(id) {
    try {
      const claim = await Claim.delete(id);
      if (!claim) {
        throw new Error('Claim not found');
      }
      return { message: 'Claim deleted successfully' };
    } catch (error) {
      console.error('Error deleting claim:', error);
      throw error;
    }
  }

  // Get claims by status
  static async getClaimsByStatus(status) {
    try {
      const claims = await Claim.findByStatus(status);
      return { claims };
    } catch (error) {
      console.error('Error getting claims by status:', error);
      throw error;
    }
  }
}

module.exports = ClaimService;
