const express = require('express');
const { listPremiumPlans } = require('../controllers/premiumController');

const router = express.Router();

router.get('/premium', listPremiumPlans);

module.exports = router;
