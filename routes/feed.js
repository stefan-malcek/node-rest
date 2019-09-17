const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/posts', isAuth, feedController.getPosts);

router.post(
  '/posts',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.postPosts
);

router.get('/posts/:postId', feedController.getPost);

router.put(
  '/posts/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.putPost
);

router.delete('/posts/:postId', isAuth, feedController.deletePost);

router.get('/status', isAuth, feedController.getStatus);

router.patch(
  '/status',
  isAuth,
  body('status')
    .trim()
    .not()
    .isEmpty(),
  feedController.patchStatus
);

module.exports = router;
