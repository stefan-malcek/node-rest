const Post = require('../models/post');
const User = require('../models/user');
const {
  throwErrorIfInvalid,
  handleAsyncError,
  clearImage
} = require('../utils/helpers');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const pageSize = 2;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    handleAsyncError(err, next);
  }
};

exports.postPosts = async (req, res, next) => {
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
    creator: req.userId
  });

  try {
    await post.save();

    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: {
        _id: user._id,
        name: user.name
      }
    });
  } catch (err) {
    handleAsyncError(err, next);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ post: post });
  } catch (err) {
    handleAsyncError(err, next);
  }
};

exports.putPost = async (req, res, next) => {
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

  try {
    let post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    post = await post.save();

    res.status(200).json({ post: post });
  } catch (err) {
    handleAsyncError(err, next);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized.');
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl);

    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);

    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: 'Deleted message' });
  } catch (err) {
    handleAsyncError(err, next);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ status: user.status });
  } catch (err) {
    handleAsyncError(err, next);
  }
};

exports.patchStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    user.status = newStatus;
    await user.save();

    res.status(200).json({ status: newStatus });
  } catch (err) {
    handleAsyncError(err, next);
  }
};
