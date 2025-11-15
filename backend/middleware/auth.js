// backend/middleware/auth.js
function ensureAuthenticated(req, res, next) {
    // Passport attaches isAuthenticated() to the request object after login
    if (req.isAuthenticated()) {
        // User is logged in, proceed to the next middleware or route handler
        return next();
    }
    // User is not logged in, send an Unauthorized status
    res.status(401).json({ message: 'Authentication required. Please log in.' });
}

module.exports = ensureAuthenticated; // Export the function