const { ClientService, ClientServiceItem } = require('../models/ClientService');
const pool = require('../config/database');

// Predefined services list
const PREDEFINED_SERVICES = [
  'Labour Licence Registration',
  'Trade Licence Registration',
  'Food Licence Registration',
  'GST Registration'
];

// Predefined status options
const PREDEFINED_STATUSES = [
  'Not Started',
  'In Progress',
  'Under Review',
  'Completed',
  'Cancelled'
];


class ClientServiceController {
  // Get all client services with pagination and filtering
  static async getAllClientServices(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search = '',
        startDate,
        endDate
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        search,
        startDate,
        endDate
      };

      const result = await ClientService.findAllWithServiceCounts(options);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting all client services:', error.message);
      res.status(500).json({ error: 'Failed to fetch client services' });
    }
  }

  // Get client service by ID with service items
  static async getClientServiceById(req, res) {
    try {
      const { id } = req.params;
      const result = await ClientService.findByIdWithServices(id);

      if (!result) {
        return res.status(404).json({ error: 'Client service not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('❌ Error getting client service by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch client service' });
    }
  }

  // Create client service (simplified structure)
  static async createClientService(req, res) {
    try {
      const {
        establishment_name, employer_name, email_id, mobile_number
      } = req.body;

      if (!establishment_name) {
        return res.status(400).json({ error: 'Establishment name is required' });
      }

      const clientServiceData = {
        establishment_name, employer_name, email_id, mobile_number
      };
      const result = await ClientService.create(clientServiceData);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating client service:', error.message);
      res.status(500).json({ error: 'Failed to create client service' });
    }
  }


  // Update client service (simplified structure)
  static async updateClientService(req, res) {
    try {
      const { id } = req.params;
      const {
        establishment_name, employer_name, email_id, mobile_number
      } = req.body;

      if (!establishment_name) {
        return res.status(400).json({ error: 'Establishment name is required' });
      }

      const clientServiceData = {
        establishment_name, employer_name, email_id, mobile_number
      };
      const result = await ClientService.update(id, clientServiceData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating client service:', error.message);
      if (error.message === 'Client service not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update client service' });
      }
    }
  }

  // Delete client service
  static async deleteClientService(req, res) {
    try {
      const { id } = req.params;
      const result = await ClientService.delete(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting client service:', error.message);
      if (error.message === 'Client service not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete client service' });
      }
    }
  }

  // ===== SERVICE ITEM MANAGEMENT METHODS =====

  // Get all service items for a client
  static async getServiceItems(req, res) {
    try {
      const { clientServiceId } = req.params;
      const serviceItems = await ClientServiceItem.findByClientServiceId(clientServiceId);
      res.json(serviceItems);
    } catch (error) {
      console.error('❌ Error getting service items:', error.message);
      res.status(500).json({ error: 'Failed to fetch service items' });
    }
  }

  // Create new service item
  static async createServiceItem(req, res) {
    try {
      const { clientServiceId } = req.params;
      const { service_name, service_status, remarks } = req.body;

      if (!service_name) {
        return res.status(400).json({ error: 'Service name is required' });
      }

      const serviceItemData = {
        client_service_id: clientServiceId,
        service_name,
        service_status,
        remarks
      };

      const result = await ClientServiceItem.create(serviceItemData);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating service item:', error.message);
      res.status(500).json({ error: 'Failed to create service item' });
    }
  }

  // Update service item
  static async updateServiceItem(req, res) {
    try {
      const { id } = req.params;
      const { service_name, service_status, remarks } = req.body;

      if (!service_name) {
        return res.status(400).json({ error: 'Service name is required' });
      }

      const serviceItemData = { service_name, service_status, remarks };
      const result = await ClientServiceItem.update(id, serviceItemData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating service item:', error.message);
      if (error.message === 'Service item not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update service item' });
      }
    }
  }

  // Delete service item
  static async deleteServiceItem(req, res) {
    try {
      const { id } = req.params;
      const result = await ClientServiceItem.delete(id);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting service item:', error.message);
      if (error.message === 'Service item not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete service item' });
      }
    }
  }

  // Get distinct values for filter dropdowns (basic client info only)
  static async getDistinctValues(req, res) {
    try {
      const { column } = req.params;
      const result = await ClientService.getDistinctValues(column);
      res.json(result);
    } catch (error) {
      console.error('❌ Error getting distinct values:', error.message);
      res.status(500).json({ error: 'Failed to fetch distinct values' });
    }
  }

  // Get predefined service statuses for dropdowns
  static async getServiceStatuses(req, res) {
    try {
      res.json(PREDEFINED_STATUSES);
    } catch (error) {
      console.error('❌ Error getting service statuses:', error.message);
      res.status(500).json({ error: 'Failed to fetch service statuses' });
    }
  }

  // Get predefined services list for dropdowns
  static async getAvailableServices(req, res) {
    try {
      res.json(PREDEFINED_SERVICES);
    } catch (error) {
      console.error('❌ Error getting available services:', error.message);
      res.status(500).json({ error: 'Failed to fetch available services' });
    }
  }

}

module.exports = ClientServiceController;
