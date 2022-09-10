const TradeHistory = require("../models/trade_history");
const DepositeHistory = require("../models/deposite_history");
const withdrawHistory = require("../models/withdraw_history");
const FundTransfer = require("../models/fundtranfer_history");
const CryptoTransfer = require("../models/crypto_transaction_history");
const Wallets = require("../models/wallets");
const {
  getTradeHistory,
  getDepositHistory,
  getWithdrawHistory,
  getWalletBalance,
  getOrderHistory,
  userFundTransfer,
} = require("../utils/function.wallets");
const {
  validateUserId,
  totalTradeCommission,
  totalwithdrawFees,
} = require("../utils/validator");
const { sendDepositStatus, sendWithdrawStatus } = require("../utils/mailer");
const { toFixed } = require("../utils/functions");

exports.trade_history = async (req, res) => {
  const body = req.body;
  let parmas = {};
  if (body.history_id) {
    parmas.history_id = body.history_id;
  }
  if (body.currency) {
    parmas.currency_type = body.currency;
  }
  if (body.compare_currency) {
    parmas.compare_currency = body.compare_currency;
  }
  if (body.price) {
    parmas.price = body.price;
  }
  if (body.trade_date) {
    parmas.trade_date = body.trade_date;
  }
  if (body.sell_user_id) {
    parmas.sell_user_id = body.sell_user_id;
  }
  if (body.buy_user_id) {
    parmas.buy_user_id = body.buy_user_id;
  }
  if (body.buy_order_id) {
    parmas.buy_order_id = body.buy_order_id;
  }
  if (body.sell_order_id) {
    parmas.sell_order_id = body.sell_order_id;
  }
  if (body.trade_type) {
    parmas.trade_type = body.trade_type;
  }
  try {
    // if (parmas.length > 0) {
    history = await TradeHistory.find(parmas);
    return res.json({
      status: 200,
      history,
    });
    // }
  } catch {
    console.log(
      "Error: >from: controller> trade > trade_history > try: ",
      error.message
    );
    res.status(400).json({ message: `${error}` });
  }
};

exports.deposite_history = async (req, res) => {
  const body = req.body;
  console.log(body);
  let parmas = {};
  if (body.id) {
    parmas.id = body.id;
  }
  if (body.tx_id) {
    parmas.tx_id = body.tx_id;
  }
  if (body.symbol) {
    parmas.symbol = body.symbol;
  }
  if (body.blockNumber) {
    parmas.blockNumber = body.blockNumber;
  }
  if (body.status) {
    parmas.status = body.status;
  }
  if (body.value) {
    parmas.value = body.value;
  }
  if (body.from_address) {
    parmas.from_address = body.from_address;
  }
  if (body.buy_order_id) {
    parmas.buy_order_id = body.buy_order_id;
  }
  if (body.to_address) {
    parmas.to_address = body.to_address;
  }
  if (body.type) {
    parmas.type = body.type;
  }
  try {
    // if (parmas.length > 0) {
    history = await DepositeHistory.aggregate([
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
          amount: 1,
          user_id: 1,
          transection_id: 1,
          status: 1,
        },
      },
    ]).sort({ createdAt: -1 });
    return res.json({
      status: 200,
      history,
    });
    // }
  } catch {
    console.log(
      "Error: >from: controller> trade > deposite_history > try: ",
      error.message
    );
    res.status(400).json({ message: `${error}` });
  }
};

exports.withdraw_history = async (req, res) => {
  const WithdrawHistory = require("../models/withdraw_history");
  const Currency = require("../models/suppoted_currency");
  const { action } = req.body;
  try {
    let result = (total_fees = currencylist = "");
    if (action == "fees") {
      result = await WithdrawHistory.find({ withdrawal_fee: { $gt: 0 } }).sort({
        createdAt: -1,
      });
      currencylist = await Currency.find().sort({ token_type: -1 });
      total_fees = totalwithdrawFees(result, "withdrawal_fee", "symbol");
    } else {
      result = await WithdrawHistory.find({ status: { $in: [1, -2] } }).sort({
        createdAt: -1,
      });
    }
    return res.json({
      status: 200,
      message: "success",
      error: false,
      result: result,
      total_fees: total_fees,
      currency: currencylist,
    });
  } catch (error) {
    console.log(
      "Error: >from: function.history.js > withdraw_history > try: ",
      error.message
    );
    return 0;
  }
};

