const multer = require('multer');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx'); // XLSX library to parse Excel files
const csv = require('csv-parser'); // CSV parser library
const { spawn } = require('child_process'); // For running Python scripts
const FinancialTransaction = require('../models/FinancialTransaction');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel', // for .xls files
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // for .xlsx files
      'application/csv',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx')) {
      return cb(null, true);
    }
    return cb(new Error('Only CSV and XLS/XLSX files are allowed'), false);
  }
});

class FinancialTransactionController {
  // Upload CSV or XLS file and bulk create transactions
  static async uploadCSVorXLS(req, res) {
    try {
      console.log('📁 Upload request received');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      console.log('📁 req.file:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        destination: req.file.destination,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });

      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      console.log(`📁 CSV file uploaded to: ${filePath}`);

      let parsedData = null;

      // Parse file based on extension (CSV or XLSX)
      if (fileExtension === '.csv') {
        // Use Python script for CSV parsing
        parsedData = await parseCSVWithPython(filePath);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        // Use Node.js library for Excel parsing
        parsedData = await parseXLSX(filePath);
      } else {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid file type. Only CSV or XLSX are allowed' 
        });
      }

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          error: parsedData.error,
          details: parsedData.errors || []
        });
      }

      // Insert valid data into database
      const insertedTransactions = [];
      const insertionErrors = [];

      for (let i = 0; i < parsedData.data.length; i++) {
        try {
          const transaction = await FinancialTransaction.create(parsedData.data[i]);
          insertedTransactions.push(transaction);
        } catch (insertError) {
          insertionErrors.push({
            row: i + 1,
            data: parsedData.data[i],
            error: insertError.message
          });
        }
      }

      // Response with operation summary
      res.json({
        success: true,
        message: 'File processed successfully',
        insertedRows: insertedTransactions.length,
        insertionErrors: insertionErrors.length,
        validationErrors: parsedData.errors ? parsedData.errors.length : 0,
        details: {
          insertionErrors,
          validationErrors: parsedData.errors || []
        }
      });

      // Clean up the uploaded file after processing
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    } catch (error) {
      console.error('❌ Error processing file upload:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process file upload',
        details: error.message
      });
    }
  }

  // Get all financial transactions with pagination and filtering
  static async getAllFinancialTransactions(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search || '',
        bank: req.query.bank || '',
        type: req.query.type || '',
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        minAmount: req.query.minAmount || '',
        maxAmount: req.query.maxAmount || ''
      };

      const result = await FinancialTransaction.findAll(options);
      res.json({
        success: true,
        data: result.transactions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error getting financial transactions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get financial transactions',
        details: error.message
      });
    }
  }

  // Get single financial transaction by ID
  static async getFinancialTransactionById(req, res) {
    try {
      const { id } = req.params;
      const transaction = await FinancialTransaction.findById(id);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Financial transaction not found'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Error getting financial transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get financial transaction',
        details: error.message
      });
    }
  }

  // Create new financial transaction
  static async createFinancialTransaction(req, res) {
    try {
      const transactionData = req.body;
      const transaction = await FinancialTransaction.create(transactionData);
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Financial transaction created successfully'
      });
    } catch (error) {
      console.error('Error creating financial transaction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create financial transaction',
        details: error.message
      });
    }
  }

  // Update financial transaction
  static async updateFinancialTransaction(req, res) {
    try {
      const { id } = req.params;
      const transactionData = req.body;
      
      const transaction = await FinancialTransaction.update(id, transactionData);
      
      res.json({
        success: true,
        data: transaction,
        message: 'Financial transaction updated successfully'
      });
    } catch (error) {
      console.error('Error updating financial transaction:', error);
      if (error.message === 'Financial transaction not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to update financial transaction',
        details: error.message
      });
    }
  }

  // Delete financial transaction
  static async deleteFinancialTransaction(req, res) {
    try {
      const { id } = req.params;
      const transaction = await FinancialTransaction.delete(id);
      
      res.json({
        success: true,
        data: transaction,
        message: 'Financial transaction deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting financial transaction:', error);
      if (error.message === 'Financial transaction not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to delete financial transaction',
        details: error.message
      });
    }
  }

  // Export transactions to CSV
  static async exportToCSV(req, res) {
    try {
      const options = {
        search: req.query.search || '',
        bank: req.query.bank || '',
        type: req.query.type || '',
        startDate: req.query.startDate || '',
        endDate: req.query.endDate || '',
        minAmount: req.query.minAmount || '',
        maxAmount: req.query.maxAmount || ''
      };

      const transactions = await FinancialTransaction.findAllForExport(options);
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="financial_transactions.csv"');
      
      // Create CSV content
      const csvHeader = 'ID,Description,Bank,Amount,Type,Transaction Date,Created At,Updated At\n';
      const csvRows = transactions.map(transaction => 
        `${transaction.id},"${transaction.description}","${transaction.bank}",${transaction.amount},"${transaction.type}","${transaction.transaction_date}","${transaction.created_at}","${transaction.updated_at}"`
      ).join('\n');
      
      res.send(csvHeader + csvRows);
    } catch (error) {
      console.error('Error exporting financial transactions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export financial transactions',
        details: error.message
      });
    }
  }

  // Get distinct values for filter dropdowns
  static async getDistinctValues(req, res) {
    try {
      const { column } = req.params;
      const values = await FinancialTransaction.getDistinctValues(column);
      
      res.json({
        success: true,
        data: values
      });
    } catch (error) {
      console.error('Error getting distinct values:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get distinct values',
        details: error.message
      });
    }
  }
}

