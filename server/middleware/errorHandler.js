/**
 * Global Error Handler Middleware
 * Catches and formats all errors across the application
 * Usage: app.use(errorHandler) - must be last middleware
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${status}: ${message}`);

  res.status(status).json({
    success: false,
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 * Usage: app.use(notFoundHandler) - must be before errorHandler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Async Error Wrapper
 * Wraps async controller functions to catch errors
 * Usage: router.get('/endpoint', asyncHandler(controller))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default errorHandler;
