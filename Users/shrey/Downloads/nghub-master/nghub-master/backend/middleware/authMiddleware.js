const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// 🛡️ PROTECT MIDDLEWARE - Verify JWT and attach user to request
const protect = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token format' 
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get fresh user data from database
        const userQuery = 'SELECT id, employee_id, name, email, contact, role FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [decoded.userId]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Attach user to request object
        req.user = userResult.rows[0];
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Token expired' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token' 
            });
        }

        console.error('❌ Auth middleware error:', error);
        return res.status(401).json({ 
            success: false, 
            error: 'Authentication failed' 
        });
    }
};

// Middleware to authorize based on user role
// Example usage: authorize('admin') or authorize('admin', 'employee')
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`❌ User role '${req.user?.role}' not authorized. Required: ${roles.join(', ')}`);
            return res.status(403).json({ message: 'User role not authorized to access this route' });
        }
        next();
    };
};

module.exports = { protect, authorize };
