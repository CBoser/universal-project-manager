/**
 * Authentication Middleware
 * Protects routes and ensures users are authenticated
 */

/**
 * Middleware to check if user is authenticated
 * Protects routes that require authentication
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
};

/**
 * Middleware to attach user information to request
 * Optional authentication - doesn't block unauthenticated requests
 */
const attachUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.userEmail = req.session.userEmail;
  }
  next();
};

/**
 * Middleware to check if user owns a resource
 * Used in combination with requireAuth
 */
const requireOwnership = (resourceUserIdGetter) => {
  return (req, res, next) => {
    const resourceUserId = resourceUserIdGetter(req);

    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    if (req.session.userId !== resourceUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  attachUser,
  requireOwnership
};
