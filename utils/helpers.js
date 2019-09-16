const fs = require('fs');
const path = require('path');

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

exports.clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
