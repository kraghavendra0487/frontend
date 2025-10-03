#!/usr/bin/env python3
"""
CSV Parser for Financial Transactions
Parses CSV files and validates data before uploading to the database
"""

import csv
import sys
import json
from datetime import datetime
from decimal import Decimal, InvalidOperation
import os

def validate_date(date_string):
    """Validate date format (YYYY-MM-DD)"""
    try:
        datetime.strptime(date_string, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_amount(amount_string):
    """Validate amount is a valid decimal number"""
    try:
        amount = Decimal(str(amount_string))
        return amount >= 0
    except (InvalidOperation, ValueError):
        return False

def validate_type(type_string):
    """Validate transaction type"""
    return type_string.lower() in ['credit', 'debit']

def validate_row(row, row_number):
    """Validate a single CSV row"""
    errors = []
    
    # Required fields
    required_fields = ['description', 'bank', 'amount', 'type', 'transaction_date']
    
    for field in required_fields:
        if field not in row or not row[field].strip():
            errors.append(f"Row {row_number}: Missing required field '{field}'")
    
    if errors:
        return errors
    
    # Validate description
    if len(row['description'].strip()) < 2:
        errors.append(f"Row {row_number}: Description must be at least 2 characters")
    
    # Validate bank
    if len(row['bank'].strip()) < 2:
        errors.append(f"Row {row_number}: Bank name must be at least 2 characters")
    
    # Validate amount
    if not validate_amount(row['amount']):
        errors.append(f"Row {row_number}: Invalid amount '{row['amount']}' - must be a positive number")
    
    # Validate type
    if not validate_type(row['type']):
        errors.append(f"Row {row_number}: Invalid type '{row['type']}' - must be 'Credit' or 'Debit'")
    
    # Validate date
    if not validate_date(row['transaction_date']):
        errors.append(f"Row {row_number}: Invalid date '{row['transaction_date']}' - must be in YYYY-MM-DD format")
    
    return errors

def parse_csv_file(file_path):
    """Parse CSV file and return validated data with errors"""
    if not os.path.exists(file_path):
        return {
            'success': False,
            'error': f'CSV file not found at path: {file_path}',
            'data': [],
            'errors': []
        }

    try:
        # Parse CSV file
        with open(file_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            # Check if required columns exist
            required_columns = ['description', 'bank', 'amount', 'type', 'transaction_date']
            if not csv_reader.fieldnames:
                return {
                    'success': False,
                    'error': 'CSV file appears to be empty or invalid',
                    'data': [],
                    'errors': []
                }
            
            missing_columns = [col for col in required_columns if col not in csv_reader.fieldnames]
            if missing_columns:
                return {
                    'success': False,
                    'error': f'Missing required columns: {", ".join(missing_columns)}',
                    'data': [],
                    'errors': []
                }
            
            # Process rows
            valid_rows = []
            all_errors = []
            row_number = 1
            
            for row in csv_reader:
                row_number += 1
                
                # Skip empty rows
                if not any(row.values()):
                    continue
                
                # Validate row
                errors = validate_row(row, row_number)
                
                if errors:
                    all_errors.extend(errors)
                else:
                    # Clean and format data
                    clean_row = {
                        'description': row['description'].strip(),
                        'bank': row['bank'].strip(),
                        'amount': str(Decimal(row['amount'])) if row['amount'] else '0.00',
                        'type': row['type'].strip().capitalize(),
                        'transaction_date': row['transaction_date'].strip()
                    }
                    valid_rows.append(clean_row)
        
        # Return results
        if all_errors:
            return {
                'success': False,
                'error': f'Validation failed for {len(all_errors)} issues',
                'data': valid_rows,
                'errors': all_errors
            }
        else:
            return {
                'success': True,
                'error': None,
                'data': valid_rows,
                'errors': []
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'CSV parsing error: {str(e)}',
            'data': [],
            'errors': []
        }

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python csv_parser.py <csv_file_path>',
            'data': [],
            'errors': []
        }))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = parse_csv_file(file_path)
    print(json.dumps(result))

if __name__ == '__main__':
    main()
