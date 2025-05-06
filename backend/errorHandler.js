// errorHandler.js

/**
 * Centralized error handler for API responses
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @returns {Object} HTTP response with appropriate status code and error message
 */
function handleError(res, error) {
    console.error('Error:', error);
    
    // Determine status code based on error type
    let statusCode = 500;
    let message = 'Internal server error';
    
    if (error.message.includes('not found')) {
      statusCode = 404;
      message = error.message;
    } else if (error.name === 'ValidationError' || 
              error.message.includes('validation failed') || 
              error.message.includes('invalid')) {
      statusCode = 400;
      message = error.message;
    } else if (error.name === 'UnauthorizedError' || 
              error.message.includes('unauthorized')) {
      statusCode = 401;
      message = 'Unauthorized access';
    } else if (error.name === 'ForbiddenError' || 
              error.message.includes('forbidden')) {
      statusCode = 403;
      message = 'Access forbidden';
    }
    
    return res.status(statusCode).json({
      error: true,
      message: message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
  
  module.exports = {
    handleError
  };