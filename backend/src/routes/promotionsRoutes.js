const express = require('express');
const { listPromotions } = require('../controllers/promotionsController');

const router = express.Router();

router.get('/promotions', listPromotions);

module.exports = router;
