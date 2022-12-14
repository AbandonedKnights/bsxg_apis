const express = require('express');
const {suppoted_currency, addCurrency,gettoken,addToken,updateCrptoSetting,pairedCurrency, getpairedCurrency, updateToken, captureFundHistory} = require('../controller/Currency');
const router = express.Router();

router.post("/gettoken", gettoken);
router.get("/paired_currency", pairedCurrency);
router.get("/suppotedCurrency", suppoted_currency);
router.post("/addCurrency", addCurrency);
router.post("/addtoken", addToken);
router.post("/updateToken", updateToken);
router.post("/updatecrptosetting", updateCrptoSetting);
router.post("/getpairedCurrency", getpairedCurrency);

router.post("/user_wallet_capture", captureFundHistory);

// router.post('/signup', signup);
// router.post('/signin', signin);

module.exports = router;