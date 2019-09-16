const { validationResult } = require('express-validator');

exports.handleAsyncError = (err, next) => {
  if (!err.sttatusCode) {
    err.statusCode = 500;
  }
  next(err);
};

exports.throwErrorIfInvalid = req => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      'Validation failed. Check the errors to see more details.'
    );
    error.statusCode = 400;
    error.errors = errors.array();
    throw error;
  }
};
