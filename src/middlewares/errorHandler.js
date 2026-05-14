const AppError = require('../utils/AppError');

const isProd = process.env.NODE_ENV === 'production';

const mapMySqlError = (err) => {
  if (!err || !err.code) return null;

  switch (err.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return new AppError('Database authentication failed', 503, 'DB_AUTH_ERROR');
    case 'ER_BAD_DB_ERROR':
      return new AppError('Database is not available', 503, 'DB_NOT_FOUND');
    case 'ECONNREFUSED':
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ETIMEDOUT':
    case 'ENOTFOUND':
      return new AppError('Database connection failed', 503, 'DB_CONNECTION_ERROR');
    default:
      return null;
  }
};

const errorHandler = (err, req, res, next) => {
  let handledError = err;

  if (err?.type === 'entity.parse.failed') {
    handledError = new AppError('Invalid JSON body', 400, 'INVALID_JSON');
  } else {
    handledError = mapMySqlError(err) || err;
  }

  if (!(handledError instanceof AppError)) {
    handledError = new AppError('Internal server error', 500, 'INTERNAL_ERROR');
  }

  const response = {
    success: false,
    message: handledError.message,
    code: handledError.code
  };

  if (handledError.details) {
    response.details = handledError.details;
  }

  if (!isProd) {
    response.debug = {
      originalError: err?.message,
      originalCode: err?.code
    };
  }

  if (handledError.statusCode >= 500) {
    console.error(err);
  }

  res.status(handledError.statusCode).json(response);
};

module.exports = errorHandler;