exports.fundtranfer_history = async (req, res) => {
  const body = req.body;
  // console.log(body)
  let parmas = {};
  if (body.to_user) {
    parmas.to_user = body.to_user;
  }
  if (body.from_user) {
    parmas.from_user = body.from_user;
  }
  if (body.wallet_type) {
    parmas.wallet_type = body.wallet_type;
  }
  if (body.amount) {
    parmas.amount = body.amount;
  }
  if (body.date) {
    parmas.date = body.date;
  }
  if (body.time) {
    parmas.time = body.time;
  }

  try {
    // if (parmas.length > 0) {
    history = await FundTransfer.aggregate([
      {
        $lookup: {
          from: "pending_kyc",
          localField: "to_user",
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
          wallet_type: 1,
          amount: 1,
          createdAt: 1,
          user_id: 1,
        },
      },
    ]).sort({ createdAt: -1 });

    return res.json({
      status: 200,
      history,
    });
    // }
  } catch (error) {
    console.log(
      "Error: >from: controller > fundtranfer_history > try: ",
      error.message
    );
    res.status(400).json({ message: `${error}` });
  }
};

exports.crypto_transaction_history = async (req, res) => {
  const body = req.body;
  console.log(body);
  let parmas = {};
  if (body._type) {
    parmas._type = body._type;
  }
  if (body.user_id) {
    parmas.user_id = body.user_id;
  }
  if (body.wallet_type) {
    parmas.wallet_type = body.wallet_type;
  }
  if (body.from_wallet) {
    parmas.from_wallet = body.from_wallet;
  }
  if (body.to_wallet) {
    parmas.to_wallet = body.to_wallet;
  }
  if (body.amount) {
    parmas.amount = body.amount;
  }
  if (body.transaction_date) {
    parmas.transaction_date = body.transaction_date;
  }
  if (body.transaction_time) {
    parmas.transaction_time = body.transaction_time;
  }
  if (body.transaction_id) {
    parmas.transaction_id = body.transaction_id;
  }
  if (body.remark) {
    parmas.remark = body.remark;
  }
  if (body.status) {
    parmas.status = body.status;
  }
  if (body.check_sum) {
    parmas.check_sum = body.check_sum;
  }
  try {
    // if (parmas.length > 0) {
    history = await CryptoTransfer.find(parmas);
    return res.json({
      status: 200,
      history,
    });
    // }
  } catch {
    console.log(
      "Error: >from: controller> trade > deposite_history > try: ",
      error.message
    );
    res.status(400).json({ message: `${error}` });
  }
};

