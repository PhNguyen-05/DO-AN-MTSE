const express = require('express');
const { listBlogPosts, getBlogPostById } = require('../controllers/blogController');

const router = express.Router();

router.get('/blog', listBlogPosts);
router.get('/blog/:articleId', getBlogPostById);

module.exports = router;
