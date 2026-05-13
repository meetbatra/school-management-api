const validate = (schema) => (req, res, next) => {
  const dataToValidate = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ? req.body : req.query;
  const result = schema.safeParse(dataToValidate);

  if (!result.success) {
    const errors = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.body = result.data;
  } else {
    req.query = result.data;
  }

  next();
};

module.exports = validate;
