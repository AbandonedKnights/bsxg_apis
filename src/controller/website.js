const WebsiteData = require("../models/website_data");
const { validateUserId } = require("../utils/validator");
const { uploadImageAdmin } = require("../utils/functions.kyc");

async function getWebsiteData(req, res) {
  try {
      const item = await WebsiteData.findOne({});
      if (item) {
        let website_data = {
          commision_fee: item.commision_fee,
          maker_fee: item.maker_fee?item.maker_fee:0,
          taker_fee: item.taker_fee?item.taker_fee:0,
          website_name: item.website_name,
          bg_color: item.bg_color,
          bg_color_code: item.bg_color_code,
          website_title: item.website_title,
          website_short_name: item.website_short_name,
          website_disc: item.website_disc,
          support_email: item.support_email,
          contact_email: item.contact_email,
          info_email: item.info_email,
          noreply_email: item.noreply_email,
          about_us: item.about_us,
          logo_img_name: item.logo_img_name,
          favicon_img_name: item.favicon_img_name,
          slogo_img_name: item.slogo_img_name,
          logo_with_title: item.logo_with_title,
          cms_key: item.cms_key,
          rozarpay_key: item.rozarpay_key,
          msg91_smskey: item.msg91_smskey,
          msg91_emailkey: item.msg91_emailkey,
          wallet_password: item.wallet_password,
          referral_coin: item.referral_coin,
          referral_fee: item.referral_fee,
          airdrop_coin: item.airdrop_coin,
          airdrop_fee: item.airdrop_fee,
          site_url: "https://" + item.website_name + "/",
          stake:[
            {
              id:1,
              days:item.one_stake,
              percent:item.one_stake_percent+"%"
            },
            {
              id:2,
              days:item.second_stake,
              percent:item.second_stake_percent+"%"
            },
            {
              id:3,
              days:item.third_stake,
              percent:item.third_stake_percent+"%"
            },
            {
              id:4,
              days:item.fourth_stake,
              percent:item.fourth_stake_percent+"%"
            }
          ]
        };
        return res.json({
          status: 200,
          error: false,
          params: {
            website: website_data,
          },
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invalid Request",
        });
      }
    
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing went wrong, Please try again",
      err: error.message,
    });
  }
}

async function activityLog(req, res) {
  const ActivityLog = require("../models/activity_log");
  try {
    const { user_id, action } = req.body;

    // var ua = req.headers['user-agent'],
    // $ = {};

    // if (/mobile/i.test(ua))
    //     $.Mobile = true;

    // if (/like Mac OS X/.test(ua)) {
    //     $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
    //     $.iPhone = /iPhone/.test(ua);
    //     $.iPad = /iPad/.test(ua);
    // }

    // if (/Android/.test(ua))
    //     $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

    // if (/webOS\//.test(ua))
    //     $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];

    // if (/(Intel|PPC) Mac OS X/.test(ua))
    //     $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;

    // if (/Windows NT/.test(ua))
    //     $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];
    if (user_id && validateUserId(user_id) && action) {
      if (action == "set_report") {
        const ipaddr =
          req.header("x-forwarded-for") || req.connection.remoteAddress;
        console.log("user_agent2", req.headers["sec-ch-ua-platform"]);
        const sys_info = req.headers["sec-ch-ua-platform"];
        const dat = req.headers["sec-ch-ua"];
        const reg = /"[a-zA-Z "]*/i;
        const browser_info = dat.match(reg).toString();
        await ActivityLog.create({
          user_id: user_id,
          sys_info: sys_info.split('"').join(""),
          browser_info: browser_info.split('"').join(""),
          ip_address: ipaddr,
        });
        return res.json({
          status: 200,
          error: false,
          message: "insert successfully",
        });
      }
      if (action == "get_report") {
        // const activity_log = await ActivityLog.find({user_id:user_id});
        ActivityLog.find(
          {
            user_id: user_id, // Search Filters
          },
          ["sys_info", "browser_info", "ip_address", "createdAt"], // Columns to Return
          {
            skip: 0, // Starting Row
            limit: 10, // Ending Row
            sort: {
              createdAt: -1, //Sort by Date Added DESC
            },
          },
          function (err, activity_log) {
            return res.json({
              status: 200,
              error: false,
              params: {
                activity_log: activity_log,
              },
            });
          }
        );
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing Went Wrong, Please try again",
      err: error.message,
    });
  }
}

