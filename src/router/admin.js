const express = require('express');
const {
    loginUser,
    forgetPassword,
    resetPassword,
    updateNewPassword,
    verifyForgetPassword,
    setGoogleAuth,
    getGoogleAuth,
    sendMobileVarificationOtp,
    varifieMobile,
    varifieMobileLogin,
    check_user_status,
    getGoogleAuthFromUserId,
    sendMobileVarificationOtWithEmail,
    varifieMobileWithdrawOTP,
    setGoogleAuthOTP,
    varifieEmailWithdrawOTP,
    modifyUserProfile,
    permanentDeleteUser,
    sendEmailVerificationCode,
    sendMobileVerificationCode,
    verifyUserOTP,
    getGoogleAuthNew,
    sendEmailCode,
    allUser,
    allInvestment,
    setAdminInvest
} = require('../controller/admin');
const { validateEmail, validatePassword, validateConfirmPassword, validateEmailOrMobile } = require('../utils/middleware');

const router = express.Router();

router.post("/varifie/forget-password", validateEmail, verifyForgetPassword);
router.post("/admin/signin", loginUser);
router.post("/forget-password", validateEmail, forgetPassword);
router.post("/send-mail", validateEmail, sendEmailCode);
router.post("/reset-password", validatePassword, resetPassword); 
router.post("/set-password", validatePassword, updateNewPassword);
router.post("/set-auth-google", setGoogleAuth);
router.post("/set-auth-google-otp", setGoogleAuthOTP);
router.post("/get-auth-google", getGoogleAuth); 
router.post("/get-auth-google-new", getGoogleAuthNew);
router.post("/get-auth-google-setting", getGoogleAuthFromUserId); 
router.post("/send-mobile-varification-otp", sendMobileVarificationOtp);
router.post("/send-mobile-varification-otp-email", sendMobileVarificationOtWithEmail);
router.post("/varifie/mobile", varifieMobile);
router.post("/varifie/mobile-login", validateEmail, varifieMobileLogin);
router.post("/varifie/mobile-Withdraw", varifieMobileWithdrawOTP);
router.post("/check_user_status", check_user_status);
router.post("/varifie/email-Withdraw", varifieEmailWithdrawOTP);
router.post("/send_email_verification_code", validateEmail, sendEmailVerificationCode )
router.post("/send_mobile_verificaton_code", sendMobileVerificationCode)
router.post("/verify_otp", validateEmailOrMobile, verifyUserOTP);

router.post("/modify_user_profile", modifyUserProfile);
router.post("/permanent_delete_user", permanentDeleteUser);
router.post("/allusers", allUser);
router.post("/allinvestment", allInvestment);
router.post("/set-admin-invest", setAdminInvest);
module.exports = router;