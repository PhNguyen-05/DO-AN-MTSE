const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');

const router = express.Router();

router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites', authMiddleware, addFavorite);
router.delete('/favorites/:productId', authMiddleware, removeFavorite);

module.exports = router;
