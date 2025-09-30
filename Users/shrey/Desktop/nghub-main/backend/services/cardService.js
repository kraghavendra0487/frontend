const Card = require('../models/Card');

class CardService {
  // Get all cards
  static async getAllCards() {
    try {
      const cards = await Card.findAll();
      return { cards };
    } catch (error) {
      console.error('Error getting all cards:', error);
      throw error;
    }
  }

  // Get card by ID
  static async getCardById(id) {
    try {
      const card = await Card.findById(id);
      if (!card) {
        throw new Error('Card not found');
      }
      return { card };
    } catch (error) {
      console.error('Error getting card by ID:', error);
      throw error;
    }
  }

  // Get card by customer ID
  static async getCardByCustomerId(customerId) {
    try {
      const card = await Card.findByCustomerId(customerId);
      return { card };
    } catch (error) {
      console.error('Error getting card by customer ID:', error);
      throw error;
    }
  }

  // Get cards by employee ID
  static async getCardsByEmployeeId(employeeId) {
    try {
      const cards = await Card.findByEmployeeId(employeeId);
      return { cards };
    } catch (error) {
      console.error('Error getting cards by employee ID:', error);
      throw error;
    }
  }

  // Create card
  static async createCard(cardData) {
    try {
      const card = await Card.create(cardData);
      return { card };
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  }

  // Update card
  static async updateCard(id, cardData) {
    try {
      const card = await Card.update(id, cardData);
      if (!card) {
        throw new Error('Card not found');
      }
      return { card };
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  // Delete card
  static async deleteCard(id) {
    try {
      const card = await Card.delete(id);
      if (!card) {
        throw new Error('Card not found');
      }
      return { message: 'Card deleted successfully' };
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }
}

module.exports = CardService;
