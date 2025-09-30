const CustomerService = require('../services/customerService');

class CustomerController {
  // Get all customers
  static async getAllCustomers(req, res) {
    try {
      const result = await CustomerService.getAllCustomers();
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting all customers:', error.message);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }

  // Get customer by ID
  static async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const result = await CustomerService.getCustomerById(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting customer by ID:', error.message);
      if (error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch customer' });
      }
    }
  }

  // Get customers by employee ID
  static async getCustomersByEmployeeId(req, res) {
    try {
      const { employeeId } = req.params;
      const result = await CustomerService.getCustomersByEmployeeId(employeeId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting customers by employee ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }

  // Create customer
  static async createCustomer(req, res) {
    try {
      const customerData = req.body;
      const result = await CustomerService.createCustomer(customerData);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating customer:', error.message);
      res.status(500).json({ error: 'Failed to create customer' });
    }
  }

  // Update customer
  static async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const customerData = req.body;
      const result = await CustomerService.updateCustomer(id, customerData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating customer:', error.message);
      if (error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update customer' });
      }
    }
  }

  // Delete customer
  static async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const result = await CustomerService.deleteCustomer(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting customer:', error.message);
      if (error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete customer' });
      }
    }
  }

  // Search customers
  static async searchCustomers(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const result = await CustomerService.searchCustomers(q);
      res.json(result);
    } catch (error) {
      console.error('❌ Error searching customers:', error.message);
      res.status(500).json({ error: 'Failed to search customers' });
    }
  }
}

module.exports = CustomerController;
