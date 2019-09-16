const Post = require('../models/post');
const { throwErrorIfInvalid, handleAsyncError } = require('../utils/helpers');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(result => {
      res.status(200).json({ posts: result });
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
