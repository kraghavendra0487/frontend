const Meeseva = require('../models/Meeseva');

// Get all meeseva records
const getAllMeeseva = async (req, res) => {
  try {
    const meesevaRecords = await Meeseva.findAll();
    res.json(meesevaRecords);
  } catch (error) {
    console.error('Error fetching meeseva records:', error);
    res.status(500).json({ error: 'Failed to fetch meeseva records' });
  }
};

// Get meeseva record by ID
const getMeesevaById = async (req, res) => {
  try {
    const { id } = req.params;
    const meesevaRecord = await Meeseva.findById(id);

    if (!meesevaRecord) {
      return res.status(404).json({ error: 'Meeseva record not found' });
    }

    res.json(meesevaRecord);
  } catch (error) {
    console.error('Error fetching meeseva record:', error);
    res.status(500).json({ error: 'Failed to fetch meeseva record' });
  }
};

// Create new meeseva record
const createMeeseva = async (req, res) => {
  try {
    const { name, advance_amount, used_amount, comment } = req.body;
    const created_by = req.user.id;

    // Validate required fields
    if (!name || advance_amount === undefined || used_amount === undefined) {
      return res.status(400).json({ error: 'Name, advance amount, and used amount are required' });
    }

    // Validate amounts
    if (advance_amount < 0 || used_amount < 0) {
      return res.status(400).json({ error: 'Amounts cannot be negative' });
    }

    if (used_amount > advance_amount) {
      return res.status(400).json({ error: 'Used amount cannot exceed advance amount' });
    }

    const newMeeseva = await Meeseva.create({
      name,
      advance_amount: parseFloat(advance_amount),
      used_amount: parseFloat(used_amount),
      comment,
      created_by
    });

    res.status(201).json(newMeeseva);
  } catch (error) {
    console.error('Error creating meeseva record:', error);
    res.status(500).json({ error: 'Failed to create meeseva record' });
  }
};

// Update meeseva record
const updateMeeseva = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, advance_amount, used_amount, comment } = req.body;
    const updated_by = req.user.id;

    // Validate required fields
    if (!name || advance_amount === undefined || used_amount === undefined) {
      return res.status(400).json({ error: 'Name, advance amount, and used amount are required' });
    }

    // Validate amounts
    if (advance_amount < 0 || used_amount < 0) {
      return res.status(400).json({ error: 'Amounts cannot be negative' });
    }

    if (used_amount > advance_amount) {
      return res.status(400).json({ error: 'Used amount cannot exceed advance amount' });
    }

    const updatedMeeseva = await Meeseva.update(id, {
      name,
      advance_amount: parseFloat(advance_amount),
      used_amount: parseFloat(used_amount),
      comment,
      updated_by
    });

    if (!updatedMeeseva) {
      return res.status(404).json({ error: 'Meeseva record not found' });
    }

    res.json(updatedMeeseva);
  } catch (error) {
    console.error('Error updating meeseva record:', error);
    res.status(500).json({ error: 'Failed to update meeseva record' });
  }
};

// Delete meeseva record
const deleteMeeseva = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMeeseva = await Meeseva.delete(id);

    if (!deletedMeeseva) {
      return res.status(404).json({ error: 'Meeseva record not found' });
    }

    res.json({ message: 'Meeseva record deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeseva record:', error);
    res.status(500).json({ error: 'Failed to delete meeseva record' });
  }
};

module.exports = {
  getAllMeeseva,
  getMeesevaById,
  createMeeseva,
  updateMeeseva,
  deleteMeeseva
};