async function notificationDetails(req, res) {
  const NotificationInfo = require("../models/notification");
  try {
    const { user_id, action, name, msg, table_name, status } = req.body;
    if (user_id && validateUserId(user_id) && action) {
      if (action == "set") {
        await NotificationInfo.create({
          user_id: user_id,
          name: name,
          msg: msg,
          table_name: table_name,
        });
        return res.json({
          status: 200,
          error: false,
          message: "Insert Successfully!",
        });
      }
      if (action == "update") {
        await NotificationInfo.updateMany(
          { user_id: user_id },
          {
            $set: {
              seen_status: 1,
            },
          }
        );
        return res.json({
          status: 200,
          error: false,
          message: "updated Successfully!",
        });
      }
      if (action == "get") {
        await NotificationInfo.updateMany(
          { user_id: user_id },
          {
            $set: {
              seen_status: 1,
            },
          }
        );
        const notification_data = await NotificationInfo.find({
          user_id: user_id,
        });
        if (notification_data) {
          return res.json({
            status: 200,
            error: false,
            params: {
              notification: notification_data,
            },
            message: "data fetch!",
          });
        } else {
          return res.json({
            status: 400,
            error: true,
            message: "data Not fetch!",
          });
        }
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing Went Wrong, Please try again",
      err: error.message,
    });
  }
}

async function updateWebsite(req, res) {
  const User = require("../models/user");
  try {
    const { user_id, data } = req.body;
    let _data = JSON.parse(data);
    const admin_data = await User.findOne({ user_id: user_id, user_role: 2 });
    if (admin_data) {
      const old_data = await WebsiteData.findOne({});
      if (old_data) {
        const _support_email = _data.support_email
          ? _data.support_email
          : old_data.support_email;
        const _contact_email = _data.contact_email
          ? _data.contact_email
          : old_data.contact_email;
        const _info_email = _data.info_email
          ? _data.info_email
          : old_data.info_email;
        const _noreply_email = _data.noreply_email
          ? _data.noreply_email
          : old_data.noreply_email;
        const _website_title = _data.website_title
          ? _data.website_title
          : old_data.website_title;
        const _website_short_name = _data.website_sort_name
          ? _data.website_sort_name
          : old_data.website_short_name;
        if (req.files && req.files.logo) {
          const url = await uploadImageAdmin(req.files.logo, false, "logo.png");
          console.log("url", url);
        }
        if (req.files && req.files.sort_logo) {
          const url1 = await uploadImageAdmin(
            req.files.sort_logo,
            false,
            "logo_short.png"
          );
          console.log("url", url1);
        }
        if (req.files && req.files.favicon) {
          const url2 = await uploadImageAdmin(
            req.files.favicon,
            false,
            "favicon.png"
          );
          console.log("url", url2);
        }
        if (
          _support_email &&
          _contact_email &&
          _info_email &&
          _noreply_email &&
          _website_title &&
          _website_short_name
        ) {
          await WebsiteData.updateOne(
            {},
            {
              $set: {
                support_email: _support_email,
                contact_email: _contact_email,
                info_email: _info_email,
                noreply_email: _noreply_email,
                website_title: _website_title,
                website_short_name: _website_short_name,
              },
            }
          );
          return res.json({
            status: 200,
            error: false,
            message: "update Successfully",
          });
        } else {
          return res.json({
            status: 400,
            error: true,
            message: "Please Fill All Record",
          });
        }
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Website Data not Found",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing went Wrong, Please try Again!!",
      err: error.message,
    });
  }
}

