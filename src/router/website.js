const express = require('express');
const { getWebsiteData, activityLog, notificationDetails, updateWebsite, updateKey, setChat, getChat, getUser, updateStake, stakeHistory } = require('../controller/website');

const router = express.Router();

router.get("/get-website-data", getWebsiteData);
router.post("/activity-log", activityLog);
router.post("/notification", notificationDetails);
router.post("/update-website", updateWebsite);
router.post("/update-key", updateKey);
router.post("/update-stake", updateStake);
router.post("/stake-history", stakeHistory);
router.post("/set-chat", setChat);
router.post("/get-chat", getChat);
router.post("/get-user-chat", getUser);
module.exports = router;