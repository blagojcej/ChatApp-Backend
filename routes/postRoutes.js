const express = require('express');
const router = express.Router();

const PostController = require('../controllers/posts');
const AuthHelper = require('../Helpers/AuthHelper');

router.get('/posts', AuthHelper.VerifyToken, PostController.GetAllPosts)
router.post('/post/add-post', AuthHelper.VerifyToken, PostController.AddPost);
router.post('/post/add-like', AuthHelper.VerifyToken, PostController.AddLike);

module.exports = router;