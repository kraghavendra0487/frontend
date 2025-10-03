const Customer = require('../models/Customer');

class CustomerService {
  // Get all customers
  static async getAllCustomers() {
    try {
      const customers = await Customer.findAll();
      return { customers };
    } catch (error) {
      console.error('Error getting all customers:', error);
      throw error;
    }
  }

  // Get customer by ID
  static async getCustomerById(id) {
    try {
      const customer = await Customer.findById(id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return { customer };
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      throw error;
    }
  }

  // Get customers by employee ID
  static async getCustomersByEmployeeId(employeeId) {
    try {
      const customers = await Customer.findByEmployeeId(employeeId);
      return { customers };
    } catch (error) {
      console.error('Error getting customers by employee ID:', error);
      throw error;
    }
  }

  // Create customer
  static async createCustomer(customerData) {
    try {
      const customer = await Customer.create(customerData);
      return { customer };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update customer
  static async updateCustomer(id, customerData) {
    try {
      const customer = await Customer.update(id, customerData);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return { customer };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete customer
  static async deleteCustomer(id) {
    try {
      const customer = await Customer.delete(id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Search customers
  static async searchCustomers(searchTerm) {
    try {
      const customers = await Customer.search(searchTerm);
      return { customers };
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
}

module.exports = CustomerService;
