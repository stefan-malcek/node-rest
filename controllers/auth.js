const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { throwErrorIfInvalid, handleAsyncError } = require('../utils/helpers');
const config = require('../config');

exports.signup = async (req, res, next) => {
  throwErrorIfInvalid(req);

  const { email, name, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      name: name,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    handleAsyncError(err, next);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token: token,
      userId: user._id.toString()
    });
  } catch (err) {
    handleAsyncError(err, next);
  }
};
