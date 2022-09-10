const express = require('express');
const { 
    trade_history, 
    deposite_history,
    withdraw_history, 
    fundtranfer_history, 
    crypto_transaction_history, 
    fundHistory, 
    depositHistory,
    withdrawHistory,
    tradeHistory, 
    orderHistory,
    tradeCommission,
    withdrawalCommision,
    fundUserTransfer,
    depositInrBullsiexHistory,
    changeBullsiexDepositStatus,
    rejectBullsiexDepositStatus,
    depositInrHistory,
    changeDepositStatus,
    deleteDepositUser,
    dashBoardData,
    getStake,
    setStake,
    harvest
} = require('../controller/history');

const router = express.Router();






router.post("/trade_history", trade_history);
router.post("/deposite_history", deposite_history)
router.post("/withdraw_history", withdraw_history)
router.get("/fundtranfer_history", fundtranfer_history)
router.post("/crypto_transaction_history", crypto_transaction_history)
router.post("/user-fund-history", fundHistory);
router.post("/user-fund-transfer", fundUserTransfer);
router.post("/admin-deposit-history", depositHistory);
router.post("/admin-withdraw-history", withdrawHistory);
router.post("/admin-trade-history", tradeHistory);
router.post("/admin-order-history", orderHistory);
router.post("/total_trade_commission", tradeCommission);
router.post("/total_withdrawal_commission", withdrawalCommision);
router.post("/deposit-inr-history", depositInrHistory);// for Ctskola
router.post("/deposit-inr-status", changeDepositStatus);
router.post("/deposit-inr-delete", deleteDepositUser);
router.post("/deposit-inr-bullsiex-history", depositInrBullsiexHistory);
router.post("/deposit-inr-bullsiex-status", changeBullsiexDepositStatus);
router.post("/deposit-inr-bullsiex-reject", rejectBullsiexDepositStatus);
router.post("/dashboard-data", dashBoardData);
router.post("/get-staking", getStake);
router.post("/set-staking", setStake);
router.post("/get-harvest", harvest);

module.exports = router;