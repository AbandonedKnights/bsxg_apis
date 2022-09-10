const user = require("../models/user");
const { validateUserId } = require("./validator");
const {
  createHash,
  createUniqueID,
  generateReferalCode,
  distributeReferal,
  distributeAirdrop,
} = require("./functions");
async function createNewUser(email, password, parent_referal, otp) {
  const User = require("../models/user");
  if (email && password && otp) {
    const hashedPassword = await createHash(password);
    const user_id = createUniqueID((type = "user"));
    const creation_time = Date.now();
    // const referal_code = generateReferalCode(email); // this block of code is moved in kyc varification
    try {
      await User.create({
        user_id,
        email,
        hashedPassword: hashedPassword,
        created_on: creation_time,
        self_ref_code: "",
        parent_ref_code: parent_referal,
      });

      const otp_status = await setEmailOtp({ user_id, otp });
      if (otp_status) console.log("otp stored");
      else console.log("otp couldn't store");

      return user_id;
    } catch (error) {
      console.log(
        "Error: from: utils>functions.users.js>createNewUser: ",
        error.message
      );
      return undefined;
    }
  } else return undefined;
  return undefined;
}

async function addNewUser(params) {
  const { email, name, mobile_number, password, parent_ref_code } = params;
  if (email && mobile_number && password && name) {
    const hashedPassword = await createHash(password);
    const user_id = createUniqueID((type = "user"));
    const creation_time = Date.now();
    console.log(hashedPassword, user_id, creation_time);
    try {
      const User = require("../models/user");
      const data = {
        user_id,
        name:name ? name : "",
        email: email ? email : "",
        mobile_number: mobile_number ? mobile_number : "",
        hashedPassword: hashedPassword,
        created_on: creation_time,
        self_ref_code: "",
        parent_ref_code: parent_ref_code ? parent_ref_code : '',
        is_email_verified: email ? true : false,
        is_mobile_verified: mobile_number ? true : false,
      };
      console.log(data)
      const newUser = await User.create(data);
      if (newUser) {
        return newUser;
      } else {
        return undefined;
      }
    } catch (error) {
        console.log(error.message);
      return undefined;
    }
  } else {
    return undefined;
  }
}

