const express = require('express');
const router = express.Router();
const { createSellOrderStack, createBuyOrderStack, createOrderHistory, fetchUserInchunks, uploadImage, a, getH, getName, findWalletsFromContractAddress, fetchJsonData, fetchJsonData1, sendTestingMail, updateAllWallet, distributeAllUserReferal, removeAllusersBalance, updateGraphData, getSocketData, getUserActivity, updateBulkLocked, deleteWallet, getcmcohva, deleteData, createOHLCFromDB, createWallet, updateWallet } = require('../controller/testing');
router.get("/test/add_sell_order", createSellOrderStack);
router.get("/test/add_buy_order", createBuyOrderStack);
router.get("/test/add_order_history", createOrderHistory); 
router.get("/test/fetch-user", fetchUserInchunks);
router.get("/test/fetch-h", getH); 
router.post("/test/get-name", getName); 
router.post("/test/get-wallets-by-contract", findWalletsFromContractAddress); 
router.post("/test/get-user-info", fetchJsonData);
router.post("/test/get-kyc-info", fetchJsonData1); 
router.post("/test/send-test-email", sendTestingMail); 
router.post("/test/create-all-user-wallet", updateAllWallet); 
router.post("/test/create-all-user-referal", distributeAllUserReferal); 
router.post("/test/remove-all-user-btex", removeAllusersBalance); 
router.post("/test/update-graph-data", updateGraphData); 
router.post("/test/get-socket-data", getSocketData); 
router.post("/test/get-user-activity", getUserActivity); 
router.post("/test/update-bulk-locked", updateBulkLocked); 
router.post("/test/delete-wallet", deleteWallet); 
router.post("/test/get-cmc-ohva", getcmcohva); 
router.post("/test/delete-data", deleteData); 
router.post("/test/createOHLCFromDB", createOHLCFromDB);
router.post("/test/a", a); 
router.post("/test/createW", createWallet)
router.post("/test/createU", updateWallet)
// router.post("/test/upload-image", uploadImage);



module.exports = router;