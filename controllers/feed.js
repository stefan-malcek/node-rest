const Post = require('../models/post');
const User = require('../models/user');
const {
  throwErrorIfInvalid,
  handleAsyncError,
  clearImage
} = require('../utils/helpers');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const pageSize = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;

      return Post.find()
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize);
    })
    .then(result => {
      res.status(200).json({
        posts: result,
        totalItems: totalItems
      });
    })
    .catch(err => handleAsyncError(err, next));
};

exports.postPosts = (req, res, next) => {
  throwErrorIfInvalid(req);

  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 400;
    throw error;
  }

  const url = req.file.path.replace('\\', '/');
  const { title, content } = req.body;
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: url,
    creator: req.userId
  });

  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: {
          _id: creator._id,
          name: creator.name
        }
      });
    })
    .catch(err => handleAsyncError(err, next));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(result => {
      if (!result) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ post: result });
    })
    .catch(err => handleAsyncError(err, next));
};

exports.putPost = (req, res, next) => {
  throwErrorIfInvalid(req);

  const postId = req.params.postId;
  const { title, content } = req.body;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }

  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 400;
    throw error;
  }

  Post.findById(postId)
    .then(result => {
      if (!result) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }

      if (result.creator.toString() !== req.userId) {
        const error = new Error('Not authorized.');
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== result.imageUrl) {
        clearImage(result.imageUrl);
      }

      result.title = title;
      result.content = content;
      result.imageUrl = imageUrl;
      return result.save();
    })
    .then(result => {
      res.status(200).json({ post: result });
    })
    .catch(err => handleAsyncError(err, next));
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(result => {
      if (!result) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }

      if (result.creator.toString() !== req.userId) {
        const error = new Error('Not authorized.');
        error.statusCode = 403;
        throw error;
      }

      clearImage(result.imageUrl);

      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted message' });
    })
    .catch(err => handleAsyncError(err, next));
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }

      return res.status(200).json({ status: user.status });
    })
    .catch(err => handleAsyncError(err, next));
};

exports.patchStatus = (req, res, next) => {
  const newStatus = req.body.status;

  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }

      user.status = newStatus;
      return user.save();
    })
    .then(result => {
      return res.status(200).json({ status: newStatus });
    })
    .catch(err => handleAsyncError(err, next));
};
