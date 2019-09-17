const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const {
  throwErrorIfInvalid,
  handleAsyncError,
  clearImage
} = require('../utils/helpers');
const config = require('../config');

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

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password.');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString()
      });
    })
    .catch(err => handleAsyncError(err));
};
