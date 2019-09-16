const bcrypt = require('bcryptjs');

const User = require('../models/user');
const {
  throwErrorIfInvalid,
  handleAsyncError,
  clearImage
} = require('../utils/helpers');

exports.signup = (req, res, next) => {
  throwErrorIfInvalid(req);

  const { email, name, password } = req.body;

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        name: name,
        password: hashedPassword
      });

      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created', userId: result._id });
    })
    .catch(err => handleAsyncError(err));
};