async function updateKey(req, res) {
  const User = require("../models/user");
  try {
    const { user_id, cmc_key, rozarpay_key, msg_key, msg_email_key } = req.body;
    const admin_data = await User.findOne({ user_id: user_id, user_role: 2 });
    if (admin_data) {
      const old_data = await WebsiteData.findOne({});
      if (old_data) {
        const _cmc_key = cmc_key ? cmc_key : old_data.cms_key;
        const _rozarpay_key = rozarpay_key
          ? rozarpay_key
          : old_data.rozarpay_key;
        const _msg_key = msg_key ? msg_key : old_data.msg91_smskey;
        const _msg_email_key = msg_email_key
          ? msg_email_key
          : old_data.msg91_emailkey;
        if (_cmc_key && _rozarpay_key && _msg_key && _msg_email_key) {
          await WebsiteData.updateOne(
            {},
            {
              $set: {
                cms_key: _cmc_key,
                rozarpay_key: _rozarpay_key,
                msg91_smskey: _msg_key,
                msg91_emailkey: _msg_email_key,
              },
            }
          );
          return res.json({
            status: 200,
            error: false,
            message: "update Successfully",
          });
        } else {
          return res.json({
            status: 400,
            error: true,
            message: "Please Fill All Record",
          });
        }
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Website Data not Found",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing went Wrong, Please try Again!!",
      err: error.message,
    });
  }
}

async function updateStake(req, res) {
  const User = require("../models/user");
  try {
    const { user_id, one_stake, one_stake_per, second_stake, second_stake_per, third_stake, third_stake_per, fourth_stake, fourth_stake_per } = req.body;
    const admin_data = await User.findOne({ user_id: user_id, user_role: 2 });
    if (admin_data) {
      const old_data = await WebsiteData.findOne({});
      if (old_data) {
        const _one_stake = one_stake ? one_stake : old_data.one_stake;
        const _one_stake_per = one_stake_per ? one_stake_per : old_data.one_stake_percent;
        const _second_stake = second_stake ? second_stake : old_data.second_stake;
        const _second_stake_per = second_stake_per ? second_stake_per : old_data.second_stake_percent;
        const _third_stake = third_stake ? third_stake : old_data.third_stake;
        const _third_stake_per = third_stake_per ? third_stake_per : old_data.third_stake_percent;
        const _fourth_stake = fourth_stake ? fourth_stake : old_data.fourth_stake;
        const _fourth_stake_per = fourth_stake_per ? fourth_stake_per : old_data.fourth_stake_percent;
        
        if (_one_stake && _one_stake_per && _second_stake && _second_stake_per && _third_stake && _third_stake_per && _fourth_stake && _fourth_stake_per) {
          await WebsiteData.updateOne(
            {},
            {
              $set: {
                one_stake: _one_stake,
                second_stake: _second_stake,
                third_stake: _third_stake,
                fourth_stake: _fourth_stake,
                one_stake_percent: _one_stake_per,
                second_stake_percent: _second_stake_per,
                third_stake_percent: _third_stake_per,
                fourth_stake_percent: _fourth_stake_per,
              },
            }
          );
          return res.json({
            status: 200,
            error: false,
            message: "update Successfully",
          });
        } else {
          return res.json({
            status: 400,
            error: true,
            message: "Please Fill All Record",
          });
        }
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Website Data not Found",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing went Wrong, Please try Again!!",
      err: error.message,
    });
  }
}
async function stakeHistory(req, res) {
  const User = require("../models/user");
  const StakingHistory = require("../models/staking_history");
  try {
    const { admin_user_id } = req.query;
    const admin_data = await User.findOne({ user_id: admin_user_id, user_role: 2 });
    if (admin_data) {
      const staking_data = await StakingHistory.aggregate([
        {
            $lookup: {
                from: "user",
                localField: "user_id",
                foreignField: "user_id",
                as: "User",
            }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ["$User", 0] }, "$$ROOT"],
            },
          },
        },
        {
          $project: {
            wallet_type: 1,
            user_id: 1,
            harvest: 1,
            type: 1,
            createdAt: 1,
            email: 1
          }
        }
    ]).sort({ createdAt: -1 });
      if (staking_data) {
        return res.json({
          status: 200,
          error: false,
          result: staking_data,
          message: "success",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Website Data not Found",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing went Wrong, Please try Again!!",
      err: error.message,
    });
  }
}
async function getUser(req, res) {
    const User = require("../models/user");
    try {
      const { user_id } = req.body;
      const user_data = await User.findOne({user_id: user_id, user_role: {$in:[1, 2]}})
      if(user_id && user_data){
          const user_info = await User.find({user_role: {$in:[1, 2]}});
          let result = [];
          user_info.map((item) =>{
              if(user_id !== item.user_id) {
                result.push({
                    user_id: item.user_id,
                    email: item.email
                })
            }
          })
          return res.json({
              status: 200,
              result: result,
              len: result.length,
              message: "success",
              error: false
          })
      } else {
          return res.json({
              status: 400,
              message: "Invalid Request",
              error: true
          })
      }
  
  
    } catch (error) {
        return res.json({
            status: 400,
            message: "something went Wrong!",
            error: true,
            err: error.message
        })
    }
}

