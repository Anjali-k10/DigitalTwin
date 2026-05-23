/**
 * API Response Helper
 * Standardizes all API responses
 */

export const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export const sendError = (res, statusCode, message, code = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code }),
  });
};

/**
 * Validation Helper
 */
export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * JWT Helper
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
};

/**
 * User Helper
 */
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.__v;
  return userObj;
};

export default {
  sendSuccess,
  sendError,
  validateEmail,
  validatePassword,
  extractTokenFromHeader,
  sanitizeUser,
};
