const express = require('express');
const { sellOrder, buyOrder, orderHistory, orderValume, cancleOrder, openOrder, allHistory, createMultipleOrder, userOrderHistory } = require('../controller/orders');
const { isKycDone, isPaired } = require('../utils/functions');
const { orderValidator } = require('../utils/middleware');

const router = express.Router();

router.post("/sell-order", isKycDone, isPaired, orderValidator, sellOrder);
router.post("/buy-order", isKycDone, isPaired, orderValidator, buyOrder);
router.post("/create-multiple-order", isPaired, orderValidator, createMultipleOrder);
router.post('/order-history', orderHistory);
router.post('/cancle-order', cancleOrder);
router.get('/get-all-order', openOrder);
router.get('/get-all-orderHistory', allHistory);
router.post('/get-user-order-history', userOrderHistory);
router.post("/get-order-valume", orderValume);

module.exports = router;