exports.depositHistory = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      let deposit = await getDepositHistory(user_id);
      let result = [...deposit].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      if (result) {
        return res.json({
          status: 200,
          error: false,
          params: {
            deposit: result,
          },
          message: "data fetch!!",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message:
            "Something went wrong, please try again Withdraw history Not Found!!",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.withdrawHistory = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      let withdraw = await getWithdrawHistory(user_id);
      let result = [...withdraw].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      if (result) {
        return res.json({
          status: 200,
          error: false,
          params: {
            withdraw: result,
          },
          message: "data fetch!!",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message:
            "Something went wrong, please try again Withdraw history Not Found!!",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.tradeHistory = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      let result = await getTradeHistory(user_id);
      // let result = [...trade].sort((a, b) =>  new Date(b.createdAt) - new Date(a.createdAt));
      if (result) {
        return res.json({
          status: 200,
          error: false,
          params: {
            trade: result,
          },
          message: "data fetch!!",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message:
            "Something went wrong, please try again Withdraw history Not Found!!",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.orderHistory = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      let result = await getOrderHistory(user_id);
      // let result = [...trade].sort((a, b) =>  new Date(b.createdAt) - new Date(a.createdAt));
      if (result) {
        return res.json({
          status: 200,
          error: false,
          params: {
            order: result,
          },
          message: "data fetch!!",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message:
            "Something went wrong, please try again Withdraw history Not Found!!",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.fundHistory = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      const wallet = await Wallets.find({ user: user_id });
      var wallet_data = [];
      let a = wallet.map(async (item) => {
        const b_balance = await getWalletBalance(
          item.wallet_address,
          item.wallet_type,
          item.contract_address,
          item.type
        );
        wallet_data.push({
          wallet_address: item.wallet_address,
          wallet_type: item.wallet_type,
          b_balance: b_balance,
          balance: item.balance,
          locked: item.locked,
        });
        return "hi";
      });
      Promise.all(a).then((_a) => {
        return res.json({
          status: 200,
          error: false,
          params: {
            wallet: wallet_data,
          },
          message: "data fetch",
        });
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
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};
exports.fundUserTransfer = async (req, res) => {
  try {
    const { user_id, wallet_address, wallet_type } = req.body;
    if (user_id && validateUserId(user_id)) {
      const wallet = await Wallets.findOne({
        user: user_id,
        wallet_address: wallet_address,
        wallet_type: wallet_type,
      });
      const status = await userFundTransfer(
        wallet_address,
        wallet.private_key,
        wallet_type,
        wallet.contract_address,
        wallet.type
      );
      if (status) {
        await Wallets.updateMany(
          { _id: wallet._id },
          {
            $set: {
              v_balanace: 0,
              ac_balance: 0,
              ac_transfer_last_update: Date.now(),
            },
          }
        );
        return res.json({
          status: 200,
          error: false,
          message: "Fund Transfer SuccessFully",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Failed to Transfer",
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
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};
function totalCommision(wallets, index) {
  let newAR = {};
  let pushVal = [];
  wallets.map((item) => {
    item.wallet.map((i2) => {
      let wt = i2.currency_type;
      let tl = i2[index].split("+");
      let bl = i2[index] ? parseFloat(tl[0]) + parseFloat(tl[1]) : 0;
      if (pushVal.includes(wt)) {
        let nl = parseFloat(newAR[wt]) + parseFloat(bl);
        newAR[wt] = isFloat(nl) ? nl.toFixed(2) : nl;
      } else {
        pushVal.push(wt);
        newAR[wt] = bl;
      }
    });
  });
  return newAR;
}
exports.tradeCommission = async (req, res) => {
  try {
    const { commission_fee } = req.body;
    if (commission_fee) {
      result = await TradeHistory.find({ status: 1 });
      total_fees = totalTradeCommission(result, "commition_fee");
      return res.json({
        status: 200,
        total_fees: total_fees,
        error: false,
        message: "success",
      });
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid  request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};
exports.withdrawalCommision = async (req, res) => {
  const { commission_fee } = req.body;
  try {
    let result = (total_fees = currencylist = "");
    if (commission_fee) {
      result = await withdrawHistory
        .find({ withdrawal_fee: { $gt: 0 } })
        .sort({ createdAt: -1 });
      total_fees = totalwithdrawFees(result, "withdrawal_fee", "symbol");
    }
    return res.json({
      status: 200,
      message: "success",
      error: false,
      total_fees: total_fees,
    });
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.depositInrHistory = async (req, res) => {
  const DepositHistory = require("../models/deposite_history");
  const User = require("../models/user");
  try {
    const { user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      const user_data = await User.findOne({ user_id: user_id, user_role: 2 });
      if (user_data) {
        const deposit_data = await DepositHistory.find({ symbol: "INR" });
        let result = [...deposit_data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        return res.json(result);
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invaild Request",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.changeDepositStatus = async (req, res) => {
  const DepositHistory = require("../models/deposite_history");
  const walletData = require("../models/wallets");
  const User = require("../models/user");
  try {
    const { admin_user_id, user_id, transaction_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      const user_data = await User.findOne({
        user_id: admin_user_id,
        user_role: 2,
      });
      if (user_data) {
        const deposit_data = await DepositHistory.findOne({
          user_id: user_id,
          transection_id: transaction_id,
          status: false,
        });
        const amount = deposit_data.amount ? parseInt(deposit_data.amount) : 0;
        const wallet_data = await walletData.findOne({
          user: user_id,
          wallet_type: "INR",
        });
        const bal = wallet_data.balance ? parseInt(wallet_data.balance) : 0;
        walletData
          .updateOne(
            { user: user_id, wallet_type: "INR" },
            {
              $set: {
                balance: bal + amount,
              },
            }
          )
          .then(() => {
            DepositHistory.updateOne(
              {
                user_id: user_id,
                transection_id: transaction_id,
                status: false,
              },
              {
                $set: {
                  status: true,
                },
              }
            ).then(() => {
              return res.json({
                status: 200,
                error: false,
                message: "approved Successfully",
              });
            });
          })
          .catch((error) => {
            return res.json({
              status: 400,
              error: true,
              message: "Invaild Request",
              err: error.message,
            });
          });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invaild Request",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.deleteDepositUser = async (req, res) => {
  const DepositHistory = require("../models/deposite_history");
  const User = require("../models/user");
  try {
    const { admin_user_id, transaction_id, amount, user_id } = req.body;
    if (user_id && validateUserId(user_id)) {
      const admin_data = await User.findOne({
        user_id: admin_user_id,
        user_role: 2,
      });
      if (admin_data) {
        const deposit_data = await DepositHistory.findOne({
          user_id: user_id,
          transection_id: transaction_id,
          symbol: "INR",
        });
        DepositHistory.deleteOne({
          user_id: user_id,
          transection_id: transaction_id,
          symbol: "INR",
          status: false,
        })
          .then(() => {
            sendRejectionUserDeposit(
              deposit_data.from_address,
              amount,
              "Not a Proper Record",
              2
            );
            return res.json({
              status: 200,
              error: false,
              message: "Deleted Successfully",
            });
          })
          .catch((error) => {
            return res.json({
              status: 400,
              error: true,
              message: "Invaild Request",
              err: error.message,
            });
          });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invaild Request",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};
exports.depositInrBullsiexHistory = async (req, res) => {
  const DepositHistory = require("../models/inr_history");
  try {
    const { user_id, type } = req.body;
    if (user_id && validateUserId(user_id)) {
      if (type == "deposit") {
        const deposit_data = await DepositHistory.find({
          symbol: "INR",
          type: "Deposit",
        });
        let result = [...deposit_data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        return res.json({
          status: 200,
          error: false,
          result: result,
          message: "Success",
        });
      } else if (type == "withdraw") {
        result = await DepositHistory.aggregate([
          {
            $match: {
              symbol: "INR",
              type: "withdrawal",
            },
          },
          {
            $lookup: {
              from: "user_bank_details",
              localField: "user_id",
              foreignField: "user_id",
              as: "bank_detail",
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [
                  { $arrayElemAt: ["$bank_detail", 0] },
                  "$$ROOT",
                ],
              },
            },
          },
          {
            $project: {
              user_id: 1,
              email: 1,
              amount: 1,
              name: 1,
              mobile_no: 1,
              bank_name: 1,
              account_number: 1,
              ifsc: 1,
              password: 1,
              status: 1,
              createdAt: 1,
            },
          },
        ]).sort({ createdAt: -1 });
        return res.json({
          status: 200,
          error: false,
          result: result,
          message: "Success",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild Request",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.changeBullsiexDepositStatus = async (req, res) => {
  const DepositHistory = require("../models/inr_history");
  const walletData = require("../models/wallets");
  const User = require("../models/user");
  try {
    const { admin_user_id, user_id, transaction_id, type, email, amount } =
      req.body;
    if (user_id && validateUserId(user_id)) {
      const user_data = await User.findOne({
        user_id: admin_user_id,
        user_role: 2,
      });
      if (user_data) {
        const deposit_data = await DepositHistory.findOne({
          user_id: user_id,
          transection_id: transaction_id,
          status: 0,
        });
        const amount = deposit_data.amount ? parseInt(deposit_data.amount) : 0;
        const wallet_data = await walletData.findOne({
          user: user_id,
          wallet_type: "INR",
        });
        const bal = wallet_data.balance ? parseInt(wallet_data.balance) : 0;
        if (type == "deposit") {
          await walletData.updateOne(
            { user: user_id, wallet_type: "INR" },
            {
              $set: {
                balance: bal + amount,
              },
            }
          );
          sendDepositStatus(email, amount, "Your Deposit Is succussful", 1);
        } else if (type == "withdraw") {
          sendWithdrawStatus(email, amount, "Your Withdraw Is succussful", 1);
        }
        DepositHistory.updateOne(
          { user_id: user_id, transection_id: transaction_id, status: 0 },
          {
            $set: {
              status: 1,
            },
          }
        )
          .then(() => {
            return res.json({
              status: 200,
              error: false,
              message: "approved Successfully",
            });
          })
          .catch((error) => {
            return res.json({
              status: 400,
              error: true,
              message: "Invaild Request",
              err: error.message,
            });
          });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invaild Request",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.rejectBullsiexDepositStatus = async (req, res) => {
  const DepositHistory = require("../models/inr_history");
  const User = require("../models/user");
  const walletData = require("../models/wallets");
  try {
    const { admin_user_id, user_id, transaction_id, amount, type, email } =
      req.body;
    if (user_id && validateUserId(user_id)) {
      const user_data = await User.findOne({
        user_id: admin_user_id,
        user_role: 2,
      });
      if (user_data) {
        const wallet_data = await walletData.findOne({
          user: user_id,
          wallet_type: "INR",
        });
        const bal = wallet_data.balance ? parseInt(wallet_data.balance) : 0;
        if (type == "deposit") {
          sendDepositStatus(email, amount, "Your Record Found Wrong!", 2);
        } else if (type == "withdraw") {
          await walletData.updateOne(
            { user: user_id, wallet_type: "INR" },
            {
              $set: {
                balance: bal + parseInt(amount),
              },
            }
          );
          sendWithdrawStatus(email, amount, "Your Record Found Wrong!", 2);
        }
        DepositHistory.updateOne(
          { user_id: user_id, transection_id: transaction_id, status: 0 },
          {
            $set: {
              status: -2,
            },
          }
        ).then(() => {
          return res.json({
            status: 200,
            error: false,
            message: "Reject Successfully",
          });
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invaild Request",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invaild",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again",
      errorM: error.message,
    });
  }
};

exports.dashBoardData = async (req, res) => {
  const TotalUser = require("../models/user");
  const SupportedCurrency = require("../models/suppoted_currency");
  const AirdropCommission = require("../models/airdrop_commission");
  const ReferralCommission = require("../models/referral_commission");
  const PairedCurrency = require("../models/paired_currency");
  try {
    console.log("called");
    const pairedCur = await PairedCurrency.find({ status: true });
    let users = {};
    // user deatls
    users.allUsers = await TotalUser.find({ user_role: 0 }).count();
    users.approvedKyc = await TotalUser.find({
      is_kyc_verified: 1,
      user_role: 0,
    }).count();
    users.pendingKyc = await TotalUser.find({
      is_kyc_verified: 0,
      user_role: 0,
    }).count();
    users.rejectKyc = await TotalUser.find({
      is_kyc_verified: 2,
      user_role: 0,
    }).count();
    users.approvedBank = await TotalUser.find({
      is_bank_verified: 1,
      user_role: 0,
    }).count();
    users.pendingBank = await TotalUser.find({
      is_bank_verified: 0,
      user_role: 0,
    }).count();
    users.rejectBank = await TotalUser.find({
      is_bank_verified: 2,
      user_role: 0,
    }).count();
    const airdropbalance = await AirdropCommission.aggregate([
      { $group: { _id: "$wallet_type", TotalSum: { $sum: "$commission" } } },
    ]);
    let airdrop = {};
    if (Array.isArray(airdropbalance) && airdropbalance.length) {
      airdrop.airdopcoin = airdropbalance[0]._id;
      airdrop.total = airdropbalance[0].TotalSum;
    }
    const referralbalance = await ReferralCommission.aggregate([
      { $group: { _id: "$wallet_type", TotalSum: { $sum: "$commission" } } },
    ]);
    let referral = {};
    if (Array.isArray(referralbalance) && referralbalance.length) {
      referral.referralcoin = referralbalance[0]._id;
      referral.total = referralbalance[0].TotalSum;
    }
    let funds = [];
    let tradeFunds = [];
    const currency_info = await SupportedCurrency.find({});
    const a = currency_info.map(async (item) => {
      const dt = await getFund(item.symbol, item.icon);
      if (item.symbol !== "INR") {
        let td = await getTradeFund(item.symbol);

        tradeFunds.push(td);
      }
      funds.push(dt);
    });
    Promise.all(a).then((b) => {
      let tf = formatArray(tradeFunds, currency_info);
      return res.json({
        status: 200,
        users: users,
        funds: funds,
        airdrop: airdrop,
        referral: referral,
        tradeFunds: tf,
        pairedCur: pairedCur,
        error: false,
        message: "success",
      });
    });
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      result: error.message,
      message: "Somthing went wrong!",
    });
  }
};

async function getFund(symbol, icon) {
  const inbalance = await Wallets.aggregate([
    { $match: { wallet_type: symbol } },
    { $group: { _id: "$wallet_type", TotalSum: { $sum: "$balance" } } },
  ]);
  return {
    symbol: symbol,
    icon: icon,
    total:
      Array.isArray(inbalance) && inbalance.length
        ? inbalance[0].TotalSum > 0
          ? inbalance[0].TotalSum.toFixed(6)
          : inbalance[0].TotalSum
        : 0,
  };
}

async function getTradeFund(symbol) {
  const TradeHistory = require("../models/trade_history");
  let result = await TradeHistory.aggregate([
    {
      $match: {
        currency_type: symbol.toLowerCase(),
      },
    },
    {
      $group: {
        _id: "$compare_currency",
        TotalSum: { $sum: "$volume" },
        symbol: { $first: "$currency_type" },
      },
    },
  ]);
  return result;
}
function formatArray(arr, supported_currency) {
  try {
    let v = [];
    let final_arr = supported_currency.map(async (c) => {
      let data = arr.filter((d) => {
        if (d[0] && d[0].symbol == c.symbol.toLowerCase()) return d;
      });
      if (data && data[0] && data[0].length > 0) {
        let obj_arr = [];
        for (let i = 0; i < data[0].length; i++) {
          let obj = {
            compare_currency: data[0][i]._id.toUpperCase(),
            symbol: data[0][i].symbol.toUpperCase(),
            icon: c.icon,
            total: data[0][i].TotalSum,
          };
          obj_arr.push(obj);
        }
        // return obj_arr;
        v.push(obj_arr);
      } else {
        let obj = {
          symbol: c.symbol,
          icon: c.icon,
          total: 0,
        };
        // return [obj];
        v.push([obj]);
      }
    });
    return v;
  } catch (error) {
    return [];
  }
}

/*
*** 
how get RY Formula 
let onesecondry = (amount*percent/100+amount)/totalSecond
let userry =onesecondry*userStaketotalsecond
**
*/
exports.getStake = async (req, res) => {
  const Wallets = require("../models/wallets");
  const websiteData = require("../models/website_data");
  try {
    const { user_id } = req.body;
    const website_data = await websiteData.findOne({});
    if (user_id) {
      const wallet_data = await Wallets.findOne({
        user: user_id,
        wallet_type: "USDT",
      });
      const dt = await getStakeData(user_id);
      let staking_data = {
        balance: wallet_data.balance,
        one_stake: website_data.one_stake,
        second_stake: website_data.second_stake,
        third_stake: website_data.third_stake,
        fourth_stake: website_data.fourth_stake,
        one_stake_percent: website_data.one_stake_percent,
        second_stake_percent: website_data.second_stake_percent,
        third_stake_percent: website_data.third_stake_percent,
        fourth_stake_percent: website_data.fourth_stake_percent,
        one_daily_ry: dt.total_ry_1,
        second_daily_ry: dt.total_ry_2,
        third_daily_ry: dt.total_ry_3,
        fourth_daily_ry: dt.total_ry_4,
        one_total_stak: dt.total_stak_1,
        second_total_stak: dt.total_stak_2,
        third_total_stak: dt.total_stak_3,
        fourth_total_stak: dt.total_stak_4,
        total:dt.total
      };
      if (wallet_data) {
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
          message: "Invalid Request*",
        });
      }
    } else {
      let staking_data = {
        one_stake: website_data.one_stake,
        second_stake: website_data.second_stake,
        third_stake: website_data.third_stake,
        fourth_stake: website_data.fourth_stake,
        one_stake_percent: website_data.one_stake_percent,
        second_stake_percent: website_data.second_stake_percent,
        third_stake_percent: website_data.third_stake_percent,
        fourth_stake_percent: website_data.fourth_stake_percent
      };
      return res.json({
        status: 300,
        error: false,
        result: staking_data,
        message: "website data fetch",
      });
    }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing Went Wrong! please try after sometime?",
      errorM: error.message,
    });
  }
};
/**
 *
 * @param {*user_id}
 * @returns all stake data
 */
async function getStakeData(user_id) {
  const StakinData = require("../models/staking");
  try {
    const stake_data = await StakinData.find({ user_id: user_id });
    let total = 0;
    let total_ry_1 = 0;
    let total_ry_2 = 0;
    let total_ry_3 = 0;
    let total_ry_4 = 0;
    let total_stak_1 = 0;
    let total_stak_2 = 0;
    let total_stak_3 = 0;
    let total_stak_4 = 0;
    let time = new Date().getTime();
    stake_data.map((data) => {
      let type = data.type;
      let psry = data.per_second_ry;
      let stake_duration = type*24*60*60*1000;
      let main_created_time = new Date(data.createdAt).getTime();
      let main_diff = time - main_created_time;
      let time_exceed = main_diff - stake_duration;
      let created_time = new Date(data.harvestedAt).getTime();
      let time_diff = time_exceed > 0 ? time - created_time - time_exceed :time - created_time;
      let time_diff_in_sec = time_diff / 1000;
      let total_ry = time_diff_in_sec * psry;
      total += data.staked;
      if (type == 365) {
        total_ry_4 += total_ry;
        total_stak_4 += data.staked;
      } else if (type == 270) {
        total_ry_3 += total_ry;
        total_stak_3 += data.staked
      } else if (type == 180) {
        total_ry_2 += total_ry;
        total_stak_2 += data.staked
      } else if (type == 90) {
        total_ry_1 += total_ry;
        total_stak_1 += data.staked
      }
    });
    return {
      total_ry_1,
      total_ry_2,
      total_ry_3,
      total_ry_4,
      total_stak_1,
      total_stak_2,
      total_stak_3,
      total_stak_4,
      total
    };
  } catch (error) {
    console.log("getStakeData error" + error);
  }
}

async function getoneStakeData(user_id, type) {
    const StakinData = require("../models/staking");
    try {
      const stake_data = await StakinData.find({ user_id: user_id, type: type});
      let total_ry = 0;
      let time = new Date().getTime();
      stake_data.map(async (data) => {
        let psry = data.per_second_ry;
        let created_time = new Date(data.harvestedAt).getTime();
        let time_diff = time - created_time;
        let time_diff_in_sec = time_diff / 1000;
        let ry = time_diff_in_sec * psry;
        total_ry+=ry;
      });
      return total_ry;
    } catch (error) {
      console.log("getoneStakeData error" + error);
    }
  }
/*
 *** ! get USDT and calculat in BTEX
 *** ! create a stake record
 *** ! update the wallet and USDT BALANCE
 */
exports.setStake = async (req, res) => {
  const Wallets = require("../models/wallets");
  const Stake = require("../models/staking");
  // const SupportedCurrency = require("../models/suppoted_currency");
  try {
    const {
      user_id,
      usdt_token,
      tBtex,
      type,
      percent,
      inr_btex_price,
      inr_usdt_price,
    } = req.body;
    if (user_id && usdt_token) {
      const wallet_data = await Wallets.findOne({
        user: user_id,
        wallet_type: "USDT",
      });
      // const Currency = await SupportedCurrency.find({symbol:{$in:['BET', 'USDT']}})
      if (wallet_data) {
        const bal = parseFloat(wallet_data.balance);
        // const currencyUSDT = Currency.find((data) => data.symbol == 'USDT');
        // const currencyBTEX = Currency.find((data) => data.symbol == 'BET');
        // const inr_btex_price = currencyBTEX.inr_price;
        // const inr_usdt_price = currencyUSDT.inr_price;
        // const total_usdt_inr = usdt_token * inr_usdt_price;
        // const total_btex = total_usdt_inr / inr_btex_price;
        // console.log("total_btex", total_btex, tBtex)
        if (
          bal >= usdt_token &&
          inr_btex_price > 0 &&
          inr_usdt_price > 0 &&
          usdt_token > 0 &&
          tBtex > 0 &&
          type > 0 &&
          percent > 0
        ) {
          /**
           * fetch USDT price and btex in INR
           * calculate Btex With price of usdt
           * calculate in inr all usdt Token convert into btex
           */
          const total_income = (tBtex * percent) / 100;
          const total_second = type * 24 * 60 * 60;
          const per_second_income = (total_income + tBtex) / total_second;
          Stake.create({
            wallet_type: "BTEX",
            user_id: user_id,
            invest: usdt_token,
            usdtprice:inr_usdt_price,
            staked: tBtex,
            btexprice:inr_btex_price,
            type: type,
            percent: percent,
            per_second_ry: per_second_income,
            harvestedAt: new Date(),
          })
            .then(async () => {
              await Wallets.updateOne(
                { _id: wallet_data._id },
                {
                  $set: {
                    balance: bal - parseFloat(usdt_token),
                  },
                }
              );
              return res.json({
                status: 200,
                error: false,
                message: "success",
              });
            })
            .catch((e) => {
              return res.json({
                status: 500,
                error: true,
                message: e,
              });
            });
        } else {
          return res.json({
            status: 400,
            error: true,
            message: "Invalid Request**",
          });
        }
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invalid Request*",
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
      message: "Somthing Went Wrong! please try after sometime?",
      errorM: error.message,
    });
  }
};

/**
 * harvest api
 */

exports.harvest = async (req, res) => {
  const Wallets = require("../models/wallets");
  const Stake = require("../models/staking");
  const StakeHistory = require("../models/staking_history");
  // const SupportedCurrency = require("../models/suppoted_currency");
  try {
    const {
        user_id,
        type,
        harvest_amount
      } = req.body;
      if (user_id && type && harvest_amount > 0) {
            /**
             * validattion code
             */
            let harvestamt = await getoneStakeData(user_id, type);
            if(harvestamt>=harvest_amount) {
                /**
                 * updation code
                 */
                await Stake.updateOne({user_id: user_id, type: type}, {
                    $set: {
                        harvestedAt: new Date()
                    }
                })
                const wallet_data = await Wallets.findOne({user: user_id, wallet_type: 'BTEX'});
                const balance = parseFloat(wallet_data.balance);
                await Wallets.updateOne({_id: wallet_data._id}, {
                    $set: {
                        balance : balance + harvest_amount
                    }
                });
                 /**
                 * create harvest history
                 */
                await StakeHistory.create({wallet_type:"BTEX", user_id:user_id, harvest:harvest_amount, type:type});
                return res.json({
                    status: 200,
                    error: false,
                    message: "success"
                });
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request**"
                });
            }
      } else {
             return res.json({
                status: 400,
                error: true,
                message: "Invalid request"
            });
      }
  } catch (error) {
    return res.json({
      status: 400,
      error: true,
      message: "Somthing Went Wrong! please try after sometime?",
      errorM: error.message,
    });
  }
};