async function isUserExist(email) {
  /**
   *  2   : exist and varified
   *  1   : exist and not varified
   *  0   : not exist
   * -1   : something went wrong
   * -2   : please provide email
   */
  const User = require("../models/user");
  if (email) {
    try {
      const user = await User.findOne({ email: email });
      if (user && user.email == email && user.is_email_verified == true) {
        return 2;
      } else if (
        user &&
        user.email == email &&
        user.is_email_verified == false
      ) {
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      console.log(
        "Error: from: utils>functions.users.js>isUserExist: ",
        error.message
      );
      return -1;
    }
  } else {
    return -2;
  }
}

async function checkUser(params) {
  try {
    const User = require("../models/user");
    const user = await User.findOne(params);
    if (user) {
      return 2;
    } else {
      return 0;
    }
  } catch (error) {
    console.log("controller/auth.js/", error.message);
    return -1;
  }
}

async function setEmailOtp(obj) {
  const email = obj.email ? obj.email : undefined;
  const user_id = obj.user_id ? obj.user_id : undefined;
  const otp = obj.otp ? obj.otp : undefined;
  if (otp && isNaN(parseInt(otp)) == false) {
    const OtpBuffer = require("../models/otp_buffer");
    try {
      if (user_id) {
        const user_otp_obj = await OtpBuffer.findOne({ user_id: user_id });
        if (user_otp_obj) {
          await OtpBuffer.updateOne(
            { user_id: user_id },
            {
              $set: {
                email_otp: otp + "_" + Date.now(),
              },
            }
          );
        } else {
          await OtpBuffer.create({
            user_id: user_id,
            email: email,
            email_otp: otp + "_" + Date.now(),
          });
        }
      } else if (email) {
        const user_otp_obj = await OtpBuffer.findOne({ email: email });
        if (user_otp_obj) {
          await OtpBuffer.updateOne(
            { email: email },
            {
              $set: {
                email_otp: otp + "_" + Date.now(),
              },
            }
          );
        }
      } else {
        return false;
      }
      return true;
    } catch (error) {
      console.log(
        "Error: from: utils>functions.users.js>setEmailOtp: ",
        error.message
      );
      return false;
    }
  } else {
    return false;
  }
}
async function setMobileOtp(obj) {
  const OtpBuffer = require("../models/otp_buffer");
  const user_id = obj.user_id ? obj.user_id : undefined;
  const otp = obj.otp ? obj.otp : undefined;
  if (user_id) {
    if (otp && isNaN(parseInt(otp)) == false) {
      try {
        const user_otp_obj = await OtpBuffer.findOne({ user_id: user_id });
        if (user_otp_obj) {
          await OtpBuffer.updateOne(
            { user_id: user_id },
            {
              $set: {
                mobile_otp: otp + "_" + Date.now(),
              },
            }
          );
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log(
          "Error: from: utils>functions.users.js>setEmailOtp: ",
          error.message
        );
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}
async function getEmailFromUserId(user_id) {
  const User = require("../models/user");
  try {
    if (user_id) {
      const user_data = await user.findOne({ user_id: user_id });
      if (user_data) {
        return user_data.email ? user_data.email : undefined;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>setEmailFromUserId: ",
      error.message
    );
    return undefined;
  }
}

async function getUserIdFromEmail(email) {
  const User = require("../models/user");
  try {
    if (email) {
      const user_data = await User.findOne({ email: email });
      if (user_data) {
        return user_data.user_id ? user_data.user_id : undefined;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>getUserIdFromEmail: ",
      error.message
    );
    return undefined;
  }
}
async function kycUserList(action, raw, user_id) {
  const PendingKYC = require("../models/pending_kyc");
  try {
    raw = raw ? parseInt(raw) : "";
    let user_data = "";
    let define_status = { pending: -1, rejected: 2, approved: 1 };
    let status = action ? define_status[action] : "";
    let raw_d =
      raw || raw === 0
        ? { doc_1_f: raw, doc_1_s: raw, doc_1_b: raw, doc_2_f: raw }
        : {};
    if (user_id) {
      user_data = await PendingKYC.findOne({ user_id: user_id }, raw_d);
    } else if (status || status === 0) {
      user_data = await PendingKYC.find({ status: status });
    } else {
      user_data = await PendingKYC.find();
    }
    return user_data;
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>kycUserList: ",
      error.message
    );
    return undefined;
  }
}
async function getUserList(action, raw, user_id, user_role) {
  const User = require("../models/user");
  try {
    raw = parseInt(raw);
    let user_data = "";
    let status = 0; // pending
    let define_status = { blockuser: 2, alluser: 1 };
    status = define_status[action];
    if (user_id) {
      user_data = User.aggregate([
        {
          $match: {
            user_status: status,
            user_id: user_id,
          },
        },
        {
          $lookup: {
            from: "pending_kyc",
            localField: "user_id",
            foreignField: "user_id",
            as: "pending_kyc",
          },
        },
      ]);
    } else if (user_role) {
      user_data = User.find({
        user_role: parseInt(user_role),
        user_status: { $in: [1, -2] },
      });
      // user_data = User.aggregate( [
      //     { "$match": {
      //         user_role: parseInt(user_role),
      //     } },
      //     {
      //         $lookup: {
      //             from: "pending_kyc",
      //             localField: "user_id",
      //             foreignField: "user_id",
      //             as: "pending_kyc",
      //         }
      //     },
      // ] );
    } else if (status || status === 0) {
      user_data = User.aggregate([
        {
          $match: {
            user_status: status,
          },
        },
        {
          $lookup: {
            from: "pending_kyc",
            localField: "user_id",
            foreignField: "user_id",
            as: "pending_kyc",
          },
        },
      ]);
    } else {
      user_data = User.aggregate([
        {
          $match: {
            user_role: { $ne: 2 },
          },
        },
        {
          $lookup: {
            from: "pending_kyc",
            localField: "user_id",
            foreignField: "user_id",
            as: "pending_kyc",
          },
        },

        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ["$pending_kyc", 0] }, "$$ROOT"],
            },
          },
        },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            middle_name: 1,
            email: 1,
            symbol: 1,
            createdAt: 1,
            referral_income: 1,
            user_id: 1,
            user_status: 1,
            is_bank_verified: 1,
            is_email_verified: 1,
            is_kyc_verified: 1,
            mobile_number: 1,
            is_mobile_verified: 1,
          },
        },
      ]);
    }
    return user_data;
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>getUserList: ",
      error.message
    );
    return undefined;
  }
}
async function kycBankList(action, raw, user_id) {
  const Bank = require("../models/user_bank_details");
  try {
    raw = parseInt(raw);
    let user_data = "";
    let status = 0; // pending
    let define_status = { pending: -1, rejected: 2, verified: 1 };
    status = define_status[action];
    if (user_id) {
      user_data = await Bank.findOne({ user_id: user_id });
    } else if (status || status === 0) {
      user_data = await Bank.find({ status: status });
    } else {
      user_data = await Bank.find();
    }
    return user_data;
    if (typeof user_data == "object") {
    } else {
      return {
        status: 200,
        error: false,
        message: `No Data! ${error.message}`,
      };
    }
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>kycBankList: ",
      error.message
    );
    return undefined;
  }
}
async function updateKYCQuery(msg, status, user_id) {
  const PendingKYC = require("../models/pending_kyc");
  const { sendKYCEmail } = require("../utils/mailer");
  const User = require("../models/user");
  try {
    user_kyc = await PendingKYC.updateOne(
      { user_id: user_id },
      {
        $set: {
          status: status,
          auditor_msg: msg,
        },
      }
    );
    user_data = await User.findOne({ user_id: user_id });
    user_update = await User.updateOne(
      { user_id: user_id },
      {
        $set: {
          is_kyc_verified: status,
        },
      }
    );
    sendKYCEmail(user_data.email, status, msg);
    if (user_kyc.matchedCount > 0 && status == 1) {
      await generateReferalCode(user_id);
      await distributeReferal(user_id);
      await distributeAirdrop(user_id);
    }
    return {
      status: 200,
      query_status: user_kyc.matchedCount,
      update_status: status,
      error: false,
    };
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>updateKYCQuery: ",
      error.message
    );
    return undefined;
  }
}
async function updateBankQuery(msg, status, user_id) {
  const PendingBank = require("../models/user_bank_details");
  const { sendBankVerificationEmail } = require("../utils/mailer");
  const User = require("../models/user");
  try {
    user_update = await PendingBank.updateOne(
      { user_id: user_id },
      {
        $set: {
          status: status,
          auditor_msg: msg,
        },
      }
    );
    user_data = await User.findOne({ user_id: user_id });
    user_update = await User.updateOne(
      { user_id: user_id },
      {
        $set: {
          is_bank_verified: status,
        },
      }
    );
    if (user_data) {
      sendBankVerificationEmail(user_data.email, status, msg);
    }
    return {
      status: 200,
      query_status: user_bank.matchedCount,
      update_status: status,
      error: false,
    };
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>updateBankQuery: ",
      error.message
    );
    return undefined;
  }
}
async function updateUserProfile(user_id, mobile_no) {
  const User = require("../models/user");
  try {
    if (user_id) {
      user_bank = await User.updateOne(
        { user_id: user_id },
        { mobile_number: mobile_no }
      );
    }
    return {
      status: 200,
      query_status: user_bank.matchedCount,
      error: false,
    };
  } catch (error) {
    console.log(
      "Error: from: utils>functions.users.js>updateUserProfile: ",
      error.message
    );
    return undefined;
  }
}
async function updateUserPassword(user_id, new_password) {
  const User = require("../models/user");
  try {
    if (user_id && validateUserId(user_id)) {
      if (new_password) {
        try {
          const hashedPassword = await createHash(new_password);
          if (hashedPassword) {
            const user_data = await User.findOne({ user_id });
            if (user_data) {
              await User.updateOne(
                { user_id: user_id },
                {
                  $set: {
                    hashedPassword: hashedPassword,
                  },
                }
              );
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } catch (error) {
          console.log(
            "Error: from: utils>functions.users.js>updateUserPassword: ",
            error.message
          );
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log(
      "Error: from:src>utils>functions.users.js>updateUserPassword: ",
      error.message
    );
    return false;
  }
}
async function checkPassword(user_id, password) {
  try {
    if (user_id && validateUserId(user_id)) {
      if (password) {
        try {
          const user_data = await User.findOne({ user_id: user_id });
          if (user_data) {
            const isfound = await compareHash(
              user_data.hashedPassword ? user_data.hashedPassword : "",
              password
            );
            if (isfound) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } catch (error) {
          console.log(
            "Error: from: utils>functions.users.js>checkPassword: ",
            error.message
          );
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log(
      "Error: from: src>utils>functions.users.js>checkPassword: ",
      error.message
    );
    return false;
  }
}
async function getReferrelNotKYC(user_id) {
  try {
    const User = require("../models/user");
    // const user_data = await User.find({parent_ref_code:{$ne:''},is_kyc_verified:0})
    const user_data = await User.aggregate([
      { $match: { parent_ref_code: { $ne: "" }, is_kyc_verified: 0 } },
      {
        $lookup: {
          from: "user",
          let: { parent_code: "$parent_ref_code" },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$self_ref_code", "$$parent_code"] }] },
              },
            },
            { $project: { self_ref_code: 0, _id: 0 } },
          ],
          as: "parent_detail",
        },
      },
    ]);
    return user_data;
  } catch (error) {
    console.log(
      "Error: from: src>utils>functions.users.js>getReferrelNotKYC: ",
      error.message
    );
    return false;
  }
}

async function sendMobileOtp(mobile_no, otp) {
  const fetch = require("cross-fetch");
  await fetch(
    `https://2factor.in/API/V1/87802cca-1c48-11ec-a13b-0200cd936042/SMS/${mobile_no}/${otp}`
  );
}

module.exports = {
  createNewUser,
  isUserExist,
  setEmailOtp,
  setMobileOtp,
  getEmailFromUserId,
  kycUserList,
  updateUserPassword,
  checkPassword,
  getUserList,
  kycBankList,
  getUserIdFromEmail,
  updateKYCQuery,
  updateBankQuery,
  sendMobileOtp,
  updateUserProfile,
  getReferrelNotKYC,
  checkUser,
  addNewUser,
};
