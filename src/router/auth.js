const express = require('express');
const {
    registerUser,
    verifyUserEmail,
    loginUser,
    resendOtp,
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
    registerNewUser,
    getGoogleAuthNew,
    sendEmailCode
} = require('../controller/auth');
const { validateEmail, validatePassword, validateConfirmPassword, validateEmailOrMobile } = require('../utils/middleware');

const router = express.Router();

router.post("/register-user", validateEmail, validatePassword, validateConfirmPassword, registerUser);
router.post("/register_new_user", validatePassword, validateConfirmPassword, registerNewUser);
router.post("/varifie/email", verifyUserEmail);
router.post("/varifie/forget-password", validateEmail, verifyForgetPassword);
router.post("/login", loginUser);
router.post("/forget-password", validateEmail, forgetPassword);
router.post("/send-mail", validateEmail, sendEmailCode);
router.post("/resend-otp", resendOtp);
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
module.exports = router;