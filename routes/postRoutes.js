const express = require('express');
const router = express.Router();

const PostController = require('../controllers/posts');
const AuthHelper = require('../Helpers/AuthHelper');

router.get('/posts', AuthHelper.VerifyToken, PostController.GetAllPosts);
router.get('/post/:id', AuthHelper.VerifyToken, PostController.GetPost);

router.post('/post/add-post', AuthHelper.VerifyToken, PostController.AddPost);
router.post('/post/add-like', AuthHelper.VerifyToken, PostController.AddLike);
router.post('/post/add-comment', AuthHelper.VerifyToken, PostController.AddComment);

module.exports = router;