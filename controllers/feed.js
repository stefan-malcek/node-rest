const Post = require('../models/post');
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
  const post = new Post({
    title: title,
    content: content,
    imageUrl: url,
    creator: {
      name: 'Name'
    }
  });

  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: result
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

      //Check logged in user

      clearImage(result.imageUrl);

      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted message' });
    })
    .catch(err => handleAsyncError(err, next));
};