// CSV Parsing Function using Python script
function parseCSVWithPython(filePath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../scripts/csv_parser.py');
    console.log(`🐍 Executing Python script: ${pythonScript} with file: ${filePath}`);
    
    const python = spawn('python', [pythonScript, filePath]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      console.log(`🐍 Python stdout: ${stdout}`);
      if (stderr) {
        console.log(`🐍 Python stderr: ${stderr}`);
      }
      
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        reject(new Error(`Failed to parse Python script output: ${parseError.message}`));
      }
    });
    
    python.on('error', (error) => {
      reject(new Error(`Failed to start Python script: ${error.message}`));
    });
  });
}

// XLSX Parsing Function
function parseXLSX(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet); // Parse the sheet to JSON
      
      // Validate and clean the data
      const validRows = [];
      const errors = [];
      
      rows.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
        
        // Skip empty rows
        if (!row.description && !row.bank && !row.amount && !row.type && !row.transaction_date) {
          return;
        }
        
        // Check required fields
        if (!row.description || !row.bank || !row.amount || !row.type || !row.transaction_date) {
          errors.push(`Row ${rowNumber}: Missing required fields`);
          return;
        }
        
        // Validate amount
        if (isNaN(parseFloat(row.amount))) {
          errors.push(`Row ${rowNumber}: Invalid amount '${row.amount}'`);
          return;
        }
        
        // Validate type
        if (!['credit', 'debit'].includes(row.type.toLowerCase())) {
          errors.push(`Row ${rowNumber}: Invalid type '${row.type}' - must be 'Credit' or 'Debit'`);
          return;
        }
        
        // Validate date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row.transaction_date)) {
          errors.push(`Row ${rowNumber}: Invalid date '${row.transaction_date}' - must be in YYYY-MM-DD format`);
          return;
        }
        
        // Clean and format data
        const cleanRow = {
          description: row.description.toString().trim(),
          bank: row.bank.toString().trim(),
          amount: parseFloat(row.amount).toString(),
          type: row.type.toString().trim().charAt(0).toUpperCase() + row.type.toString().trim().slice(1).toLowerCase(),
          transaction_date: row.transaction_date.toString().trim()
        };
        
        validRows.push(cleanRow);
      });
      
      if (errors.length > 0) {
        resolve({
          success: false,
          error: `Validation failed for ${errors.length} issues`,
          data: validRows,
          errors: errors
        });
      } else {
        resolve({
          success: true,
          error: null,
          data: validRows,
          errors: []
        });
      }
    } catch (err) {
      reject(new Error(`Excel parsing error: ${err.message}`));
    }
  });
}

module.exports = {
  FinancialTransactionController,
  upload
};
