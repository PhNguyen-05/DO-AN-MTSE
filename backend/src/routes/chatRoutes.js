const express = require('express');
const router = express.Router();
const { handleChat } = require('../services/chatService');

// POST /api/chat
router.post('/', handleChat);

module.exports = router;
