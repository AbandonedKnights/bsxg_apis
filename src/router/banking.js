
const express = require('express');
const { setBankDetails, getBankStatus, inrWithdraw, successInrWithdraw, getBank, WithdrawInr } = require('../controller/banking');
const router = express.Router();

router.post("/banking/set-banking-info", setBankDetails); 
router.post("/banking/get-banking-status", getBankStatus);
router.post("/banking/inr_withdrawal", inrWithdraw);
router.get("/success-inr-withdrawal", successInrWithdraw);
router.post("/banking/get-bank", getBank);
router.post("/banking/withdraw-inr", WithdrawInr);

module.exports = router;