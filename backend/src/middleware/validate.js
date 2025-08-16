export function validate(schema, property = 'body') {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], { abortEarly: false });

      if (error) {
        const errors = error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      req[property] = value; // assign sanitized data
      next();
    } catch (err) {
      next(err);
    }
  };
}
