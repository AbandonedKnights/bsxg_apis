const user = require("../models/user");
const { formatEmail, getUserActivity } = require("../utils/functions");
const { kycUserList,getUserList,kycBankList,updateKYCQuery,updateBankQuery,updateUserProfile, getReferrelNotKYC } = require("../utils/functions.users");
const { validateUserId, totalwithdrawFees, isAdmin } = require("../utils/validator");
const Users = require('../models/user');
const PendingKYC = require('../models/pending_kyc');

async function searchUsers(req, res) {
    try {
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            const is_secure = req.body.is_secure ? req.body.is_secure : true;
            const email = req.body.email ? req.body.email : undefined;
            const user_role = req.body.user_role ? req.body.user_role : undefined;
            const is_email_verified = req.body.is_email_verified ? req.body.is_email_verified : undefined;
            const is_kyc_verified = req.body.is_kyc_verified ? req.body.is_kyc_verified : undefined;
            const is_mobile_verified = req.body.is_mobile_verified ? req.body.is_mobile_verified : undefined;
            const filters = {};
            if (email)
                filters.email = new RegExp(email, "i");
            if (user_role)
                filters.user_role = user_role;
            if (is_email_verified)
                filters.is_email_verified = is_email_verified;
            if (is_kyc_verified)
                filters.is_kyc_verified = is_kyc_verified;
            if (is_mobile_verified)
                filters.is_mobile_verified = is_mobile_verified;
            const users = await user.find(filters);
            if (users) {
                const search_data = users.map((user) => {
                    return {
                        email: is_secure ?formatEmail(user.email):user.email,
                        created_on: user.created_on,
                        self_ref_code: user.self_ref_code,
                        parent_ref_code: user.parent_ref_code,
                        user_role: user.user_role,
                        is_email_verified: user.is_email_verified,
                        is_kyc_verified: user.is_kyc_verified,
                        is_bank_verified: user.is_bank_verified,
                        is_mobile_verified: user.is_mobile_verified,
                        referral_income: user.referral_income,
                    }
                })
                
                return res.json({
                    status: 200,
                    error: false,
                    message: "User list found",
                    data: search_data
                })
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request"
                })
            }
        } else {
            const { action,raw,user_id, user_role } = req.query;
            const data = await getUserList(action,raw,user_id, user_role);
            return res.json( data )
            
        }
    } catch (error) {
        console.log("Error: from: src>controller>user.js: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong!"
        })
    }
}
async function kycUser(req, res) {
    try {
        const { action,raw,user_id } = req.query;
        console.log(action,raw,user_id);
        const data = await kycUserList(action,raw,user_id);
        return res.json( data )
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function bankUser(req, res) {
    try {
        const { action,raw,user_id } = req.query;
        const data = await kycBankList(action,raw,user_id);
        return res.json( data )
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function updatekyc(req, res) {
    try {
        const { msg,status,user_id } = req.body;
        if(msg && status && user_id){
            const data = await updateKYCQuery(msg,status,user_id);
            return res.json( data )
        }
        return res.json({
            status: 300,
            msg: msg,
            status: status,
            user_id: user_id,
            message: `Error! insufficient data}`
        })
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function updatebank(req, res) {
    try {
        const { msg,status,user_id } = req.body;
        if(msg && status && user_id){
            const data = await updateBankQuery(msg,status,user_id);
            return res.json( data )
        }
        return res.json({
            status: 300,
            msg: msg,
            status: status,
            user_id: user_id,
            message: `Error! insufficient data}`
        })
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function getUserProfile(req, res) {
    try {
        const { user_id ,wallet_password } = req.body;
        if (user_id) {
            let profile_data = {}; let getSetting = {};
            const user_data = await Users.findOne({ user_id: user_id });
            if(wallet_password){
                const webdata = require("../models/website_data");
                getSetting = await webdata.findOne();
            }
            if (user_data) {
                profile_data.email = user_data.email;
                profile_data.name = user_data.name;
                profile_data.mobile_number = user_data.mobile_number?user_data.mobile_number: false;
                profile_data.wallet_password = getSetting.wallet_password?getSetting.wallet_password:false;
                profile_data.admin_permission = user_data.admin_permission?user_data.admin_permission:false;
                const kyc_data = await PendingKYC.findOne({ user_id: user_id });
                if (kyc_data) {
                    let fname = kyc_data.first_name ? kyc_data.first_name : '';
                    let mname = kyc_data.middle_name ? kyc_data.middle_name : '';
                    let lname = kyc_data.last_name ? kyc_data.last_name : '';
                    let full_name = fname + ' ' + mname + ' ' + lname;
                    profile_data.name = full_name;
                }
                return res.json({
                    status: 200,
                    error: false,
                    params: {
                        profile_info: profile_data
                    },
                    message: "Success"
                })
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request 2"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid Request 3"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"
        })
    }
}

async function getUserReferalInfo(req, res) {
    try {
        const { reffer, user_id } = req.body;
        if (reffer) {
            let profile_data = {};
            const user_data = await Users.findOne({ self_ref_code: reffer });
            if (user_data) {
                profile_data.user = user_data.user_id;
                profile_data.name = user_data.name;
                return res.json({
                    status: 200,
                    error: false,
                    profile_data,
                    message: "Success"
                })
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Your Refferal is not Valid or not active"
                })
            }
        } else if(user_id) {
            const user_data = await Users.findOne({ user_id: user_id });
            if (user_data) {
                self_ref_code = user_data.self_ref_code;
                return res.json({
                    status: 200,
                    error: false,
                    self_ref_code,
                    message: "Success"
                })
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Your Refferal is not Valid or not active"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid Request 3"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"
        })
    }
}
async function getReferals(req, res) {
    const User = require("../models/user");
    const KYC = require('../models/pending_kyc');
    const WebsiteSettings = require('../models/website_data');
    try {
        let user_id = req.body && req.body.user_id ? req.body.user_id : undefined;
        if (user_id && validateUserId(user_id)) {
            const website_data = await WebsiteSettings.findOne({});
            let referal_commision = website_data && website_data.referral_fee ? website_data.referral_fee : 0;
            let referal_coin = website_data && website_data.referral_coin ? website_data.referral_coin : 'INR';
            let user_data = await User.findOne({ user_id: user_id });
            console.log("user_data: ", user_data, user_id)
            let self_ref_code = user_data && user_data.self_ref_code ? user_data.self_ref_code : undefined;
            let total_earning = 0;
            let referal_list = [];
            if (self_ref_code) {
                let referal_users = await User.find({ parent_ref_code: self_ref_code });
                if (referal_users && referal_users.length > 0) {
                    let a = referal_users.map(async (d) => {
                        let kyc_info = await KYC.findOne({ user_id: d.user_id });
                        if (kyc_info) {
                            let status = kyc_info.status ? kyc_info.status : 0;
                            let name = (kyc_info.first_name ? kyc_info.first_name : '') + '' + (kyc_info.middle_name ? " " + kyc_info.middle_name : '') + '' + (kyc_info.last_name ? " " + kyc_info.last_name : '');
                            if (!name.replace(/\s\s+/g, ' ')) {
                                name = name ? name : kyc_info.email;
                            }
                            let obj = {
                                from_id: d.email,
                                valume: (status == 1 ? parseFloat(referal_commision) : 0),
                                wallet_type: referal_coin,
                                time: d.created_on,
                                name: name,
                                kyc_status: status
                            }
                            total_earning = total_earning + (status == 1 ? parseFloat(referal_commision) : 0);
                            referal_list.push(obj);
                        } else {
                            let obj = {
                                from_id: d.email,
                                valume: 0,
                                wallet_type: referal_coin,
                                time: d.created_on,
                                name: d.email,
                                kyc_status: 0
                            }
                            referal_list.push(obj);
                        }
                    })
                    let r = await Promise.all(a);
                    return res.json({
                        status: 200,
                        message: "success",
                        params: {
                            "referral_code": self_ref_code,
                            "total_referal_earning": total_earning,
                            "total_referals": referal_list
                        }
                    })
                } else {
                    return res.json({
                        status: 200,
                        message: "No referal found",
                        params: {
                            "referral_code": self_ref_code,
                            "total_referal_earning": total_earning,
                            "total_referals": referal_list
                        }
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    message: "Please verifie your KYC."
                })
            }
        } else {
            return res.json({
                status: 400,
                message: "Invalid request!"
            })
        }
    } catch (error) {
        console.log('Error from getReferals: ', error.message);
        return res.json({
            status: 400,
            message: "Something went wrong, plase try again!"
        })
    }
}
async function getAllReferalInfo(req, res) {
    const ReferalCommission = require("../models/user");
    try {
        const { action } = req.body;
        if (action == 'all_referal' ) {
            const all_referals = await ReferalCommission.aggregate( [
                { "$match": { 
                    referral_income: {$gt: 1}
                } }, 
                { 
                    $lookup: {
                        from: "pending_kyc",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "pending_kyc",
                    }
                },
                {
                    $replaceRoot: { 
                        newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$pending_kyc", 0 ] }, "$$ROOT" ] } 
                    }
                 },
                { 
                    $project: { 
                        first_name:1,last_name:1,middle_name:1 ,email: 1,symbol: 1, createdAt:1,referral_income:1,user_id:1,transection_id:1,status:1
                    } 
                }
            ] ).sort({"referral_income":-1});
            // const all_referals = await ReferalCommission.find({referral_income: {$gt: 1} }).sort({"referral_income":-1});
            let total_earned = totalwithdrawFees(all_referals,'referral_income','total');
            return res.json({
                status: 200,
                error: false,
                data: all_referals,
                total_earned: total_earned,
                message: "success"
            })
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"+error.message
        })
    }
}
async function getReferalInfo(req, res) {
    const ReferalCommission = require("../models/referral_commission");
    const User = require("../models/user");
    try {
        var { user_id } = req.body;
        if(!user_id){
           var { user_id }  = req.query;
        }
        if (user_id && validateUserId(user_id)) {
            const all_referals = await ReferalCommission.find({ user_id: user_id });
            const user_data           = await User.findOne({user_id:user_id})
            if (all_referals && Array.isArray(all_referals) && all_referals.length > 0) {
                const referalInfo = all_referals.map(async (referal) => {
                    let _referal = {};
                    _referal.from_id = referal._from;
                    _referal.valume = referal.commission;
                    _referal.wallet_type = referal.wallet_type;
                    _referal.time = referal.createdAt;
                    const kyc_info = await getUserFullNameFromUserId(referal._from);
                    _referal.name = kyc_info?kyc_info.name:'';
                    _referal.kyc_status = kyc_info?kyc_info.status:0;
                    return _referal;
                })
                Promise.all(referalInfo).then(function (results) {
                    if (results) {
                        let total_earning = 0;
                        results.map((d) => {
                            if (d) {
                                total_earning = parseFloat(total_earning) + parseFloat(d.valume);
                            }
                        })
                        return res.json({
                            status: 200,
                            error: false,
                            params: {
                                total_referal_earning: total_earning,
                                total_referals: results,
                                referral_code: user_data.self_ref_code
                            },
                            message: "Success"
                        })
                    } else {
                        return res.json({
                            status: 200,
                            error: false,
                            params: {
                                total_referal_earning: 0,
                                total_referals: [],
                                referral_code: user_data.self_ref_code
                            },
                            message: "No referal found"
                        })
                    }
                    /** */
                })
            } else {
                return res.json({
                    status: 200,
                    error: false, params: {
                        total_referal_earning: 0,
                        total_referals: [],
                        referral_code: user_data.self_ref_code
                    },
                    message: "No referal found"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                user_id: user_id,
                message: "Invalid request"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"
        })
    }
}
async function getUserFullNameFromUserId(user_id) {
    const KYC = require('../models/pending_kyc');
    // console.log("Time Satrt: ", Date.now())
    if (user_id && validateUserId(user_id)) {
        try {
            const name_data = await KYC.findOne({ user_id: user_id }, 'first_name middle_name last_name email status');
            
            if (name_data) {
                // console.log("Time End: ", Date.now())
                let name =  (name_data.first_name ? name_data.first_name : '') + '' + (name_data.middle_name ? " " + name_data.middle_name : '') + '' + (name_data.last_name ? " " + name_data.last_name : '');
                if(name.trim().length = 0){
                     name =  name_data?name_data.email: '';
                }
                return {name:name,status:name_data.status};
            } else {
                return undefined;
            }
        } catch (error) {
            return undefined;
        }
    } else {
        return undefined;
    }
}
async function getActiveKYC(req, res) {
    try {
        const KYCUser = require('../models/pending_kyc');
        const { action,kyc } = req.query;
        if(kyc){
            const data = await KYCUser.find({status:kyc},{first_name:1,middle_name:1,last_name:1,email:1,user_id:1});
            return res.json( {
                status: 200,
                table : data,
                message: 'success'
            } )
        }
        return res.json({
            status: 400,
            error: true,
            message: `Error! insufficient data`
        })
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function updateUserInfo(req, res) {
    try {
      const { user_id, mobile_no } = req.body;
      if (user_id) {
        const status = await updateUserProfile(user_id, mobile_no);
        if (status) {
          return res.json({
            status: 200,
            error: false,
            params: {
              user_id: user_id,
            },
            message: "Mobile NUmber Updated successfully",
          });
        } else {
          return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again",
          });
        }
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invalid request",
        });
      }
    } catch (error) {
      console.log("Error: from: src>controller>updateUserInfo.js: ", error.message);
      return res.json({
        status: 400,
        error: true,
        message: "Something went wrong, please try again!",
      });
    }
  }
async function getAllReferalNotKYC(req, res) {
    try {
      const {user_id, action } = req.body;
      if (action) {
        const result = await getReferrelNotKYC(user_id);
        return res.json({
          status: 200,
          error: false,
          result : result,
          message: "success",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invalid request",
        });
      }
    } catch (error) {
      console.log("Error: from: src>controller>getAllReferalNotKYC.js: ", error.message);
      return res.json({
        status: 400,
        error: true,
        message: "Something went wrong, please try again!"+error.message,
      });
    }
}
async function getUsersActivity(req, res) {
    try {
        const user_id = req.body && req.body.user_id ? req.body.user_id : undefined;
        if (user_id && validateUserId(user_id)) {
            const is_admin = await isAdmin(user_id);
            if (is_admin) { 
                const client_user_id = req.body.c_user_id ? req.body.c_user_id : undefined;
                if (client_user_id) {
                    let result = await getUserActivity(client_user_id);
                    if (result) {
                        return res.json({
                            status: 200,
                            error: false,
                            message: "Success",
                            params: {
                                info: result
                            }
                        })
                    } else {
                        return res.json({
                            status: 400,
                            error: true,
                            message: "No record found!"
                        })
                    }
                } else {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "No record found!!"
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request **"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request ***"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: error.message
        })
    }
}


async function getDashboardData(req, res) {
    try{
        const { user_id } = req.body;
        const user_data = await user.findOne({user_id:user_id});
        let data = {
            directs:user_data.directs,
            total_shiba : user_data.shiba_balance,
            total_babydoge: user_data.babydoge_balance,
            total_reffral_income: user_data.income_wallet
        }

    return res.json({
        status:200,
        data,
        message:"success"
    })
}catch(error) {
    console.log("error in getDashboard", error);
    return res.json({
        status:400,
        message:"Somthing Went Wrong!"
    })
}
}
module.exports = {
    searchUsers,
    kycUser,
    bankUser,
    updatekyc,
    updatebank,
    getUserProfile,
    getUserFullNameFromUserId,
    getReferalInfo,
    getAllReferalInfo,
    getActiveKYC,
    updateUserInfo,
    getReferals,
    getAllReferalNotKYC,
    getUsersActivity,
    getUserReferalInfo,
    getDashboardData
}