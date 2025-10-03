const CardService = require('../services/cardService');

class CardController {
  // Get all cards
  static async getAllCards(req, res) {
    try {
      const result = await CardService.getAllCards();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting all cards:', error.message);
      res.status(500).json({ error: 'Failed to fetch cards' });
    }
  }

  // Get card by ID
  static async getCardById(req, res) {
    try {
      const { id } = req.params;
      const result = await CardService.getCardById(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting card by ID:', error.message);
      if (error.message === 'Card not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch card' });
      }
    }
  }

  // Get card by customer ID
  static async getCardByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      const result = await CardService.getCardByCustomerId(customerId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting card by customer ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch card' });
    }
  }

  // Get cards by employee ID
  static async getCardsByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      const result = await CardService.getCardsByEmployeeId(employeeId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting cards by employee ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch cards' });
    }
  }

  // Create card
  static async createCard(req, res) {
    try {
      const cardData = req.body;
      const result = await CardService.createCard(cardData);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating card:', error.message);
      res.status(500).json({ error: 'Failed to create card' });
    }
  }

  // Update card
  static async updateCard(req, res) {
    try {
      const { id } = req.params;
      const cardData = req.body;
      const result = await CardService.updateCard(id, cardData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating card:', error.message);
      if (error.message === 'Card not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update card' });
      }
    }
  }

  // Delete card
  static async deleteCard(req, res) {
    try {
      const { id } = req.params;
      const result = await CardService.deleteCard(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting card:', error.message);
      if (error.message === 'Card not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete card' });
      }
    }
  }
}

module.exports = CardController;
