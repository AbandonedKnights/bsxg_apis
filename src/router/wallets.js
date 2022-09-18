const express = require('express');
const { createWallet, 
    createAllWallet,
    getcoldWallet,
    gethotWallet,
    getallcoin,
    updatecoldwallet,
    updatehotwallet, 
    getwallets, 
    getAllWallets, 
    getWithdraw,
    successWithdraw,
    addFundToUser,
    transectionHistory,
    captureAllWallet,
    updateColdWalletCoin,
    getActualBal,
    getwalletsNew,
    createWalletNew,
    getDepositDetails,
    getPrice
} = require('../controller/wallets');
const { updateUserDeposit } = require('../controller/deposit');
const { validateTokenAuth } = require('../utils/middleware');
const router = express.Router();
router.get("/coldwallet", getcoldWallet);
router.get("/hotwallet", gethotWallet);
router.post("/updatecoldwallet", updatecoldwallet);
router.post("/updatehotwallet", updatehotwallet);
router.get("/getallcoin", getallcoin);
router.post("/create-wallet", createWallet);
router.post("/create-all-wallet", createAllWallet); 
router.post("/get-wallets", getwallets);
router.post("/get-wallets-new", getwalletsNew);
router.post("/create-wallets-user", createWalletNew);
router.post("/get-all-wallets", getAllWallets);
router.post("/get-withdraw", getWithdraw);
router.get("/success-withdrawal", successWithdraw);
router.post("/update-wallet", updateUserDeposit);
router.post("/addfundtouser", addFundToUser);
router.post("/transection_history", transectionHistory);
router.post("/update_coldwallet_coin", updateColdWalletCoin);
router.post("/get_actual_bal", getActualBal);
router.post("/capture_all_wallet", captureAllWallet);
router.post("/get-deposit-details", getDepositDetails);
router.post("/get-price", getPrice);
module.exports = router;