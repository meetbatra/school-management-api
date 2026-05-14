const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const isBodyMethod = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';
  const dataToValidate = isBodyMethod ? req.body : req.query;

  const result = schema.safeParse(dataToValidate);

  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message
    }));

    return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors));
  }

  if (isBodyMethod) {
    req.body = result.data;
  } else {
    req.query = result.data;
  }

  return next();
};

module.exports = validate;
