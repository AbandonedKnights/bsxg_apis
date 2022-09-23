const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {
  generateOTP,
  compareHash,
  distributeReferal,
  toFixed,
  generateReferalCode
} = require("../utils/functions");
const {
  createNewUser,
  isUserExist,
  setEmailOtp,
  checkPassword,
  updateUserPassword,
  getUserIdFromEmail,
  checkUser,
  addNewUser,
} = require("../utils/functions.users");

const { validateUserId } = require("../utils/validator");
const { getPromoter, checkParentCode } = require("../helpers/helpers");

async function registerNewUser(req, res) {
  try {
    const {
      email,
      name,
      password,
      confirm_password,
      employee,
      mobile_number,
      admin_permission,
      parent_ref_code
    } = req.body;
    //console.log(password !== confirm_password);
    if (password !== confirm_password) {
      return res.status(400).json({
        message: "password and confirm password must be same",
      });
    }
    /**
     * checking if user is already existing or not
     *  2   : exist and verified
     *  1   : exist and not verified
     *  0   : not exist
     * -1   : something went wrong
     * -2   : please provide email
     */
    const userStatusCodes = {
      "-2": "Please provide email!",
      "-1": "Something went wrong, please try again!",
      1: "Email already exist, but email is not verified!",
      2: "Email already exist!",
    };
    /* const userStatus = await isUserExist(email);
    if (userStatusCodes[userStatus]) {
      return res.status(400).json({ message: userStatusCodes[userStatus] });
    } */
    if (parent_ref_code) {
      const promoterID = await checkParentCode(parent_ref_code);
      if (promoterID) {
        let newUser = await addNewUser({ email, name, mobile_number, password, parent_ref_code });
        console.log("new user :: ", newUser);
        if (!newUser) {
          return res.status(400).json({
            message: "Something went wrong!",
          });
        } else {
          if (employee) {
            await User.updateOne(
              { user_id: newUser.user_id },
              {
                $set: {
                  user_role: 1, // for employee
                  is_email_verified: 1,
                  mobile_number: mobile_number,
                  ask_login_otp: 1,
                  admin_permission: admin_permission,
                },
              }
            );
          } else {
            const Wallets = require("../models/wallets");
            const user_wallet = await Wallets.findOne({
              user: newUser.user_id,
              wallet_type: "BSXG",
            });
            if (user_wallet && user_wallet.wallet_address) {
              console.log("Allready created!");
            } else {
              
              const { createUserWallets } = require("../utils/function.wallets");
              const iscreated = await createUserWallets(newUser.user_id);
              if (iscreated) {
                console.log("Wallets Created!");
                // await generateReferalCode(newUser.user_id);
                // await distributeReferal(user_id);
              } else console.log("Wallets couldn't");
            }

          }
        }
        return res.status(200).json({
          params: {
            user_id: newUser.user_id,
            email:newUser.email,
            name:newUser.name,
            reffral_code:newUser.parent_ref_code,
            ev: false,
          },
          message: "Congratulations, registration successful.",
        });
      } else {
        return res.status(400).json({ message: "Please provide valid sponsor id." });
      }

    } else {
      return res.status(400).json({ message: "Please provide valid sponsor id." });
    }

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function registerUser(req, res) {
  const { sendOTP } = require("../utils/mailer");
  try {
    const {
      email,
      password,
      confirm_password,
      employee,
      mobile_number,
      admin_permission,
    } = req.body;
    const parent_ref_code = req.body
      ? req.body.parent_ref_code
        ? req.body.parent_ref_code
        : ""
      : "";
    console.log(password !== confirm_password);
    if (password !== confirm_password) {
      return res.status(400).json({
        message: "password and confirm password must be same",
      });
    }
    /**
     * generating otp for the user
     */
    const otp = generateOTP();
    if (!otp) {
      return res.status(400).json({
        message: "Something went wrong!",
      });
    }
    /**
     * checking if user is already existing or not
     *  2   : exist and verified
     *  1   : exist and not verified
     *  0   : not exist
     * -1   : something went wrong
     * -2   : please provide email
     */
    const user_status = await isUserExist(email);
    if (user_status == -2) {
      return res.status(400).json({
        message: "Please provide email!",
      });
    }
    if (user_status == -1) {
      return res.status(400).json({
        message: "Something went wrong, please try again!",
      });
    }
    if (user_status == 1) {
      return res.status(400).json({
        user_status: user_status,
        params: {
          ev: false,
        }, // nv: stands for not varified
        message: "Email already exist, but email is not verified!",
      });
    }
    if (user_status == 2) {
      return res.status(400).json({
        user_status: user_status,
        message: "Email already exist!",
      });
    }
    /**
     * storing user in db and its related otp
     */
    const user_id = await createNewUser(
      email,
      password,
      parent_ref_code,
      otp,
      employee
    );
    if (!user_id) {
      return res.status(400).json({
        message: "Something went wrong!",
      });
    } else {
      if (employee) {
        await User.updateOne(
          { user_id: user_id },
          {
            $set: {
              user_role: 1, // for employee
              is_email_verified: 1,
              mobile_number: mobile_number,
              ask_login_otp: 1,
              admin_permission: admin_permission,
            },
          }
        );
      }
    }
    /**
     * sending otp on the email of the user
     */
    sendOTP(email, otp);
    return res.json({
      status: 200,
      error: false,
      params: {
        user_id: user_id,
        ev: false,
      },
      message: "User is rugistered and varification otp sent to his mail",
    });
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>registerUser: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
}

async function sendEmailVerificationCode(req, res) {
  try {
    const { sendOTPinrx } = require("../utils/mailer");
    const { email, mobile } = req.body;
    const userStatusCodes = {
      "-2": "Please provide email!",
      "-1": "Something went wrong, please try again!",
      1: "Email already exist, but email is not verified!",
      2: "This email is already registered with an account. Try another one.",
    };
    const userStatus = await isUserExist(email);
    if (userStatusCodes[userStatus]) {
      return res.status(400).json({ message: userStatusCodes[userStatus] });
    } else {
      let otp = generateOTP();
      if (!otp) {
        return res.status(400).json({
          message: "Something went wrong!",
        });
      }
      let otpModel = require("../models/otp_verification");
      await otpModel.create({ email, mobile, otp: otp + "_" + Date.now() });
      if (email) {
        sendOTPinrx(email, otp);
      } else if (mobile) {
      }

      return res.status(200).json({
        message:
          "A email verification code has been sent to your email address.",
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function sendMobileVerificationCode(req, res) {
  try {
    //const { sendOTPinrx } = require("../utils/mailer");
    const { mobile } = req.body;
    if (mobile && mobile.length == 10) {
      const userStatusCodes = {
        "-2": "Please provide mobile number!",
        "-1": "Something went wrong, please try again!",
        1: "Mobile number already exist, but not verified!",
        2: "Mobile number already exist!",
      };
      const userStatus = await checkUser({ mobile_number: mobile });
      if (userStatusCodes[userStatus]) {
        return res.status(400).json({ message: userStatusCodes[userStatus] });
      } else {
        let otp = generateOTP();
        if (!otp) {
          return res.status(400).json({
            message: "Something went wrong!",
          });
        }
        let otpModel = require("../models/otp_verification");
        await otpModel.create({ mobile, otp: otp + "_" + Date.now() });
        const fetch = require("cross-fetch");
        await fetch(
          `https://2factor.in/API/V1/87802cca-1c48-11ec-a13b-0200cd936042/SMS/${mobile}/${otp}`
        );

        return res.status(200).json({
          message: "A verification code has been sent to your mobile number.",
        });
      }
    } else {
      return res.status(400).json({ message: "Enter valid mobile number." });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function verifyUserOTP(req, res) {
  try {
    const { email, otp } = req.body;
    const otpModel = require("../models/otp_verification");
    if (otp) {
      let lastOTPData = await otpModel
        .findOne({
          email: email,
          is_otp_verified: false,
          otp: { $regex: `^${otp}_`, $options: "i" },
        })
        .sort({ createdAt: -1 });
      if (lastOTPData) {
        const [sentOTP, time] = lastOTPData.otp.split("_");
        const currentTime = Date.now();
        const isOTPExpired = currentTime - time > 1000 * 60 * 10;
        if (isOTPExpired) {
          res.status(400).json({
            message: "OTP verification failed. OTP has been exprired.",
          });
        } else {
          if (sentOTP == otp) {
            await otpModel.updateOne(
              { _id: lastOTPData._id },
              { $set: { is_otp_verified: true } }
            );
            res.status(200).json({ message: "OTP verified successfully." });
          } else {
            res.status(400).json({
              message: "OTP verification failed. OTP does not match.",
            });
          }
        }
      } else {
        res
          .status(400)
          .json({ message: "OTP Verification failed. Invalid OTP provided." });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function verifyUserEmail(req, res) {
  const { verifyOTP } = require("../utils/validator");
  const { createUserWallets } = require("../utils/function.wallets");
  const Wallets = require("../models/wallets");
  const OtpBuffer = require("../models/otp_buffer");
  const User = require("../models/user");
  const OTP_LENGTH = 6;
  try {
    const { user_id, otp } = req.body;
    if (user_id && otp && otp.toString().length == OTP_LENGTH) {
      const user_status = await validateUserId(user_id);
      if (user_status) {
        const otp_object = await OtpBuffer.findOne({ user_id: user_id });
        if (otp_object) {
          if (otp_object.email_otp) {
            if (verifyOTP(otp_object.email_otp, otp)) {
              await OtpBuffer.updateOne(
                { user_id: user_id },
                {
                  $set: {
                    email_otp: null,
                  },
                }
              );
              await User.updateOne(
                { user_id: user_id },
                {
                  $set: {
                    is_email_verified: 1,
                  },
                }
              );
              const user_wallet = await Wallets.findOne({
                user: user_id,
                wallet_type: "INR",
              });
              console.log("user_wallet", user_wallet)
              if (user_wallet && user_wallet.wallet_address) {
                console.log("Allready created!");
              } else {
                /**
                 * address creation
                 */
                const iscreated = await createUserWallets(user_id);
                if (iscreated) {
                  console.log("Wallets Created!");
                  /**
                   * distribute
                   *
                   */
                  // await distributeReferal(user_id);
                } else console.log("Wallets couldn't");
              }

              return res.json({
                status: 200,
                error: false,
                params: {
                  ev: true,
                  user_id: user_id,
                },
                message: "OTP verified",
              });
            } else {
              return res.status(400).json({
                message: "Invalid OTP*",
              });
            }
          } else {
            return res.status(400).json({
              message: "Invalid OTP",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid Request",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid request",
        });
      }
    } else {
      /* return res.status(400).json({
                message: "Invalid OTP",
            }); */
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserEmail: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}
async function verifyForgetPassword(req, res) {
  const { verifyOTP } = require("../utils/validator");
  const { createUserWallets } = require("../utils/function.wallets");
  const Wallets = require("../models/wallets");
  const OtpBuffer = require("../models/otp_buffer");
  const User = require("../models/user");
  const OTP_LENGTH = 6;
  try {
    const { email, otp } = req.body;
    if (email && otp && otp.toString().length == OTP_LENGTH) {
      const otp_object = await OtpBuffer.findOne({ email: email });
      if (otp_object) {
        if (otp_object.email_otp) {
          if (verifyOTP(otp_object.email_otp, otp)) {
            await OtpBuffer.updateOne(
              { email: email },
              {
                $set: {
                  email_otp: null,
                },
              }
            );
            await User.updateOne(
              { email: email },
              {
                $set: {
                  is_email_verified: true,
                },
              }
            );
            const user_id = await getUserIdFromEmail(email);
            const user_wallet = await Wallets.findOne({
              user: user_id,
              wallet_type: "BTC",
            });
            if (user_wallet && user_wallet.wallet_address) {
              console.log("Allready created!");
            } else {
              /**
               * adress creator
               */
              const iscreated = await createUserWallets(user_id);
              if (iscreated) console.log("Wallets Created!");
              else console.log("Wallets couldn't");
            }
            return res.json({
              status: 200,
              error: false,
              params: {
                access_token: user_id,
              },
              message: "OTP verified",
            });
          } else {
            return res.status(400).json({
              message: "Invalid OTP",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid Request",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserEmail: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}
async function resendOtp(req, res) {
  const { sendOTP } = require("../utils/mailer");
  const { getEmailFromUserId } = require("../utils/functions.users");
  try {
    const { user_id } = req.body;
    // console.log("Hi", user_id);
    if (user_id) {
      // generate new otp
      const otp = generateOTP();
      if (!otp) {
        return res.status(400).json({
          message: "Something went wrong!",
        });
      }
      // set it to database
      const email = await getEmailFromUserId(user_id);
      if (email) {
        const otp_status = await setEmailOtp({ user_id, otp });
        if (otp_status) {
          // send as mail
          sendOTP(email, otp);
          return res.json({
            status: 200,
            error: false,
            message: "Email sent successfully",
          });
        } else {
          return res.status(400).json({
            message: "Something went wrong",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid Request",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>suth.js>resendOtp: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
}
async function loginUser(req, res) {
  const User = require("../models/user");
  try {
    const { email, mobile, user_id, password, otp } = req.body;
    const params = [];
    if (email) {
      params.push({ email: email });
    }
    if (mobile) {
      params.push({ mobile_number: mobile });
    }
    if (user_id) {
      params.push({ user_id: user_id });
    }
    if (password) {
      //const user_data = await User.findOne({ email: email });
      const user_data = await User.findOne({ $or: params })
      if (user_data) {
        /**
         * need to write logic
         */
        const isfound = await compareHash(
          user_data.hashedPassword ? user_data.hashedPassword : "",
          password
        );
        if (isfound) {
          if (user_data.authenticator == 2) {
            if (!otp) {
              return res.status(400).json({
                message: "Your Google Authenticator On Please Enter The OTP",
              });
            }
            const speakeasy = require("speakeasy-latest");
            const { base32: secret } = user_data.secret_key;
            var tokenValidates = speakeasy.totp.verify({
              secret: secret,
              encoding: "base32",
              token: otp,
              window: 6,
            });
            if (tokenValidates) {
              return res.status(200).json({
                status: 200,
                error: false,
                params: {
                  role: user_data.user_role ? user_data.user_role : 0,
                  ev: user_data.is_email_verified
                    ? user_data.is_email_verified
                    : false,
                  ask_login_otp: user_data.ask_login_otp,
                  mobile_no: user_data.mobile_number ? user_data.mobile_number : 0,
                  user_id: user_data.user_id ? user_data.user_id : undefined,
                },
                message: "Login successfully!",
              });
            } else {
              return res.status(400).json({
                message: "Invalid OTP",
              });
            }
          } else if (user_data.authenticator == 1) {
            const { verifyOTP } = require("../utils/validator");
            const OtpBuffer = require("../models/otp_buffer");
            const OTP_LENGTH = 6;
            try {
              if (email && otp && otp.toString().length == OTP_LENGTH) {
                const otp_object = await OtpBuffer.findOne({ email: email });
                if (verifyOTP(otp_object.mobile_otp, otp)) {
                  await OtpBuffer.updateOne(
                    { email: email },
                    {
                      $set: {
                        mobile_otp: null,
                      },
                    }
                  );
                  return res.status(200).json({
                    status: 200,
                    error: false,
                    params: {
                      role: user_data.user_role ? user_data.user_role : 0,
                      ev: user_data.is_email_verified
                        ? user_data.is_email_verified
                        : false,
                      ask_login_otp: user_data.ask_login_otp,
                      mobile_no: user_data.mobile_number ? user_data.mobile_number : 0,
                      user_id: user_data.user_id ? user_data.user_id : undefined,
                    },
                    message: "Login successfully!",
                  });
                } else {
                  return res.status(400).json({
                    message: "Invalid OTP",
                  });
                }
              } else {
                return res.status(400).json({
                  message: "Your Mobile Authenticator On Please Enter The OTP",
                });
              }
            } catch (error) {
              console.log(
                "Error: from: src>controller>auth.js>loginUser: ",
                error.message
              );
              return res.status(400).json({
                message: "Something went wrong, please try again!",
              });
            }
          } else {
            return res.status(200).json({
              status: 200,
              error: false,
              params: {
                role: user_data.user_role ? user_data.user_role : 0,
                ev: user_data.is_email_verified
                  ? user_data.is_email_verified
                  : false,
                ask_login_otp: user_data.ask_login_otp,
                mobile_no: user_data.mobile_number ? user_data.mobile_number : 0,
                user_id: user_data.user_id ? user_data.user_id : undefined,
              },
              message: "Login successfully!",
            });
          }
        } else {
          return res
            .status(400)
            .json({ message: "Username or password not found" });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Username or password not found" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Username or password not found" });
    }
  } catch (error) {
    console.log(
      "Error: from: controller>auth.js>loginUser: ",
      error.message,
      error
    );
    return res
      .status(400)
      .json({ message: "Something went wrong, please try again" });
  }
}

async function resetPassword(req, res) {
  const { sendOTP } = require("../utils/mailer");
  try {
    const { user_id, last_password, password, confirm_password } = req.body;
    if (!user_id) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
    if (password !== confirm_password) {
      return res.status(400).json({
        message: "password and confirm password must be same",
      });
    }
    /**
             * generating otp for the user
             
            const otp = generateOTP();
            if (!otp) {
                return res.status(400).json({
                    message: "Something went wrong!"
                })
            }*/

    const isValidPassword = await checkPassword(user_id, last_password);
    if (isValidPassword) {
      const status = await updateUserPassword(user_id, password);
      if (status) {
        return res.json({
          status: 200,
          error: false,
          message: "Password changed successfully",
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong, please try again",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid last password",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>registerUser: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong!",
    });
  }
}
async function forgetPassword(req, res) {
  const { sendOTP } = require("../utils/mailer");
  try {
    const { email } = req.body;
    if (email) {
      if ((await isUserExist(email)) == 0) {
        return res
          .status(400)
          .json({ message: "Pleasse enter registered email address." });
      } else {
        // generate new otp
        const otp = generateOTP();
        if (!otp) {
          return res.status(400).json({
            message: "Something went wrong!",
          });
        }
        // set it to database
        if (email) {
          const otp_status = await setEmailOtp({ email, otp });
          if (otp_status) {
            // send as mail
            sendOTP(email, otp);
            return res.json({
              status: 200,
              error: false,
              message: "Email sent successfully",
            });
          } else {
            return res.status(400).json({
              message: "Something went wrong",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid Request",
          });
        }
      }
    } else {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>suth.js>forgetPassword: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
}

async function sendEmailCode(req, res) {
  const { sendOTP } = require("../utils/mailer");
  try {
    const { user_id, email } = req.body;
    if (validateUserId(user_id) && email) {
      // generate new otp
      const otp = generateOTP();
      if (!otp) {
        return res.status(400).json({
          message: "Something went wrong!",
        });
      }
      // set it to database
      if (email) {
        const otp_status = await setEmailOtp({ email, otp, user_id });
        if (otp_status) {
          // send as mail
          sendOTP(email, otp);
          await User.updateOne({ user_id: user_id }, {
            $set: {
              email: email
            }
          })
          return res.json({
            status: 200,
            error: false,
            message: "Email sent successfully",
          });
        } else {
          return res.status(400).json({
            message: "Something went wrong",
          });
        }
      } else {
        return res.status(400).json({
          message: "Please Enter Email!",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>suth.js>sendEmailCode: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
}

async function updateNewPassword(req, res) {
  try {
    const { access_token, password, confirm_password } = req.body;
    const user_id = access_token;
    if (user_id) {
      if (password !== confirm_password) {
        return res.status(400).json({
          message: "password and confirm password must be same",
        });
      }
      const status = await updateUserPassword(user_id, password);
      if (status) {
        return res.json({
          status: 200,
          error: false,
          params: {
            user_id: user_id,
          },
          message: "Password changed successfully",
        });
      } else {
        return res.status(400).json({
          message: "Something went wrong, please try again",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
  } catch (error) {
    console.log("Error: from: src>controller>auth.js: ", error.message);
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}

async function setGoogleAuth(req, res) {
  const User = require("../models/user");
  const { validateUserId } = require("../utils/validator");
  try {

    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      const speakeasy = require("speakeasy-latest");
      var secret = speakeasy.generateSecret({ length: 20, name: 'BSXG' });

      if (secret) {
        await User.updateOne(
          { user_id: user_id },
          {
            $set: {
              secret_key: secret
            },
          }
        );
        return res.json({
          status: 200,
          error: false,
          secret,
          message: "update",
        });
      } else {
        return res.status(400).json({
          mesage: "Invalid arguments*",
        });
      }
    } else {
      return res.status(400).json({
        mesage: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>setGoogleAuth: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}

async function setGoogleAuthOTP(req, res) {
  const User = require("../models/user");
  const { validateUserId } = require("../utils/validator");
  try {
    const { user_id, status, otp, action } = req.body;
    const user_data = await User.findOne({ user_id: user_id });
    if (user_data && validateUserId(user_id)) {
      if (action == 'g' && otp) {
        const speakeasy = require("speakeasy-latest");
        const { base32: secret } = user_data.secret_key;
        var tokenValidates = speakeasy.totp.verify({
          secret: secret,
          encoding: "base32",
          token: otp,
          window: 6,
        });
        if (tokenValidates) {
          await User.updateOne(
            { _id: user_data._id },
            {
              $set: {
                authenticator: status,
              },
            }
          );
          return res.json({
            status: 200,
            error: false,
            message: "Successfully updated",
          });

        } else {
          return res.json({
            status: 400,
            error: true,
            message: "Not Updated",
          });
        }
      } else if (action == 'm') {
        if (user_data.is_mobile_verified && user_data.mobile_number) {
          await User.updateOne(
            { _id: user_data._id },
            {
              $set: {
                authenticator: status,
              },
            }
          );
          return res.json({
            status: 200,
            error: false,
            message: "Successfully updated",
          });
        } else {
          return res.json({
            status: 400,
            error: true,
            message: "first mobile update",
          });
        }
      } else {
        await User.updateOne(
          { _id: user_data._id },
          {
            $set: {
              authenticator: status,
            },
          }
        );
        return res.json({
          status: 200,
          error: false,
          message: "Successfully updated",
        });
      }
    } else {
      return res.status(400).json({
        mesage: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>setGoogleAuthOTP: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}
async function getGoogleAuth(req, res) {
  const User = require("../models/user");
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user_data = await User.findOne({ email: email });
      if (user_data) {
        let data = {};
        if (user_data.authenticator == 2) {
          data.authenticator_key = user_data.secret_key
            ? user_data.secret_key
            : "";
        } else if (user_data.authenticator == 1) {
          data.mobile_no = user_data.mobile_number
            ? user_data.mobile_number
            : "";
        }
        data.authenticator_status = user_data.authenticator
          ? user_data.authenticator
          : 0;
        return res.json({
          status: 200,
          error: false,
          params: data,
          message: "Successfully updated",
        });
      } else {
        return res.status(400).json({
          message: "Invalid Request!!",
        });
      }
    } else {
      return res.status(400).json({
        mesage: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserEmail: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}

async function getGoogleAuthNew(req, res) {
  const User = require("../models/user");
  const OtpBuffer = require("../models/otp_buffer");
  const fetch = require("cross-fetch");
  try {
    const { email, mobile, password } = req.body;
    const params = [];
    if (email) {
      params.push({ email: email });
    }
    if (mobile) {
      params.push({ mobile_number: mobile });
    }
    if (password) {
      //const user_data = await User.findOne({ email: email });
      const user_data = await User.findOne({ $or: params })
      if (user_data) {
        if (user_data.authenticator == 1) {
          if (email && user_data.mobile_number) {
            const otp = generateOTP();
            if (otp && isNaN(parseInt(otp)) == false) {
              await fetch(
                `https://2factor.in/API/V1/87802cca-1c48-11ec-a13b-0200cd936042/SMS/${user_data.mobile_number}/${otp}`
              );
              await OtpBuffer.updateOne(
                { email: email },
                {
                  $set: {
                    mobile_otp: otp + "_" + Date.now(),
                  },
                }
              );
              return res.json({
                status: 200,
                error: false,
                authenticator_status: user_data.authenticator ? user_data.authenticator : 0,
                message: "OTP Send",
              });

            } else {
              return res.json({
                status: 400,
                error: true,
                message: "Somthing Went Wrong!",
              });
            }
          } else {
            return res.json({
              status: 400,
              error: true,
              message: "Invalid Request",
            });
          }
        }
        return res.json({
          status: 200,
          error: false,
          authenticator_status: user_data.authenticator ? user_data.authenticator : 0,
          message: "success",
        });
      } else {
        return res.status(400).json({
          message: "Invalid Request!!",
        });
      }
    } else {
      return res.status(400).json({
        mesage: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserEmail: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}


async function getGoogleAuthFromUserId(req, res) {
  const User = require("../models/user");
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      const user_data = await User.findOne({ user_id: user_id });
      if (user_data) {
        let data = {};
        data.authenticator_status = user_data.authenticator
          ? user_data.authenticator
          : 0;
        data.authenticator_key = user_data.secret_key
          ? user_data.secret_key
          : "";
        return res.json({
          status: 200,
          error: false,
          params: data,
          message: "Successfully updated",
        });
      } else {
        return res.status(400).json({
          message: "Invalid Request!!",
        });
      }
    } else {
      return res.status(400).json({
        mesage: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserEmail: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}
async function check_user_status(req, res) {
  const User = require("../models/user");
  const { validateUserId } = require("../utils/validator");
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      const user_data = await User.findOne({ user_id: user_id });
      if (user_data) {
        return res.json({
          status: 200,
          error: false,
          params: {
            is_mobile: user_data.is_mobile_verified,
          },
          message: "Successfully updated",
        });
      } else {
        return res.status(400).json({
          message: "Invalid Request!!",
        });
      }
    } else {
      return res.status(400).json({
        mesage: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserEmail: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}

async function sendMobileVarificationOtp(req, res) {
  const OtpBuffer = require("../models/otp_buffer");
  const fetch = require("cross-fetch");
  try {
    const { user_id, mobile_no } = req.body;
    if (user_id && validateUserId(user_id)) {
      if (mobile_no) {
        const otp = generateOTP();
        if (otp && isNaN(parseInt(otp)) == false) {
          const user_otp_obj = await OtpBuffer.findOne({ user_id: user_id });
          if (user_otp_obj) {
            await fetch(
              `https://2factor.in/API/V1/87802cca-1c48-11ec-a13b-0200cd936042/SMS/${mobile_no}/${otp}`
            );
            await User.updateOne(
              { user_id: user_id },
              {
                $set: {
                  mobile_number: mobile_no,
                },
              }
            );
            await OtpBuffer.updateOne(
              { user_id: user_id },
              {
                $set: {
                  mobile_otp: otp + "_" + Date.now(),
                },
              }
            );
            return res.json({
              status: 200,
              error: false,
              message: "Otp sent",
            });
          } else {
            return res.status(400).json({
              message: "You must varifie email first",
            });
          }
        } else {
          return res.status(400).json({
            message: "Something went wrong, please try again",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid Request",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong, please try again",
    });
  }
}

async function sendMobileVarificationOtWithEmail(req, res) {
  const OtpBuffer = require("../models/otp_buffer");
  const fetch = require("cross-fetch");
  try {
    const { email, mobile_no } = req.body;
    // if (user_id && validateUserId(user_id)) {
    if (email && mobile_no) {
      const otp = generateOTP();
      if (otp && isNaN(parseInt(otp)) == false) {
        const user_otp_obj = await OtpBuffer.findOne({ email: email });
        if (user_otp_obj) {
          await fetch(
            `https://2factor.in/API/V1/87802cca-1c48-11ec-a13b-0200cd936042/SMS/${mobile_no}/${otp}`
          );
          await OtpBuffer.updateOne(
            { email: email },
            {
              $set: {
                mobile_otp: otp + "_" + Date.now(),
              },
            }
          );
          return res.json({
            status: 200,
            error: false,
            message: "Otp sent",
          });
        } else {
          return res.status(400).json({
            message: "You must varifie email first",
          });
        }
      } else {
        return res.status(400).json({
          message: "Something went wrong, please try again",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
    // } else {
    //   return res.json({
    //     status: 400,
    //     error: true,
    //     message: "Invalid Request"
    //   })
    // }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong, please try again",
    });
  }
}

async function varifieMobile(req, res) {
  const { verifyOTP } = require("../utils/validator");
  const OtpBuffer = require("../models/otp_buffer");
  const User = require("../models/user");
  const OTP_LENGTH = 6;
  try {
    const { user_id, otp } = req.body;
    if (user_id && otp && otp.toString().length == OTP_LENGTH) {
      const user_status = await validateUserId(user_id);
      if (user_status) {
        const otp_object = await OtpBuffer.findOne({ user_id: user_id });
        if (otp_object) {
          if (otp_object.mobile_otp) {
            if (verifyOTP(otp_object.mobile_otp, otp)) {
              await OtpBuffer.updateOne(
                { user_id: user_id },
                {
                  $set: {
                    mobile_otp: null,
                  },
                }
              );
              await User.updateOne(
                { user_id: user_id },
                {
                  $set: {
                    is_mobile_verified: 1,
                  },
                }
              );
              return res.json({
                status: 200,
                error: false,
                message: "OTP verified",
              });
            } else {
              return res.status(400).json({
                message: "Invalid OTP",
              });
            }
          } else {
            return res.status(400).json({
              message: "Invalid OTP",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid Request",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid request",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserMobile: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}

async function varifieMobileWithdrawOTP(req, res) {
  const { verifyOTP } = require("../utils/validator");
  const OtpBuffer = require("../models/otp_buffer");
  const withdrawHistory = require("../models/withdraw_history");
  const { sendWithdrawLink, sendWithdrawOTP } = require("../utils/mailer");
  const OTP_LENGTH = 6;
  try {
    const { user_id, otp, transection_id } = req.body;
    if (user_id && otp && otp.toString().length == OTP_LENGTH) {
      const user_status = await validateUserId(user_id);
      if (user_status) {
        const otp_object = await OtpBuffer.findOne({ user_id: user_id });
        if (otp_object) {
          if (otp_object.mobile_otp) {
            if (verifyOTP(otp_object.mobile_otp, otp, 2)) {
              const Withdraw_history = await withdrawHistory.findOne({
                user_id: user_id,
                status: 0,
                transection_id: transection_id,
              });
              if (Withdraw_history) {
                await OtpBuffer.updateOne(
                  { user_id: user_id },
                  {
                    $set: {
                      mobile_otp: null,
                    },
                  }
                );
                /**
                 * Status:3 means otp verified and send mail
                 */
                await withdrawHistory.updateOne(
                  {
                    user_id: user_id,
                    status: 0,
                    transection_id: transection_id,
                  },
                  {
                    $set: {
                      status: 2,
                      otp_varified: true,
                    },
                  }
                );
                if (Withdraw_history.symbol.toUpperCase() == "INR") {
                  sendWithdrawLink(
                    Withdraw_history.email,
                    transection_id,
                    Withdraw_history.amount,
                    Withdraw_history.symbol,
                    "",
                    Withdraw_history.remark,
                    2
                  );
                  return res.json({
                    status: 200,
                    error: false,
                    message: "OTP varified",
                  });
                } else {
                  const otp = generateOTP();
                  if (otp) {
                    /**
                     * update user balance && create transaction history
                     */
                    if (setEmailOtp({ user_id: user_id, otp: otp })) {
                      /**
                       * send otp then return success responce
                       */
                      sendWithdrawOTP(
                        Withdraw_history.email,
                        otp,
                        Withdraw_history.amount,
                        Withdraw_history.symbol,
                        Withdraw_history.to_address,
                        Withdraw_history.remark,
                        1
                      );
                      return res.json({
                        status: 200,
                        error: false,
                        message: "OTP Send Successfully!",
                      });
                    } else {
                      return res.status(400).json({
                        message: "Something went wrong, please try again!",
                      });
                    }
                  } else {
                    return res.status(400).json({
                      message: "Something went wrong, please try again!",
                    });
                  }
                }
              } else {
                return res.status(400).json({
                  message: "Not a valid User!!",
                });
              }
            } else {
              return res.status(400).json({
                message: "Invalid OTP",
              });
            }
          } else {
            return res.status(400).json({
              message: "Invalid OTP",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid Request",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid request",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>varifieMobileWithdrawOTP: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}
/**
 *  } else if(wallet_data.wallet_type == 'USDT'){
                                   console.log("USDT");
                                     tronWeb.setAddress(hot_wallet.wallet_address);
                                       try {
                                           let usdtcontract = await tronWeb.contract().at("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");//currency_info.contract_address
                                           //Creates an unsigned TRX transfer transaction
                                           const usdtreceipt = await usdtcontract.transfer(
                                               Withdraw_history.to_address,
                                               (total_final_amt * 1e6)
                                           ).send({
                                               feeLimit: 10000000
                                           }, hot_wallet.private_key);
                                           if(usdtreceipt) {
                                               const usdtnew_balance = parseFloat(wallet_data.balance)-amount;
                                               //  console.log("final_amount", new_balance);
                                                   await Wallets.updateOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()},{
                                                   $set: {
                                                       balance: usdtnew_balance,
                                                   },
                                                   })
                                               await HotWallet.updateOne({wallet_type:wallet_type.toUpperCase()}, {
                                                   $set: {
                                                       total_funds: parseFloat(hot_wallet.total_funds)-total_final_amt,
                                                   },
                                               })
                                               await OtpBuffer.updateOne(
                                                { user_id: user_id },
                                                {
                                                  $set: {
                                                    email_otp: null,
                                                  },
                                                }
                                              );
                                               WithdrawHistory.updateOne({transection_id:transection_id},{
                                                       $set: {
                                                           tx_id:usdtreceipt.txid,
                                                           status: 1,
                                                       },
                                               }).then(()=>{
                                                   return res.json({
                                                       status:200,
                                                       error:false,
                                                       message:"USDT WITHDRAWAL SUCCESSFULLY!"
                                                   });
                                               }).catch(() =>{
                                                   return res.json({
                                                       status:400,
                                                       error:true,
                                                       message:"USDT NOT Withdraw!!"
                                                   });
                                               })
                                           } else {
                                               WithdrawHistory.updateOne({transection_id:transection_id},{
                                                   $set: {
                                                       status: -2,
                                                   },
                                               }).then(()=>{
                                                   return res.json({
                                                       status:400,
                                                       error:true,
                                                       message:"data fetch!!"
                                                   });
                                               });
                                           }
                                       } catch (error) {
                                           console.log("Error from usdt: ", error.message);
                                       }
                               }
 */

async function varifieEmailWithdrawOTP(req, res) {
  const Web3 = require("web3");
  const TronWeb = require("tronweb");
  const web3 = new Web3("https://bsc-dataseed4.binance.org/");
  //const web3 = new Web3("https://data-seed-prebsc-1-s2.binance.org:8545/");
  // const web3Eth = new Web3("https://mainnet.infura.io/v3/d5bcba9decc042879125ca752dc4637b");
  const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",
  });
  const eth_mainnet =
    "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
  const web3Provider = new Web3.providers.HttpProvider(eth_mainnet);
  const web3Eth = new Web3(web3Provider);
  const HotWallet = require("../models/wallet_hot");
  const SupportedCurrency = require("../models/suppoted_currency");
  const Wallets = require("../models/wallets");
  const { verifyOTP } = require("../utils/validator");
  const OtpBuffer = require("../models/otp_buffer");
  const WithdrawHistory = require("../models/withdraw_history");
  const OTP_LENGTH = 6;
  try {
    const { user_id, otp, transection_id } = req.body;
    if (user_id && otp && otp.toString().length == OTP_LENGTH) {
      const user_status = await validateUserId(user_id);
      if (user_status) {
        const otp_object = await OtpBuffer.findOne({ user_id: user_id });
        if (otp_object) {
          if (otp_object.email_otp) {
            if (verifyOTP(otp_object.email_otp, otp, 3)) {
              const Withdraw_history = await WithdrawHistory.findOne({
                user_id: user_id,
                status: 2,
                transection_id: transection_id,
              });
              if (
                Withdraw_history &&
                Withdraw_history.symbol &&
                Withdraw_history.amount
              ) {
                await WithdrawHistory.updateOne(
                  { transection_id: transection_id, status: 2 },
                  {
                    $set: {
                      status: 5,
                    },
                  }
                );
                const wallet_type = Withdraw_history.symbol
                  ? Withdraw_history.symbol
                  : "";
                let amount = Withdraw_history.amount
                  ? parseFloat(Withdraw_history.amount)
                  : 0;
                const currency_info = await SupportedCurrency.findOne({
                  symbol: wallet_type.toUpperCase(),
                });
                if (currency_info) {
                  let withdrawl_fee = currency_info.withdrawal_fee
                    ? parseFloat(currency_info.withdrawal_fee)
                    : 0;
                  const decimal = currency_info.precision
                    ? Number(`1e${currency_info.precision}`)
                    : 0;
                  const wallet_data = await Wallets.findOne({
                    user: Withdraw_history.user_id,
                    wallet_type: wallet_type.toUpperCase(),
                  });
                  if (wallet_data) {
                    let total_available_balance =
                      (wallet_data.balance
                        ? parseFloat(wallet_data.balance)
                        : 0) -
                      (wallet_data.locked ? parseFloat(wallet_data.locked) : 0);
                    // console.log("total_available_balance", total_available_balance);
                    if (
                      total_available_balance > 0 &&
                      total_available_balance >= amount
                    ) {
                      let total_final_amt = amount - withdrawl_fee;
                      // console.log("final_amount", final_amount);
                      /**
                       * check for hotwallet fund
                       */

                      const hot_wallet = await HotWallet.findOne({
                        wallet_type: wallet_type.toUpperCase(),
                      });
                      if (
                        hot_wallet &&
                        hot_wallet.total_funds > 0 &&
                        hot_wallet.total_funds > total_final_amt
                      ) {
                        var abi = [
                          {
                            constant: true,
                            inputs: [{ name: "_owner", type: "address" }],
                            name: "balanceOf",
                            outputs: [{ name: "balance", type: "uint256" }],
                            payable: false,
                            stateMutability: "view",
                            type: "function",
                          },
                          {
                            constant: true,
                            inputs: [],
                            name: "decimals",
                            outputs: [
                              {
                                internalType: "uint8",
                                name: "",
                                type: "uint8",
                              },
                            ],
                            payable: false,
                            stateMutability: "view",
                            type: "function",
                          },
                          {
                            constant: false,
                            inputs: [
                              { name: "_to", type: "address" },
                              { name: "_value", type: "uint256" },
                            ],
                            name: "transfer",
                            outputs: [{ name: "success", type: "bool" }],
                            payable: false,
                            stateMutability: "nonpayable",
                            type: "function",
                          },
                        ];

                        if (wallet_data.wallet_type == "BNB") {
                          const esgas = await web3.eth.estimateGas({
                            to: hot_wallet.wallet_address,
                          });
                          const gasp = await web3.eth.getGasPrice();
                          const createTransaction =
                            await web3.eth.accounts.signTransaction(
                              {
                                from: hot_wallet.wallet_address,
                                to: Withdraw_history.to_address,
                                value: total_final_amt * 1e18 - esgas * gasp,
                                gas: esgas,
                              },
                              hot_wallet.private_key
                            );
                          // Deploy transaction
                          const createReceipt =
                            await web3.eth.sendSignedTransaction(
                              createTransaction.rawTransaction
                            );
                          console.log("bnb transection", createReceipt);
                          if (createReceipt) {
                            const bnbnew_balance =
                              parseFloat(wallet_data.balance) - amount;
                            //  console.log("final_amount", new_balance);
                            await Wallets.updateOne(
                              {
                                user: Withdraw_history.user_id,
                                wallet_type: wallet_type.toUpperCase(),
                              },
                              {
                                $set: {
                                  balance: bnbnew_balance,
                                },
                              }
                            );
                            await HotWallet.updateOne(
                              { wallet_type: wallet_type.toUpperCase() },
                              {
                                $set: {
                                  total_funds:
                                    parseFloat(hot_wallet.total_funds) -
                                    total_final_amt,
                                },
                              }
                            );
                            await OtpBuffer.updateOne(
                              { user_id: user_id },
                              {
                                $set: {
                                  email_otp: null,
                                },
                              }
                            );
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: createReceipt.transactionHash,
                                  blockNumber: createReceipt.blockNumber,
                                  status: 1,
                                },
                              }
                            )
                              .then(() => {
                                return res.json({
                                  status: 200,
                                  error: false,
                                  message:
                                    wallet_data.wallet_type +
                                    " WITHDRAWAL SUCCESSFULLY!",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message:
                                    wallet_data.wallet_type + " NOT Withdraw!!",
                                });
                              });
                          } else {
                            await OtpBuffer.updateOne(
                              { user_id: user_id },
                              {
                                $set: {
                                  email_otp: null,
                                },
                              }
                            );
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  status: -2,
                                },
                              }
                            )
                              .then(() => {
                                return res.status(400).json({
                                  message: "createReceipt not Found **",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message: "createReceipt not Found *",
                                });
                              });
                          }
                        } else if (wallet_data.type == "bep20") {
                          var contract = new web3.eth.Contract(
                            abi,
                            currency_info.contract_address
                          );
                          web3.eth.accounts.wallet.add(hot_wallet.private_key);
                          let decimal = await contract.methods
                            .decimals()
                            .call();
                          decimal = Number(`1e${decimal}`);
                          const amt = toFixed(
                            total_final_amt * decimal
                          ).toString();
                          const gas = await contract.methods
                            .transfer(Withdraw_history.to_address, amt)
                            .estimateGas({
                              value: 0,
                              from: hot_wallet.wallet_address,
                            });
                          const receipt = await contract.methods
                            .transfer(Withdraw_history.to_address, amt)
                            .send({
                              value: 0,
                              from: hot_wallet.wallet_address,
                              gas: gas,
                            });
                          if (receipt) {
                            const new_balance =
                              parseFloat(wallet_data.balance) - amount;
                            //  console.log("final_amount", new_balance);
                            await Wallets.updateOne(
                              {
                                user: Withdraw_history.user_id,
                                wallet_type: wallet_type.toUpperCase(),
                              },
                              {
                                $set: {
                                  balance: new_balance,
                                },
                              }
                            );
                            await HotWallet.updateOne(
                              { wallet_type: wallet_type.toUpperCase() },
                              {
                                $set: {
                                  total_funds:
                                    parseFloat(hot_wallet.total_funds) -
                                    total_final_amt,
                                },
                              }
                            );
                            await OtpBuffer.updateOne(
                              { user_id: user_id },
                              {
                                $set: {
                                  email_otp: null,
                                },
                              }
                            );
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: receipt.transactionHash,
                                  blockNumber: receipt.blockNumber,
                                  status: 1,
                                },
                              }
                            )
                              .then(() => {
                                return res.json({
                                  status: 200,
                                  error: false,
                                  message:
                                    wallet_data.wallet_type +
                                    " WITHDRAWAL SUCCESSFULLY!",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message:
                                    wallet_data.wallet_type + " NOT Withdraw!!",
                                });
                              });
                          } else {
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  status: -2,
                                },
                              }
                            )
                              .then(() => {
                                return res.status(400).json({
                                  message: "Receipt not found!*",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message: "Receipt not found!",
                                });
                              });
                          }
                        } else if (wallet_data.type == "erc20") {
                          var contractEth = new web3Eth.eth.Contract(
                            abi,
                            currency_info.contract_address
                          );
                          web3Eth.eth.accounts.wallet.add(
                            hot_wallet.private_key
                          );
                          let decimal = await contractEth.methods
                            .decimals()
                            .call();
                          decimal = Number(`1e${decimal}`);
                          const amt = toFixed(
                            total_final_amt * decimal
                          ).toString();
                          const gas = await contractEth.methods
                            .transfer(Withdraw_history.to_address, amt)
                            .estimateGas({
                              value: 0,
                              from: hot_wallet.wallet_address,
                            });
                          const receipt = await contractEth.methods
                            .transfer(Withdraw_history.to_address, amt)
                            .send({
                              value: 0,
                              from: hot_wallet.wallet_address,
                              gas: gas,
                            });
                          if (receipt) {
                            const new_balance =
                              parseFloat(wallet_data.balance) - amount;
                            //  console.log("final_amount", new_balance);
                            await Wallets.updateOne(
                              {
                                user: Withdraw_history.user_id,
                                wallet_type: wallet_type.toUpperCase(),
                              },
                              {
                                $set: {
                                  balance: new_balance,
                                },
                              }
                            );
                            await HotWallet.updateOne(
                              { wallet_type: wallet_type.toUpperCase() },
                              {
                                $set: {
                                  total_funds:
                                    parseFloat(hot_wallet.total_funds) -
                                    total_final_amt,
                                },
                              }
                            );
                            await OtpBuffer.updateOne(
                              { user_id: user_id },
                              {
                                $set: {
                                  email_otp: null,
                                },
                              }
                            );
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: receipt.transactionHash,
                                  blockNumber: receipt.blockNumber,
                                  status: 1,
                                },
                              }
                            )
                              .then(() => {
                                return res.json({
                                  status: 200,
                                  error: false,
                                  message:
                                    wallet_data.wallet_type +
                                    " WITHDRAWAL SUCCESSFULLY!",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message:
                                    wallet_data.wallet_type + " NOT Withdraw!!",
                                });
                              });
                          } else {
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  status: -2,
                                },
                              }
                            )
                              .then(() => {
                                return res.status(400).json({
                                  message: "Receipt not found!*",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message: "Receipt not found!",
                                });
                              });
                          }
                        } else if (wallet_data.wallet_type == "ETH") {
                          const ethesgas = await web3Eth.eth.estimateGas({
                            to: hot_wallet.wallet_address,
                          });
                          const ethgasp = await web3Eth.eth.getGasPrice();
                          const ethcreateTransaction =
                            await web3Eth.eth.accounts.signTransaction(
                              {
                                from: hot_wallet.wallet_address,
                                to: Withdraw_history.to_address,
                                value:
                                  total_final_amt * 1e18 - ethesgas * ethgasp,
                                gas: ethesgas,
                              },
                              hot_wallet.private_key
                            );
                          // Deploy transaction
                          const ethcreateReceipt =
                            await web3Eth.eth.sendSignedTransaction(
                              ethcreateTransaction.rawTransaction
                            );
                          console.log("eth transection", ethcreateReceipt);
                          if (ethcreateReceipt) {
                            const ethnew_balance =
                              parseFloat(wallet_data.balance) - amount;
                            //  console.log("final_amount", new_balance);
                            await Wallets.updateOne(
                              {
                                user: Withdraw_history.user_id,
                                wallet_type: wallet_type.toUpperCase(),
                              },
                              {
                                $set: {
                                  balance: ethnew_balance,
                                },
                              }
                            );
                            await HotWallet.updateOne(
                              { wallet_type: wallet_type.toUpperCase() },
                              {
                                $set: {
                                  total_funds:
                                    parseFloat(hot_wallet.total_funds) -
                                    total_final_amt,
                                },
                              }
                            );
                            await OtpBuffer.updateOne(
                              { user_id: user_id },
                              {
                                $set: {
                                  email_otp: null,
                                },
                              }
                            );
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: ethcreateReceipt.transactionHash,
                                  blockNumber: ethcreateReceipt.blockNumber,
                                  status: 1,
                                },
                              }
                            )
                              .then(() => {
                                return res.json({
                                  status: 200,
                                  error: false,
                                  message:
                                    wallet_data.wallet_type +
                                    " WITHDRAWAL SUCCESSFULLY!",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message:
                                    wallet_data.wallet_type + " NOT Withdraw!!",
                                });
                              });
                          } else {
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  status: -2,
                                },
                              }
                            )
                              .then(() => {
                                return res.status(400).json({
                                  message: "ethcreateReceipt not Found**",
                                });
                              })
                              .catch(() => {
                                return res.status(400).json({
                                  message: "ethcreateReceipt not Found***",
                                });
                              });
                          }
                        } else if (wallet_data.type == "trc20") {
                          let trx_bal = await tronWeb.trx.getBalance(
                            hot_wallet.wallet_address
                          );
                          const trx_balance = trx_bal / 1000000;
                          tronWeb.setAddress(hot_wallet.wallet_address);
                          let usdtcontract = await tronWeb
                            .contract()
                            .at(currency_info.contract_address);
                          const balance = await usdtcontract
                            .balanceOf(hot_wallet.wallet_address)
                            .call();
                          const usdt_balance = Number(balance._hex) / decimal;
                          console.log("usdt_balance", usdt_balance);
                          if (
                            trx_balance > 15 &&
                            total_final_amt <= usdt_balance
                          ) {
                            //Creates an unsigned TRX transfer transaction
                            const usdtreceipt = await usdtcontract
                              .transfer(
                                Withdraw_history.to_address,
                                total_final_amt * decimal
                              )
                              .send(
                                {
                                  feeLimit: 10000000,
                                },
                                hot_wallet.private_key
                              );
                            if (usdtreceipt) {
                              const usdtnew_balance =
                                parseFloat(wallet_data.balance) - amount;
                              //  console.log("final_amount", new_balance);
                              await Wallets.updateOne(
                                {
                                  user: Withdraw_history.user_id,
                                  wallet_type: wallet_type.toUpperCase(),
                                },
                                {
                                  $set: {
                                    balance: usdtnew_balance,
                                  },
                                }
                              );
                              await HotWallet.updateOne(
                                { wallet_type: wallet_type.toUpperCase() },
                                {
                                  $set: {
                                    total_funds:
                                      parseFloat(hot_wallet.total_funds) -
                                      total_final_amt,
                                  },
                                }
                              );
                              await OtpBuffer.updateOne(
                                { user_id: user_id },
                                {
                                  $set: {
                                    email_otp: null,
                                  },
                                }
                              );
                              WithdrawHistory.updateOne(
                                { transection_id: transection_id },
                                {
                                  $set: {
                                    tx_id: usdtreceipt,
                                    status: 1,
                                  },
                                }
                              )
                                .then(() => {
                                  return res.json({
                                    status: 200,
                                    error: false,
                                    message:
                                      wallet_data.wallet_type +
                                      " WITHDRAWAL SUCCESSFULLY!",
                                  });
                                })
                                .catch(() => {
                                  return res.status(400).json({
                                    message:
                                      wallet_data.wallet_type +
                                      " NOT Withdraw!!",
                                  });
                                });
                            } else {
                              WithdrawHistory.updateOne(
                                { transection_id: transection_id },
                                {
                                  $set: {
                                    tx_id: usdtreceipt,
                                    status: -2,
                                  },
                                }
                              ).then(() => {
                                return res.status(400).json({
                                  message: "data fetch!!",
                                });
                              });
                            }
                          } else {
                            return res.status(400).json({
                              message: "data fetch!!",
                            });
                          }
                        } else if (wallet_data.wallet_type == "TRX") {
                          const tradeobj =
                            await tronWeb.transactionBuilder.sendTrx(
                              Withdraw_history.to_address,
                              total_final_amt * 1e6,
                              hot_wallet.wallet_address
                            );
                          const signedtxn = await tronWeb.trx.sign(
                            tradeobj,
                            hot_wallet.private_key
                          );
                          const trxreceipt =
                            await tronWeb.trx.sendRawTransaction(signedtxn);
                          if (trxreceipt.result) {
                            const new_balance =
                              parseFloat(wallet_data.balance) - amount;
                            console.log("final_amount", new_balance);
                            const ht = await Wallets.updateOne(
                              {
                                user: Withdraw_history.user_id,
                                wallet_type: wallet_type.toUpperCase(),
                              },
                              {
                                $set: {
                                  balance: new_balance,
                                },
                              }
                            );
                            console.log("shd", ht);
                            await HotWallet.updateOne(
                              { wallet_type: wallet_type.toUpperCase() },
                              {
                                $set: {
                                  total_funds:
                                    parseFloat(hot_wallet.total_funds) -
                                    total_final_amt,
                                },
                              }
                            );
                            await OtpBuffer.updateOne(
                              { user_id: user_id },
                              {
                                $set: {
                                  email_otp: null,
                                },
                              }
                            );
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: trxreceipt.txid,
                                  status: 1,
                                },
                              }
                            ).then(() => {
                              return res.json({
                                status: 200,
                                error: false,
                                message:
                                  wallet_data.wallet_type +
                                  " WITHDRAWAL SUCCESSFULLY!",
                              });
                            });
                          } else {
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: trxreceipt.txid,
                                  status: -2,
                                },
                              }
                            ).then(() => {
                              return res.status(400).json({
                                message: "data fetch!!",
                              });
                            });
                          }
                        } else if (wallet_data.type == "trc10") {
                          const btttradeobj =
                            await tronWeb.transactionBuilder.sendToken(
                              Withdraw_history.to_address,
                              total_final_amt * 1e6,
                              currency_info.contract_address,
                              hot_wallet.wallet_address
                            );
                          const bttsignedtxn = await tronWeb.trx.sign(
                            btttradeobj,
                            hot_wallet.private_key
                          );
                          const bttreceipt =
                            await tronWeb.trx.sendRawTransaction(bttsignedtxn);
                          if (bttreceipt.result) {
                            const new_balance =
                              parseFloat(wallet_data.balance) - amount;
                            console.log("final_amount", new_balance);
                            const ht = await Wallets.updateOne(
                              {
                                user: Withdraw_history.user_id,
                                wallet_type: wallet_type.toUpperCase(),
                              },
                              {
                                $set: {
                                  balance: new_balance,
                                },
                              }
                            );
                            console.log("shd", ht);
                            await HotWallet.updateOne(
                              { wallet_type: wallet_type.toUpperCase() },
                              {
                                $set: {
                                  total_funds:
                                    parseFloat(hot_wallet.total_funds) -
                                    total_final_amt,
                                },
                              }
                            );
                            await OtpBuffer.updateOne(
                              { user_id: user_id },
                              {
                                $set: {
                                  email_otp: null,
                                },
                              }
                            );
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: bttreceipt.txid,
                                  status: 1,
                                },
                              }
                            ).then(() => {
                              return res.json({
                                status: 200,
                                error: false,
                                message:
                                  wallet_data.wallet_type +
                                  " WITHDRAWAL SUCCESSFULLY!",
                              });
                            });
                          } else {
                            WithdrawHistory.updateOne(
                              { transection_id: transection_id },
                              {
                                $set: {
                                  tx_id: bttreceipt.txid,
                                  status: -2,
                                },
                              }
                            ).then(() => {
                              return res.status(400).json({
                                message: "data fetch!!",
                              });
                            });
                          }
                        } else {
                          return res.status(400).json({
                            message: "Somthing Went Wrong!! Default",
                          });
                        }
                      } else {
                        //unsuffiecent admin fund
                        await WithdrawHistory.updateOne(
                          { transection_id: transection_id },
                          {
                            $set: {
                              status: -1,
                            },
                          }
                        );
                        return res.status(400).json({
                          message: "Somthing Went Wrong!!*",
                        });
                      }
                    } else {
                      // fund is not available in fund
                      await WithdrawHistory.updateOne(
                        { transection_id: transection_id },
                        {
                          $set: {
                            status: -1,
                          },
                        }
                      );
                      return res.status(400).json({
                        message: "Somthing Went Wrong!!**",
                        err: "Insufficient fund",
                      });
                    }
                  } else {
                    // user wallet is not found of perticular currency
                    await WithdrawHistory.updateOne(
                      { transection_id: transection_id },
                      {
                        $set: {
                          status: -1,
                        },
                      }
                    );
                    return res.status(400).json({
                      message: "Somthing Went Wrong!!***",
                      err: "User wallet not found",
                    });
                  }
                } else {
                  // transaction currency is not in supported currency
                  await WithdrawHistory.updateOne(
                    { transection_id: transection_id },
                    {
                      $set: {
                        status: -1,
                      },
                    }
                  );
                  return res.status(400).json({
                    message: "Somthing Went Wrong!!****",
                    err:
                      wallet_type.toUpperCase() +
                      "Not found in supported currency",
                  });
                }
              } else {
                await WithdrawHistory.updateOne(
                  { transection_id: transection_id },
                  {
                    $set: {
                      status: -1,
                    },
                  }
                );
                return res.status(400).json({
                  message: "Somthing Went Wrong!!*****",
                });
              }
            } else {
              return res.status(400).json({
                message: "Invalid OTP",
              });
            }
          } else {
            return res.status(400).json({
              message: "Invalid OTP",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid Request",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid request",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>varifieMobileWithdrawOTP: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}

async function varifieMobileLogin(req, res) {
  const { verifyOTP } = require("../utils/validator");
  const OtpBuffer = require("../models/otp_buffer");
  const OTP_LENGTH = 6;
  try {
    const { email, otp } = req.body;
    if (email && otp && otp.toString().length == OTP_LENGTH) {
      // const user_status = await validateUserId(user_id);
      // if (user_status) {
      const otp_object = await OtpBuffer.findOne({ email: email });
      if (otp_object) {
        if (otp_object.mobile_otp) {
          if (verifyOTP(otp_object.mobile_otp, otp)) {
            await OtpBuffer.updateOne(
              { email: email },
              {
                $set: {
                  mobile_otp: null,
                },
              }
            );
            return res.json({
              status: 200,
              error: false,
              message: "OTP verified",
            });
          } else {
            return res.status(400).json({
              message: "Invalid OTP",
            });
          }
        } else {
          return res.status(400).json({
            message: "Invalid OTP",
          });
        }
      } else {
        return res.status(400).json({
          message: "Invalid Request",
        });
      }
      // } else {
      //   return res.json({
      //     status: 400,
      //     error: true,
      //     message: "Invalid request",
      //   });
      // }
    } else {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>verifyUserMobile: ",
      error.message
    );
    return res.status(400).json({
      message: "Something went wrong, please try again!",
    });
  }
}

async function modifyUserProfile(req, res) {
  const User = require("../models/user");
  const { validateUserId } = require("../utils/validator");
  try {
    const {
      action,
      admin_user_id,
      user_role,
      status,
      admin_permission,
      mobile_number,
      email,
    } = req.body;
    let updateProfile = { matchedCount: 0 };
    /*
        // user_role = 1 for emplyoyee
        // user_role = 0 for user
        // user_role = 2 for admin
        // user_status = -1 blocked
        // user_status = -2 deleted
        // user_status = 2 archived
        // user_status = 1 active
        // user_status = 0 not active
        */
    if (admin_user_id && validateUserId(admin_user_id)) {
      // let update_profile = {};
      const user_data = await User.findOne({
        email: email,
        user_role: { $ne: 2 },
      });
      if (user_data && action == "update_profile") {
        if (user_role || status) {
          // update_profile = user_role ? update_profile.user_role: user_role;
          let message = "User Profile Updated Successfully";
          if (status) {
            // delete the user
            updateProfile = await User.updateOne(
              { user_id: user_data.user_id },
              {
                $set: {
                  user_status: status,
                },
              }
            );
            message = "Deleted Successfully";
          } else if (user_role && admin_permission) {
            // add employee for existing user
            updateProfile = await User.updateOne(
              { user_id: user_data.user_id },
              {
                $set: {
                  user_role: user_role, // for employee
                  is_email_verified: 1,
                  ask_login_otp: 1,
                  mobile_number: mobile_number,
                  admin_permission: admin_permission,
                  user_status: 1,
                },
              }
            );
          }
          if (updateProfile.matchedCount) {
            return res.json({
              status: 200,
              error: false,
              query_status: updateProfile.matchedCount,
              message: message,
            });
          } else {
            return res.status(400).json({
              error1: true,
              query_status: updateProfile.matchedCount,
              message: "Something went's wrong",
            });
          }
        }
        return res.status(400).json({
          query_status: updateProfile.matchCount,
          message: "Something went's wrong, Invalid Data",
        });
      } else {
        return res.status(400).json({
          message: "User does not exist!!",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>modifyUserProfile: ",
      error.message
    );
    return res.status(400).json({
      error1: error.message,
      message: "Something went wrong, please try again!",
    });
  }
}
async function permanentDeleteUser(req, res) {
  const User = require("../models/user");
  const Wallets = require("../models/wallets");
  const deletedData = require("../models/deleted_data");
  const { validateUserId } = require("../utils/validator");
  try {
    const { action, admin_user_id, user_id } = req.body;
    /*
        Delete User and wallet Permanently
        */
    if (admin_user_id && validateUserId(admin_user_id)) {
      let user_data = { matchedCount: 0 };
      const getuser = await User.findOne({
        user_id: user_id,
        user_role: { $ne: 2 },
      });
      const getwallet = await Wallets.find({
        user: user_id,
        user_role: { $ne: 2 },
      });

      if (getuser && action == "delete_user") {
        let message = "User Deleted Updated Successfully";
        User.deleteMany({ user_id: user_id, user_role: { $ne: 2 } }).then(
          (res) => {
            if (res) {
              deletedData.create({
                user_id,
                email: getuser.email,
                collection_name: "user",
                action_by: admin_user_id,
                action_message: "Deleted User",
                data: getuser,
              });
            }
          }
        );
        Wallets.deleteMany({ user: user_id }).then((res) => {
          if (res) {
            deletedData.create({
              user_id,
              email: getuser.email,
              collection_name: "wallets",
              action_by: admin_user_id,
              action_message: "deleted wallets",
              data: getwallet,
            });
          }
        });

        if (user_data) {
          return res.json({
            status: 200,
            error: false,
            query_status: user_data,
            message: message,
          });
        } else {
          return res.status(400).json({
            error1: true,
            query_status: user_data.matchedCount,
            message: "Something went's wrong",
          });
        }
      } else {
        return res.status(400).json({
          message: "User does not exist!!",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>auth.js>permanentDeleteUser: ",
      error.message
    );
    return res.status(400).json({
      error1: error.message,
      message: "Something went wrong, please try again!",
    });
  }
}
module.exports = {
  registerUser,
  verifyUserEmail,
  resendOtp,
  loginUser,
  resetPassword,
  forgetPassword,
  updateNewPassword,
  verifyForgetPassword,
  setGoogleAuth,
  setGoogleAuthOTP,
  getGoogleAuth,
  sendMobileVarificationOtp,
  sendMobileVarificationOtWithEmail,
  varifieMobile,
  varifieMobileLogin,
  check_user_status,
  getGoogleAuthFromUserId,
  varifieMobileWithdrawOTP,
  varifieEmailWithdrawOTP,
  modifyUserProfile,
  permanentDeleteUser,
  sendEmailVerificationCode,
  sendMobileVerificationCode,
  verifyUserOTP,
  getGoogleAuthNew,
  registerNewUser,
  sendEmailCode
};

//https://stackoverflow.com/questions/61291289/delete-the-associated-blog-posts-with-user-before-deleting-the-respective-user-i