async function getUserChat(user_id, _from) {
  const Chat = require("../models/chat");
  const User = require("../models/user");
  try {
    const { user_id } = req.body;
    const user_data = await User.findOne({user_id: user_id, user_role: {$in:[1, 2]}})
    if(user_id && user_data){
        const sendChat = await Chat.find({user_id: user_id});
        let send = [];
        sendChat.map(async(item)=>{
            send.push({
                user_id: item.user_id,
                _from: item._from,
                message: item.message,
                type: "send",
                time: item.createdAt
            })
        })
        let recieve = [];
        const recievChat = await Chat.find({_from: _from});
        recievChat.map(async(item)=>{
            recieve.push({
                user_id: item.user_id,
                _from: item._from,
                message: item.message,
                type: "recieve",
                time: item.createdAt
            })
        })
        let result = [...send, ...recieve].sort(
            (a, b) => new Date(b.time) - new Date(a.time)
          );
        console.log("sendChat", result);
        return res.json({
            status: 200,
            result: result,
            message: "success",
            error: false
        })
    } else {
        return res.json({
            status: 400,
            message: "Invalid Request",
            error: true
        })
    }


  } catch (error) {
      return res.json({
          status: 400,
          message: "something went Wrong!",
          error: true,
          err: error.message
      })
  }
}


async function getChat(req, res) {
  const Chat = require("../models/chat");
  const User = require("../models/user");
  try {
    const { user_id, _from } = req.body;
    const user_data = await User.findOne({user_id: user_id, user_role: {$in:[1, 2]}})
    if(user_id && user_data){
        const sendChat = await Chat.find({user_id: user_id, _from: _from});
        let send = [];
        sendChat.map(async(item)=>{
            send.push({
                user_id: item.user_id,
                _from: item._from,
                message: item.message,
                type: "send",
                time: item.createdAt
            })
        })
        let recieve = [];
        const recievChat = await Chat.find({user_id: _from, _from: user_id});
        recievChat.map(async(item)=>{
            recieve.push({
                user_id: item.user_id,
                _from: item._from,
                message: item.message,
                type: "recieve",
                time: item.createdAt
            })
        })
        let result = [...send, ...recieve].sort(
            (a, b) => new Date(a.time) - new Date(b.time)
          );
        return res.json({
            status: 200,
            result: result,
            message: "success",
            error: false
        })
    } else {
        return res.json({
            status: 400,
            message: "Invalid Request",
            error: true
        })
    }


  } catch (error) {
      return res.json({
          status: 400,
          message: "something went Wrong!",
          error: true,
          err: error.message
      })
  }
}

async function setChat(req, res) {
    const Chat = require("../models/chat");
    const User = require("../models/user");
    try {
      const {user_id, message, _from } = req.body;
      const send_user = await User.findOne({user_id: user_id, user_role: {$in:[1, 2]}})
      const recive_user = await User.findOne({user_id:_from, user_role: {$in:[1, 2]}})
      if(user_id && send_user && recive_user){
        await Chat.create({user_id:user_id, _from: _from, message:message});
          return res.json({
              status: 200,
              user_id: user_id,
              msg: message,
              error: false,
              message: "success"
          })
      } else {
          return res.json({
              status: 400,
              message: "Invalid Request",
              error: true
          })
      }
  
  
    } catch (error) {
        return res.json({
            status: 400,
            message: "something went Wrong!",
            error: true,
            err: error.message
        })
    }
}
module.exports = {
  getWebsiteData,
  activityLog,
  notificationDetails,
  updateWebsite,
  updateKey,
  setChat,
  getChat,
  getUser,
  updateStake,
  stakeHistory
};
