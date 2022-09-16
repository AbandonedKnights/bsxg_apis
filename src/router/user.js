const express = require("express");
const {
  searchUsers,
  kycUser,
  bankUser,
  updatekyc,
  updatebank,
  getUserProfile,
  getReferalInfo,
  getAllReferalInfo,
  getActiveKYC,
  updateUserInfo,
  getAllReferalNotKYC,
  getReferals,
  getUsersActivity,
  getUserReferalInfo
} = require("../controller/user");

const router = express.Router();

router.post("/find-user", searchUsers);
router.get("/alluser", searchUsers);
router.get("/getactivekyc", getActiveKYC);

router.get("/user/edit/UserEdit", kycUser);
router.post("/user/get-profile-info", getUserProfile);
router.post("/getRefferalInfo", getUserReferalInfo);
router.post("/user/get-referal-info", getReferalInfo);
router.get("/user/get-referal-info", getReferalInfo);
router.post("/user/get-referals", getReferals);
router.post("/user/get-all-referal", getAllReferalInfo);
router.post("/user/get-referal-notkyc", getAllReferalNotKYC);

router.get("/getkyclist", kycUser);
router.post("/updatekyc", updatekyc);
router.post("/updatebank", updatebank);
router.post("/updateprofile", updateUserInfo);
router.post("/get-user-activity", getUsersActivity);

router.get("/getbankkyc", bankUser);

module.exports = router;
