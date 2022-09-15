const env = require('dotenv');

const HotWallet = require('../models/wallet_hot');
const Wallets = require('../models/wallets');
const Deposithistory = require('../models/deposite_history');
const ColdWallet = require('../models/wallet_cold'); 
const UserWalletCapture = require('../models/user_wallet_capture');

const { validateUserId } = require('./validator');
env.config();
function createUniqueID(type = 'user') {
    const unique_string = Date.now().toString(16);
    let id = '';
    switch (type) {
        case 'user':
            id = "BSXG"+unique_string;
            break;
        case 'sell_order':
            id = 'order$' + unique_string + '/s';
            break;
        case 'buy_order':
            id = 'order$' + unique_string + '/b';
            break;
        case 'p2p_sell_order':
            id = 'order$p2p$' + unique_string + '/s';
            break;
        case 'p2p_buy_order':
            id = 'order$p2p$' + unique_string + '/b';
            break;
        case 'history':
            id = 'history$' + unique_string;
            break;
        default:
            id = "BSXG"+unique_string;
            break;
    }
    return id;
}
function createUniqueAccessToken(category) {
    const { token_salt_arr, token_letter_arr } = require('./globals');
    /**
     * category**
     * a: forever
     * b: 1 year
     * c: 6 months
     * d: 3 months
     * e: 1 month
     * f: 1 week
     * g: 2 year
     * h: 3 year
     * i: 5 year
     * z: forever with update permission
     */
    const arr_len = token_salt_arr.length;
    const l_arr_len = token_letter_arr.length;
    const salt_word = token_salt_arr[Math.round(Math.random() * ((arr_len - 1) - 0 + 1) + 0)].toLowerCase();
    const random_letter = token_letter_arr[Math.round(Math.random() * ((l_arr_len - 1) - 0 + 1) + 0)];
    const current_date = Date.now();
    // const hexaDate = current_date.toString(16);
    // parseInt(hexString, 16);
    const b32date = current_date.toString(32);
    const b36date = current_date.toString(36);
    const token = b36date + '-' + category + '-' + salt_word + '-' + random_letter + '-' + b32date;
    return token;
}
function calculatePercentage(number, percent) {
    return parseFloat(number) * (parseFloat(percent) / 100.00);
}
function calculateTakerFee(amount) {
    const TAKER_FEE = process.env.TAKER_FEE;
    return calculatePercentage(amount, TAKER_FEE);
}
function calculateMakerFee(amount) {
    const MAKER_FEE = process.env.MAKER_FEE;
    return calculatePercentage(amount, MAKER_FEE);
}
function generateOTP() {
    const max = 999999;
    const min = 100000;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp;
}

async function createHash(string) {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedString = await new Promise((resolve, reject) => {
        bcrypt.hash(string, saltRounds, function (err, hash) {
            if (err) reject(undefined)
            resolve(hash)
        });
    })
    return hashedString;
}
async function compareHash(hashedString, normalString) {
    const bcrypt = require('bcrypt');
    console.log(hashedString, normalString)
    const result = await new Promise((resolve, reject) => {
        bcrypt.compare(normalString, hashedString, function (err, result) {
            if (err) reject(err)
            resolve(result)
        });
    });
    return result;
}
async function generateReferalCode(user_id) {
    /**
     * fetch user data to fetch parent referal address,
     * check in website data collection for amount and wallet,
     * get parent wallets from his referal,
     * update his referal income and wallet balance
     */
    const Users = require('../models/user');
    
    if (user_id && validateUserId(user_id)) {
        try {
            const user_data = await Users.findOne({ user_id: user_id });
            if (user_data) {
                const splited_email = user_data.email.split('@');
                let referalcode = 'BSXG_'+splited_email[0];
                await Users.updateOne({ user_id: user_id}, {
                    $set: {
                        self_ref_code: referalcode
                    }
                })
                    
            } else {
                return false;
            }
        } catch(error) {
            console.log("Error: from: utils>functions.users.js>generateReferalCode: ", error.message);
            return undefined;
        }
    } else {
        return false;
    }
}
function formatEmail(emilString) {
    var splitEmail = emilString.split("@")
    var domain = splitEmail[1];
    var name = splitEmail[0];
    return name.substring(0, 3).concat("*********@").concat(domain)
}
async function distributeReferal(user_id) {
    /**
     * fetch user data to fetch parent referal address,
     * check in website data collection for amount and wallet,
     * get parent wallets from his referal,
     * update his referal income and wallet balance
     */
    const Users = require('../models/user');
    const WebsiteSettings = require("../models/website_data");
    const Wallets = require("../models/wallets");
    const KYC = require("../models/pending_kyc");
    const NotificationInfo = require("../models/notification");
    if (user_id && validateUserId(user_id)) {
        try {
            const user_data = await Users.findOne({ user_id: user_id });
            if (user_data) {
                //first get websire data collection for referal currency and referal amount right here {referral_coin, referral_fee}
                const website_settings = await WebsiteSettings.findOne({});
                if (website_settings && website_settings.referral_coin && website_settings.referral_fee && website_settings.referral_fee > 0) {
                    const parent_ref_code = user_data.parent_ref_code ? user_data.parent_ref_code : false;
                    if (parent_ref_code) {
                        // const parent_user_id = await getUserIdFromReferalCode(parent_ref_code);
                        const p_data = await Users.findOne({self_ref_code: parent_ref_code});
                        const parent_user_id = p_data?p_data.user_id?p_data.user_id:undefined:undefined;
                        const parent_KYC = await KYC.findOne({user_id: parent_user_id},'status');
                        const parent_status = parent_KYC ? parent_KYC.status : 0;
                        if (parent_user_id && p_data ) {
                            if(parent_status == 1){
                                const wallets = await Wallets.findOne({ user: parent_user_id, wallet_type: website_settings.referral_coin });
                                if (wallets) {
                                    await Wallets.updateOne({ user: parent_user_id, wallet_type: website_settings.referral_coin }, {
                                        $set: {
                                            balance: wallets.balance ? parseFloat(wallets.balance) + parseFloat(website_settings.referral_fee) : parseFloat( website_settings.referral_fee)
                                        }
                                    })
                                    await Users.updateOne({ user_id: parent_user_id }, {
                                        $set: {
                                            referral_income: p_data.referral_income ? parseFloat(p_data.referral_income) + parseFloat(website_settings.referral_fee) : parseFloat(website_settings.referral_fee)
                                        }
                                    })
                                    let history_obj = {
                                        user_id: parent_user_id,
                                        _from: user_id,
                                        commission: parseFloat(website_settings.referral_fee),
                                        time_stamp: Date.now(),
                                        wallet_type: website_settings.referral_coin
                                    }
                                    await updateReferalhistory(history_obj);
                                }else{
                                    let msg = "Parent User(): "+parent_user_id+" ,Referrel User: "+user_id;
                                    await NotificationInfo.create({user_id: parent_user_id, name: 'Referrel not get', msg: "Referrel not get because parent user KYC is not done"+msg, table_name: 'referral_commission'});
                                    console.log("Parent KYC not Done so Referrel not Distribute")
                                }
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch(error) {
            console.log("Error: from: utils>functions.users.js>distributeReferal: ", error.message);
            return undefined;
        }
    } else {
        return false;
    }
}
async function distributeAirdrop(user_id) {
    /**
     * fetch user data to fetch parent referal address,
     * check in website data collection for amount and wallet,
     * get parent wallets from his referal,
     * update his referal income and wallet balance
     */
    const Users = require('../models/user');
    const WebsiteSettings = require("../models/website_data");
    const Wallets = require("../models/wallets");
    if (user_id && validateUserId(user_id)) {
        try {
            const user_data = await Users.findOne({ user_id: user_id });
            console.log('user found 0 ',user_id)
            // return user_data;
            if (user_data) {
                //first get websire data collection for referal currency and referal amount right here {airdrop_coin, airdrop_fee}
                const website_settings = await WebsiteSettings.findOne({});
                if (website_settings && website_settings.airdrop_coin && website_settings.airdrop_fee && website_settings.airdrop_fee > 0) {
                        const parent_user_id = user_id;
                        if (parent_user_id) {
                            const wallets = await Wallets.findOne({ user: parent_user_id, wallet_type: website_settings.airdrop_coin });
                            if (wallets) {
                                console.log('distributeAirdrop update balance in ',website_settings.airdrop_coin,website_settings.airdrop_fee)
                                console.log(wallets.balance,website_settings.airdrop_fee,parseFloat(wallets.balance) + parseFloat(website_settings.airdrop_fee))
                                update_b = await Wallets.updateOne({ user: parent_user_id, wallet_type: website_settings.airdrop_coin }, {
                                    $set: {
                                        balance: wallets.balance ? parseFloat(wallets.balance) + parseFloat(website_settings.airdrop_fee) : parseFloat( website_settings.airdrop_fee)
                                    }
                                })
                               
                                let history_obj = {
                                    user_id: parent_user_id,
                                    commission: parseFloat(website_settings.airdrop_fee),
                                    wallet_type: website_settings.airdrop_coin
                                }
                                await updateAirDrophistory(history_obj)
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                } else {
                    return false;
                }
            } else {
                return user_data;
            }
        } catch(error) {
           console.log("Error: from: utils>functions.users.js>distributeAirdrop: ", error.message);
            return undefined;
        }
    } else {

        return false;
    }
}
async function getUserIdFromReferalCode(referal_code) {
    const Users = require('../models/user');
    if (referal_code) {
        try {
            const userData = await Users.findOne({ self_ref_code: referal_code });
            if (userData) {
                return userData.user_id ? userData.user_id : undefined;
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
async function updateReferalhistory(history_obj) {
    /**
     * user_id: parent_user_id,
    _from: user_id,
    commission: parseFloat(website_settings.referral_fee),
    time_stamp: Date.now(),
    wallet_type: website_settings.referral_coin
     */
    const ReferalCommision = require("../models/referral_commission");
    try {
        if (history_obj.user_id && history_obj._from && history_obj.commission && history_obj.time_stamp && history_obj.wallet_type) {
            await ReferalCommision.create({
                user_id: history_obj.user_id,
                _from: history_obj._from,
                time_stamp: history_obj.time_stamp,
                commission: history_obj.commission,
                wallet_type: history_obj.wallet_type
            })
        }
    } catch (error) {
        console.log("Error: <update referal>: ", error.message)
    }
}
async function updateAirDrophistory(history_obj) {
    /**
     * user_id: parent_user_id,
    _from: user_id,
    commission: parseFloat(website_settings.airdrop_fee),
    time_stamp: Date.now(),
    wallet_type: website_settings.airdrop_coin
     */
    const AirdropCommision = require("../models/airdrop_commission");
    try {
        if (history_obj.user_id && history_obj.commission && history_obj.wallet_type) {
            await AirdropCommision.create({
                user_id: history_obj.user_id,
                commission: history_obj.commission,
                wallet_type: history_obj.wallet_type
            })
        }
    } catch (error) {
        console.log("Error: <update referal>: ", error.message)
    }
}
function MergeWithTable(arr,arr2,index1,index2){
    // this array return arr2 into arr in index2 array index and  when index1 is match in both
    let AWl = {};
    let AWl2 = [];
    if(arr2.length > 0){
        arr2.map((async val => {
            if(val[index1]){
                AWl[val[index1]] = val; 
            }
        }))
    }
    if(arr.length > 0){
        i = 0;
        arr.map((async val => {
            if(AWl[val['user_id']]){
                val[index2] = AWl[val['user_id']];
                AWl2.push(val); 
            }
        }))
    }
    return AWl2;
}
/**
 * for middle ware > we need to implement 
 * 
 * check is paired
 * check is kyc 
 * 
 */
async function isKycDone(req, res, next) {
    const KYC = require('../models/pending_kyc');
    try {
        /**check kyc status  */
        const body = req.body;
        const user_id = body.user_id?body.user_id:undefined;
        const currency_type = body.currency_type ? body.currency_type: undefined;
        const compare_currency = body.compare_currency ? body.compare_currency : undefined;
        if (user_id && currency_type && compare_currency) {
            const kyc_data = await KYC.findOne({ user_id: user_id });
            if (kyc_data) {
                if (kyc_data.status == 1) {
                    next();
                } else {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "kyc varification is important for any transaction"
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "kyc varification is important for any transaction"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "kyc varification is important for any transaction"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "kyc varification is important for any transaction"
        })
    }
}
async function isPaired(req, res, next) {
    const SupportedCurrency = require('../models/suppoted_currency');
    try {
        const body = req.body;
        const user_id = body.user_id ? body.user_id : undefined;
        const currency_type = body.currency_type ? body.currency_type : undefined;
        const compare_currency = body.compare_currency ? body.compare_currency : undefined;
        if (user_id && currency_type && compare_currency) {
            const sc = await SupportedCurrency.findOne({ symbol: compare_currency.toUpperCase() });
            if (sc) {
                switch (compare_currency.toUpperCase()) {
                    case 'INR':
                        if (sc.is_paired_inr == 1) {
                            next();
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Can not paire with this currency"
                            })
                        }
                        break;
                    case 'BTC':
                        if (sc.is_paired_btc == 1) {
                            next();
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Can not paire with this currency"
                            })
                        }
                        break;
                    case 'USDT':
                        if (sc.is_paired_usdt == 1) {
                            next();
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Can not paire with this currency"
                            })
                        }
                        break;
                    default:
                        if (sc.is_paired_vrx == 1) {
                            next();
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Can not paire with this currency"
                            })
                        }
                        break;
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Can not paire with this currency"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Can not paire with this currency"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Can not paire with this currency"
        })
    }
}

function generateTransectionid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

async function getBankDetails(user_id) {
    const Banking = require("../models/user_bank_details")
    return Banking.findOne({ user_id: user_id}).then(bank_detail => bank_detail)
}

async function injectInGraph(currency_type, compare_currency, price, volume=0) {
    try {
        const graph_data = require('../json/ohlc_1h.json');
        let timestamp = Date.now() / 1000;
        if (graph_data) {
            let key = currency_type.toUpperCase() + compare_currency.toUpperCase();
            let chart_data = graph_data[key];
            if (chart_data) {
                let o = chart_data['o'];
                let h = chart_data['h'];
                let l = chart_data['l'];
                let c = chart_data['c'];
                let v = chart_data['v'];
                let t = chart_data['t'];
                let s = chart_data['s'];
                if (
                    o && h && l && c && v && t &&
                    o.length > 0 &&
                    h.length > 0 &&
                    l.length > 0 &&
                    c.length > 0 &&
                    v.length > 0 &&
                    t.length > 0
                ) {
                    let last_o = o[o.length - 1];
                    let last_h = h[h.length - 1];
                    let last_l = l[l.length - 1];
                    let last_c = c[c.length - 1];
                    let last_v = v[v.length - 1];
                    let last_t = t[t.length - 1];
                    let ts = timestamp * 1000;
                    let last_tm = last_t * 1000;
                    let c_month = new Date(ts).getMonth();
                    let c_date = new Date(ts).getDate();
                    let c_hour = new Date(ts).getHours();
                    let l_month = new Date(last_tm).getMonth();
                    let l_date = new Date(last_tm).getDate();
                    let l_hour = new Date(last_tm).getHours();
                    if (c_month == l_month && c_date == l_date && c_hour == l_hour) {
                        // update high, low, close, volume
                        if (price > last_h) {
                            last_h = price;
                        }
                        if (price < last_l) {
                            last_l = price;
                        }
                        last_c = price;
                        last_v = last_v + volume;
                        last_t = timestamp;
                        h[h.length - 1] = last_h;
                        l[l.length - 1] = last_l;
                        c[c.length - 1] = last_c;
                        v[v.length - 1] = last_v;
                        t[t.length - 1] = last_t;
                        
                        chart_data['h'] = h;
                        chart_data['l'] = l;
                        chart_data['c'] = c;
                        chart_data['v'] = v;
                        chart_data['t'] = t;
                        graph_data[key] = chart_data;
                        storeOHLCVT(graph_data);
                    } else {
                        // set open, close, high, low, volume
                        last_o = price;
                        last_h = price;
                        last_l = price;
                        last_c = price;
                        last_v = volume;
                        last_t = timestamp;
                        
                        o[o.length] = last_o;
                        h[h.length] = last_h;
                        l[l.length] = last_l;
                        c[c.length] = last_c;
                        v[v.length] = last_v;
                        t[t.length] = last_t;
                        
                        chart_data['o'] = o;
                        chart_data['h'] = h;
                        chart_data['l'] = l;
                        chart_data['c'] = c;
                        chart_data['v'] = v;
                        chart_data['t'] = t;
                        graph_data[key] = chart_data;
                        storeOHLCVT(graph_data);
                    }
                    return {
                        last_o,
                        last_h,
                        last_l,
                        last_c,
                        last_v,
                        last_t,
                    }
                } else {
                    return {};
                }
            } else {
                return {};
            }
        } else {
            return {};
        }
    } catch (error) {
        console.log("Error in graph data injection: ", error.message);
        return {};
    }
}
function storeOHLCVT(data) {
    var fs = require('fs');
    let path = require('path') 
    let dirname = path.join(__dirname, `../json/ohlc_1h.json`);
    
    var json = JSON.stringify(data);
    fs.writeFile(dirname, json, 'utf8', (d) => {
        console.log(d);
    });
}
async function getCurrentSell(user_id, start_time, end_time) {
    const SellStack = require("../models/sell_stack");
    const TradeHistory = require("../models/trade_history");
    try {
        if (user_id) {
            let sell_stacks = await SellStack.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time).toISOString()) },
                createdAt: { $lt: (new Date(end_time).toISOString()) },
            });
            if (sell_stacks && sell_stacks.length > 0) {
                let trade_h = [];
                let a = sell_stacks.map(async (d) => {
                    if (d) {
                        let trades = await TradeHistory.find({
                            sell_order_id: d.order_id,
                        });
                        let obj = {
                            symbol: d.currency_type,
                            compare_currency: d.compare_currency,
                            createdAt: d.createdAt,
                            type: "Sell",
                            info: d,
                            trades: trades
                        }
                        trade_h.push(obj);
                    }
                })
                await Promise.all(a);
                return trade_h;
            } else {
                return [];
            }
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getCurrentSell: ", error.message);
        return [];
    }
}

async function getCurrentBuy(user_id, start_time, end_time) {
    const BuyStack = require("../models/buy_stack");
    const TradeHistory = require("../models/trade_history");
    try {
        if (user_id) {
            let buy_stacks = await BuyStack.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time)) },
                createdAt: { $lt: (new Date(end_time)) },
            });
            if (buy_stacks && buy_stacks.length > 0) {
                let trade_h = [];
                let a = buy_stacks.map(async (d) => {
                    if (d) {
                        let trades = await TradeHistory.find({
                            buy_order_id: d.order_id,
                        });
                        let obj = {
                            symbol: d.currency_type,
                            compare_currency: d.compare_currency,
                            createdAt: d.createdAt,
                            type: "Buy",
                            info: d,
                            trades: trades
                        }
                        trade_h.push(obj);
                    }
                })
                await Promise.all(a);
                return trade_h;
            } else {
                return [];
            }
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getCurrentBuy: ", error.message);
    }
}

async function getDeposithistory(user_id, start_time, end_time) {
    const DepositHistory = require("../models/deposite_history");
    try {
        if (user_id) {
            let deposit_history = await DepositHistory.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time).toISOString()) },
                createdAt: { $lt: (new Date(end_time).toISOString()) },
            });
            return deposit_history ? deposit_history : [];
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getDeposithistory: ", error.message);
    }
}

async function getWithdrawHistory(user_id, start_time, end_time) {
    const WithdrawHistory = require("../models/withdraw_history");
    try {
        if (user_id) {
            let withdraw_history = await WithdrawHistory.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time).toISOString()) },
                createdAt: { $lt: (new Date(end_time).toISOString()) },
            });
            return withdraw_history ? withdraw_history : [];
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getWithdrawHistory: ", error.message);
    }
}

async function getUserActivity(user_id, start_time, end_time) {
    console.log("Called", user_id, start_time, end_time)
    try {
        if (user_id) {
            let currencttime = new Date();
            let thisyear = currencttime.getFullYear();
            let thismonth = currencttime.getMonth();
            let thisdate = currencttime.getDate();

            let starttime = new Date(
                `${thismonth}-${thisdate}-${thisyear}`
            ).getTime();
            let endtime = new Date().getTime();
            const start_time1 =
                start_time ? start_time : starttime;
            const end_time1 = end_time ? end_time : endtime;
            if (start_time1 < end_time1) {
                let sell_stack = await getCurrentSell(user_id, start_time1, end_time1);
                let buy_stack = await getCurrentBuy(user_id, start_time1, end_time1);
                let deposit_history = await getDeposithistory(user_id, start_time1, end_time1);
                let withdraw_history = await getWithdrawHistory(user_id, start_time1, end_time1);
                let merged_array = [...sell_stack, ...buy_stack, ...deposit_history, ...withdraw_history];
                let sorted_array = merged_array.sort(function (b, a) {
                    return (a.createdAt < b.createdAt) ? -1 : ((a.createdAt > b.createdAt) ? 1 : 0);
                });
                console.log("Sorted arr: ", sorted_array)
                return sorted_array;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    } catch (error) {
        console.log("Error in getUseractivity: ", error.message);
        return undefined;
    }
}

/**
 * & cmc related functions for current pricing and chart data
 */


/**
 * ~get cmc ohva
 */
async function getCMCOHVA(currency_type, compare_currency) {
    try {
        let now = new Date();
        let today = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        let yesterday = new Date(today.getTime() - 86400000);
        let daybeforeyesterday = new Date(yesterday.getTime() - 86400000);

        /**
         * ?get yesterday's highest price
         */
        let yesterdays_h = await getHighest(currency_type, compare_currency, yesterday, today);
        /**
         * ?get yesterday's lowest price
         */
        let yesterdays_l = await getLowest(currency_type, compare_currency, yesterday, today);
        /**
         * ?get yesterday's total volume
         */
        let yesterdays_v = await getTotalVolume(currency_type, compare_currency, yesterday, today);
        /**
         * ?get yesterday's closing price
         */
        let yesterdays_c = await getClosingPrice(currency_type, compare_currency, yesterday, today);
        /**
         * *get today's highest price
         */
        let todays_h = await getHighest(currency_type, compare_currency, today, new Date());
        /**
         * *get today's lowest price
         */
        let todays_l = await getLowest(currency_type, compare_currency, today, new Date());
        /**
         * *get today's total volume
         */
        let todays_v = await getTotalVolume(currency_type, compare_currency, today, new Date());
        /**
         * *get today's closing price
         */
        let todays_c = await getClosingPrice(currency_type, compare_currency, today, new Date());

        /**
         * ^ today's average change in percentage
         */
        let todays_dif = todays_c - yesterdays_c;
        let todays_pc = yesterdays_c != 0 ? parseFloat(((todays_dif / yesterdays_c) * 100).toFixed(2)) : 0;

        return {
            yesterdays_h,
            yesterdays_l,
            yesterdays_v,
            yesterdays_c,
            todays_h,
            todays_l,
            todays_v,
            todays_c,
            todays_pc
        };
    } catch (error) {
        console.log("Error from getcmcohva: ", error.message);
        return undefined;
    }
}

/**
 * ! get highest price in interval 
 */
async function getHighest(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const highest_price = await TradeHistory.find({
                currency_type: currency_type.toLowerCase(),
                compare_currency: compare_currency.toLowerCase(),
                createdAt: {
                    $gt: start_time,
                    $lt: end_time
                }
            }).sort({ price: -1 }).limit(1);
            if (highest_price && highest_price.length > 0) {
                return highest_price[0].price
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getHighest: ", error.message);
        return 0;
    }
}
/**
 * ! get lowest price in interval 
 */
async function getLowest(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const lowest_price = await TradeHistory.find({
                currency_type: currency_type.toLowerCase(),
                compare_currency: compare_currency.toLowerCase(),
                createdAt: {
                    $gt: start_time,
                    $lt: end_time
                }
            }).sort({ price: 1 }).limit(1);
            if (lowest_price && lowest_price.length > 0) {
                return lowest_price[0].price
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getLowest: ", error.message);
        return 0;
    }
}
/**
 * ! get total volume in interval 
 */
async function getTotalVolume(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const total_volume = await TradeHistory.aggregate([
                {
                    $match: {
                        currency_type: currency_type,
                        compare_currency: compare_currency,
                        createdAt: {
                            $gt: start_time,
                            $lt: end_time
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$volume"
                        }
                    }
                },
            ]);

            if (total_volume && total_volume.length > 0) {
                return total_volume[0].total
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getTotalVolume: ", error.message);
        return 0;
    }
}
/**
 * ! get closing price in interval 
 */
async function getClosingPrice(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const closing_price = await TradeHistory.find({
                currency_type: currency_type.toLowerCase(),
                compare_currency: compare_currency.toLowerCase(),
                createdAt: {
                    $gte: start_time,
                    $lt: end_time
                }
            }).sort({ createdAt: -1 }).limit(1);
            if (closing_price && closing_price.length > 0) {
                return closing_price[0].price
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getClosingPrice: ", error.message);
        return 0;
    }
}
function createAccessToken(data) { 
    const { br, os, ip, ui, og } = data;
    // console.log("Data from dr: ", data)
    let compound = ":secure/" + os + "+" + br + "+" + ip + "+" + ui + "*" + og + "+" + Date.now();
    let token = decrypt(compound);
    return token;
}
function decrypt(str) {
    let token = str.replace(/ /g, '#').split('').map(d => {
        if (d == 'W') { return "&"; } else if (d == '&') { return "W"; }
        else if (d == 'A') { return "+"; } else if (d == '+') { return "A"; }
        else if (d == '.') { return "e"; } else if (d == 'e') { return "."; }
        else if (d == '1') { return "f"; } else if (d == 'f') { return "1"; }
        else if (d == 'N') { return "4"; } else if (d == "4") { return "N"; }
        else if (d == 'n') { return "i"; } else if (d == 'i') { return "n"; }
        else if (d == 'o') { return "s"; } else if (d == 's') { return "o"; }
        else if (d == 'd') { return "7"; } else if (d == '7') { return "d"; }
        else if (d == 'c') { return "2"; } else if (d == '2') { return "c"; }
        else if (d == 'j') { return "3"; } else if (d == '3') { return "j"; }
        else if (d == 'w') { return "9"; } else if (d == '9') { return "w"; }
        else if (d == '/') { return "t"; } else if (d == 't') { return "/"; }
        else if (d == 'k') { return "u"; } else if (d == 'u') { return "k"; }
        else if (d == 'a') { return "p"; } else if (d == 'p') { return "a"; }
        else { return d; }
    }).join('');
    return token;
}


async function toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
      
  }
  
/**
 * 
 * auto capture fund
 * 
 */
 
function getIndianHours() {
    let indian_date = new Date().toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' });
    let hours = indian_date.getHours();
    return hours;
}
function getIndianHoursFrom(date) {
    let indian_date = date.toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' });
    let hours = indian_date.getHours();
    return hours;
}
function calcTime(offset) {
    // create Date object for current location
    var d = new Date();

    // convert to msec
    // subtract local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var nd = new Date(utc + (3600000 * offset));

    // return time as a string
    return nd;
}
function getIndianDate() {
    let indian_date = calcTime('+5.5');

    // alert(calcTime('Bombay', '+5.5'));
    return indian_date;
}
function getIndianDateFrom(date) {
    let indian_date = date.toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' });
    return indian_date;
}

async function getFilteredDepositHistory(wallet_type) {
    const DepositHistory = require('../models/deposite_history');
    const SupportedCurrency = require('../models/suppoted_currency');
    var final_result = {};
    final_result['tokens'] = {};
    final_result['currency'] = {};
    final_result['all'] = {};
    try {
        /**
         * ! get all painding deposit history
         */
        const all_data = await DepositHistory.find( { capture_status: { $ne: true } ,symbol: { $eq: wallet_type }} );
        if (all_data && all_data.length > 0) {
            /**
             * ! get supported_currency data
             */
            let supported_currency = await SupportedCurrency.find({});

            /**
             * ! filter in token and currency wise
             */
            if (supported_currency) {
                let a = all_data.map(async (d) => {
                    let currency = supported_currency.find((_d) => {
                        if (_d.symbol == d.symbol) {
                            return d;
                        }
                    })
                    if (currency) {
                        if (currency.contract_type == "") {
                            let obj = {
                                _id: d._id,
                                wallet_address: d.to_address,
                                symbol: d.symbol
                            }
                            final_result['currency'][d.to_address + d.symbol] = obj;
                        } else {
                            let obj = {
                                _id: d._id,
                                wallet_address: d.to_address,
                                symbol: d.symbol,
                                token_type: currency.contract_type,
                                contract_address: currency.contract_address,
                                blockchain: currency.contract_type == "erc20" ? 'ETH' :
                                                currency.contract_type == "bep20" ? 'BNB' :
                                                    currency.contract_type == "trc20" ? 'TRX' :
                                            currency.contract_type == "trc10" ? 'TRX' : undefined,
                                precision: currency.precision ? currency.precision : 6
                            }
                            final_result['tokens'][d.to_address + d.symbol] = obj;
                        }
                        let sy = currency.contract_type == "" ? d.symbol :
                            currency.contract_type == "erc20" ? 'ETH' :
                                currency.contract_type == "bep20" ? 'BNB' :
                                    currency.contract_type == "trc20" ? 'TRX' :
                                        currency.contract_type == "trc10" ? 'TRX' : undefined;
                        let obj1 = {
                            _id: d._id,
                            wallet_address: d.to_address,
                            symbol: sy,
                        }
                        final_result['all'][d.to_address + sy] = obj1;
                        return true;
                    }
                    return false;
                });
                await Promise.all(a);
                return final_result;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    } catch (error) {
        console.log("Error from (getFilteredDepositHistory): ", error.message)
        return undefined;
    }
}
async function sendNextAdminTransfer(wallet_list, index) {
    try {
        let keys = Object.keys(wallet_list);
        if (keys[index]) {
            let dk = keys[index];
            let d = wallet_list[dk];
            let blockchain = d.blockchain;
            let address = d.wallet_address;
            let contract_addtess = d.contract_address;
            let contract_type = d.token_type;
            let symbol = d.symbol;
            // let precision = d.precision;
            let _id = d._id;
            let currency_wallet = await Wallets.findOne({
                wallet_address: address,
                wallet_type: blockchain.toUpperCase()
            });
            if (currency_wallet) {
                let hot_wallet = await HotWallet.findOne({
                    wallet_type: blockchain.toUpperCase()
                })
                if (hot_wallet) {
                    if (contract_type == 'trc20' || contract_type == 'trc10') {
                        try {

                            let txamnt = contract_type == 'trc20' ? trc20_transfer : trc10_transfer;
                            // let gslimit = contract_type == 'trc20' ? trc20_fee_limit : trc10_fee_limit;
                            const tradeobj = await tronWeb.transactionBuilder.sendTrx(currency_wallet.wallet_address, (txamnt * 1e6), hot_wallet.wallet_address);
                            const signedtxn = await tronWeb.trx.sign(tradeobj, hot_wallet.private_key);
                            const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
                            if (trxreceipt.result) {
                                /**
                                 * ~ update admin transfer wallet
                                 */
                                await Wallets.updateOne({ _id: currency_wallet._id }, {
                                    admin_transfer: currency_wallet.admin_transfer + txamnt
                                });
                                
                                await sendNextAdminTransfer(wallet_list, index+1);
                                return true;
                            } else {
                                console.log("Transaction failed: ", trxreceipt);
                                return false;
                            }
                        } catch (error) {
                            console.log("Error in admin transfer (" + contract_type + ") : ", error);
                            return false;
                        }
                    } else if (contract_type == 'bep20') {
                        try {
                            const esgas = await web3BNB.eth.estimateGas({
                                to: hot_wallet.wallet_address
                            });
                            const gasp = await web3BNB.eth.getGasPrice()
                            const createTransaction = await web3BNB.eth.accounts.signTransaction(
                                {
                                    from: hot_wallet.wallet_address,
                                    to: currency_wallet.wallet_address,
                                    value: ((bep20_transfer * 1e18) - (esgas * gasp)),
                                    gas: esgas,
                                },
                                hot_wallet.private_key
                            );
                            // Deploy transaction
                            const createReceipt = await web3BNB.eth.sendSignedTransaction(
                                createTransaction.rawTransaction
                            );
                            if (createReceipt) {
                                /**
                                 * ~ update admin transfer wallet
                                 */
                                await Wallets.updateOne({ _id: currency_wallet._id }, {
                                    admin_transfer: currency_wallet.admin_transfer + bep20_transfer
                                });
                                await sendNextAdminTransfer(wallet_list, index+1);
                                return true;
                            } else {
                                console.log("Transaction failed: ", createReceipt);
                                return false;
                            }
                        } catch (error) {
                            console.log("Error in admin transfer (BEP20) : ", error)
                            return false;
                        }
                        
                    } else if (contract_type == 'erc20') {
                        try {
                            const esgas = await web3Eth.eth.estimateGas({
                                to: hot_wallet.wallet_address
                            });
                            const gasp = await web3Eth.eth.getGasPrice()
                            const createTransaction = await web3Eth.eth.accounts.signTransaction(
                                {
                                    from: hot_wallet.wallet_address,
                                    to: currency_wallet.wallet_address,
                                    value: ((erc20_transfer * 1e18) - (esgas * gasp)),
                                    gas: esgas,
                                },
                                hot_wallet.private_key
                            );
                            // Deploy transaction
                            const createReceipt = await web3Eth.eth.sendSignedTransaction(
                                createTransaction.rawTransaction
                            );
                            if (createReceipt) {
                                /**
                                 * ~ update admin transfer wallet
                                 */
                                await Wallets.updateOne({ _id: currency_wallet._id }, {
                                    admin_transfer: currency_wallet.admin_transfer + erc20_transfer
                                });
                                await sendNextAdminTransfer(wallet_list, index+1);
                                return true;
                            } else {
                                console.log("Transaction failed: ", createReceipt);
                                return false;
                            }
                        } catch (error) {
                            console.log("Error in admin transfer (ERC20) : ", error)
                            return false;
                        }
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error in admin transfer (" + index + ") : ", error);
        return false;
    }
}
async function sendAdmimTransfer(wallet_list) {
    try {
        if (wallet_list) {
            await sendNextAdminTransfer(wallet_list, 0);
            return true;
            // var update_wallet = [];
            // let keys = Object.keys(wallet_list);
            // if (keys && keys.length > 0) {
            //     let a = keys.map(async (dk) => {
            //         let d = wallet_list[dk];
            //         let blockchain = d.blockchain;
            //         let address = d.wallet_address;
            //         let contract_addtess = d.contract_address;
            //         let contract_type = d.token_type;
            //         let symbol = d.symbol;
            //         // let precision = d.precision;
            //         let _id = d._id;
            //         let currency_wallet = await Wallets.findOne({
            //             wallet_address: address,
            //             wallet_type: blockchain.toUpperCase()
            //         });
            //         // let token_wallet = await Wallets.findOne({
            //         //     wallet_address: address,
            //         //     wallet_type: symbol
            //         // });
            //         if (currency_wallet) {
            //             let hot_wallet = await HotWallet.findOne({
            //                 wallet_type: blockchain.toUpperCase()
            //             })
            //             if (hot_wallet) {
            //                 if (contract_type == 'trc20' || contract_type == 'trc10') {
            //                     try {

            //                         let txamnt = contract_type == 'trc20' ? trc20_transfer : trc10_transfer;
            //                         // let gslimit = contract_type == 'trc20' ? trc20_fee_limit : trc10_fee_limit;
            //                         const tradeobj = await tronWeb.transactionBuilder.sendTrx(currency_wallet.wallet_address, (txamnt * 1e6), hot_wallet.wallet_address);
            //                         const signedtxn = await tronWeb.trx.sign(tradeobj, hot_wallet.private_key);
            //                         const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
            //                         if (trxreceipt.result) {
            //                             /**
            //                              * ~ update admin transfer wallet
            //                              */
            //                             await Wallets.updateOne({ _id: currency_wallet._id }, {
            //                                 admin_transfer: currency_wallet.admin_transfer + txamnt
            //                             });
            //                             return true;
            //                         } else {
            //                             console.log("Transaction failed: ", trxreceipt);
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in admin transfer (" + contract_type + ") : ", error);
            //                         return false;
            //                     }
            //                 } else if (contract_type == 'bep20') {
            //                     try {
            //                         const esgas = await web3BNB.eth.estimateGas({
            //                             to: hot_wallet.wallet_address
            //                         });
            //                         const gasp = await web3BNB.eth.getGasPrice()
            //                         const createTransaction = await web3BNB.eth.accounts.signTransaction(
            //                             {
            //                                 from: hot_wallet.wallet_address,
            //                                 to: currency_wallet.wallet_address,
            //                                 value: ((bep20_transfer * 1e18) - (esgas * gasp)),
            //                                 gas: esgas,
            //                             },
            //                             hot_wallet.private_key
            //                         );
            //                         // Deploy transaction
            //                         const createReceipt = await web3BNB.eth.sendSignedTransaction(
            //                             createTransaction.rawTransaction
            //                         );
            //                         if (createReceipt) {
            //                             /**
            //                              * ~ update admin transfer wallet
            //                              */
            //                             await Wallets.updateOne({ _id: currency_wallet._id }, {
            //                                 admin_transfer: currency_wallet.admin_transfer + bep20_transfer
            //                             });
            //                             return true;
            //                         } else {
            //                             console.log("Transaction failed: ", createReceipt);
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in admin transfer (BEP20) : ", error)
            //                         return false;
            //                     }
                                
            //                 } else if (contract_type == 'erc20') {
            //                     try {
            //                         const esgas = await web3Eth.eth.estimateGas({
            //                             to: hot_wallet.wallet_address
            //                         });
            //                         const gasp = await web3Eth.eth.getGasPrice()
            //                         const createTransaction = await web3Eth.eth.accounts.signTransaction(
            //                             {
            //                                 from: hot_wallet.wallet_address,
            //                                 to: currency_wallet.wallet_address,
            //                                 value: ((erc20_transfer * 1e18) - (esgas * gasp)),
            //                                 gas: esgas,
            //                             },
            //                             hot_wallet.private_key
            //                         );
            //                         // Deploy transaction
            //                         const createReceipt = await web3Eth.eth.sendSignedTransaction(
            //                             createTransaction.rawTransaction
            //                         );
            //                         if (createReceipt) {
            //                             /**
            //                              * ~ update admin transfer wallet
            //                              */
            //                             await Wallets.updateOne({ _id: currency_wallet._id }, {
            //                                 admin_transfer: currency_wallet.admin_transfer + erc20_transfer
            //                             });
            //                             return true;
            //                         } else {
            //                             console.log("Transaction failed: ", createReceipt);
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in admin transfer (ERC20) : ", error)
            //                         return false;
            //                     }
            //                 }
            //             } else {
            //                 return false;
            //             }
            //         } else {
            //             return false;
            //         }
            //     })
            //     await Promise.all(a);
            //     return true;
            // } else {
            //     return undefined;
            // }
        } else {
            return undefined;
        }
    } catch (error) {
        console.log("Error from (sendAdmimTransfer): ", error);
        return undefined;
    }
}
async function captureNextToken(wallet_list, index) {
    console.log("Index: ", index);
    try {
        let keys = Object.keys(wallet_list);
        if (keys[index]) {
            let dk = keys[index];
            let d = wallet_list[dk];
            let blockchain = d.blockchain;
            let address = d.wallet_address;
            let contract_addtess = d.contract_address;
            let contract_type = d.token_type;
            let symbol = d.symbol;
            let precision = d.precision;
            let _id = d._id;
            let currency_wallet = await Wallets.findOne({
                wallet_address: address,
                wallet_type: blockchain.toUpperCase()
            });
            console.log("currency_wallet: ", currency_wallet);
            let token_wallet = await Wallets.findOne({
                wallet_address: address,
                wallet_type: symbol
            });
            console.log("token_wallet: ", contract_type,  token_wallet);
            if (currency_wallet && token_wallet) {
                let cold_wallet = await ColdWallet.findOne({
                    wallet_type: symbol
                })
                console.log("cold_wallet: ", cold_wallet);
                if (cold_wallet) {
                    if (contract_type == 'trc20') {
                        try {
                            tronWeb.setAddress(token_wallet.wallet_address);
                            const instance = await tronWeb.contract().at(token_wallet.contract_address);
                            const hex_balance = await instance.balanceOf(token_wallet.wallet_address).call();
                            const usdt_balance = Number(hex_balance._hex);
                            if (usdt_balance > 0) {
                                //Creates an unsigned TRX transfer transaction
                                const usdtreceipt = await instance.transfer(
                                    cold_wallet.wallet_address,
                                    usdt_balance
                                ).send({
                                    feeLimit: trc20_fee_limit
                                }, token_wallet.private_key);
                                if (usdtreceipt) {
                                    /**
                                     * ~ update token wallet and create history & change current deposit status
                                     */
                                    await Wallets.updateOne({ _id: token_wallet._id }, {
                                        v_balanace: 0,
                                        ac_balance: usdt_balance / (Number(`1e${precision}`)),
                                        ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + ',' + Date.now() : Date.now(),
                                        ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + ',' + usdt_balance / (Number(`1e${precision}`)) : usdt_balance / (Number(`1e${precision}`))
                                    });
                                    await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                        $set: {
                                            capture_status: true
                                        }
                                    })
                                    /**
                                     * ! create history
                                     */
                                    await UserWalletCapture.create({
                                        user_id: token_wallet.user,
                                        tx_id: usdtreceipt,
                                        symbol: token_wallet.wallet_type,
                                        amount: usdt_balance / (Number(`1e${precision}`)),
                                        from_address: token_wallet.wallet_address,
                                        to_address: cold_wallet.wallet_address,
                                        type: contract_type
                                    });
                                    // await captureNextToken(wallet_list, index+1);
                                    // return true;
                                } else {
                                    console.log("Transaction failed: ", trxreceipt);
                                    // return false;
                                }
                            } else {
                                    await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                        $set: {
                                            capture_status: true
                                        }
                                    })
                                // await captureNextToken(wallet_list, index+1);
                                // return false;
                            }
                        } catch (error) {
                            console.log("Error in admin transfer (" + contract_type + ") : ", error);
                            // return false;
                        }
                    } else if (contract_type == 'trc10') {
                        try {
                            const ds = await fetch(`https://api.trongrid.io/v1/accounts/${token_wallet.wallet_address}`);//TV6MuMXfmLbBqPZvBHdwFsDnQeVfnmiuSi`);//
                            const dt = await ds.json();
                            console.log("dt: ", dt);
                            if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                let trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                                console.log("trc10: ", trc10);
                                if (trc10.length > 0) {
                                    const btt_data = trc10.find((data) => data.key == token_wallet.contract_address);
                                    console.log("btt_data: ", btt_data);
                                    if (btt_data && btt_data.key) {
                                        let trx_token_balance = btt_data.value;
                                        console.log("trx_token_balance: ", trx_token_balance);
                                        if (trx_token_balance > 0) {
                                            const btttradeobj = await tronWeb.transactionBuilder.sendToken(cold_wallet.wallet_address, trx_token_balance, token_wallet.contract_address, token_wallet.wallet_address);
                                            const bttsignedtxn = await tronWeb.trx.sign(btttradeobj, token_wallet.private_key);
                                            const bttreceipt = await tronWeb.trx.sendRawTransaction(bttsignedtxn);
                                            console.log("bttreceipt: ", bttreceipt);
                                            if (bttreceipt.result) {
                                                /**
                                                 * ~ update token wallet and create history & change current deposit status
                                                 */
                                                await Wallets.updateOne({ _id: token_wallet._id }, {
                                                    v_balanace: 0,
                                                    ac_balance: trx_token_balance / (Number(`1e${precision}`)),
                                                    ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
                                                    ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (trx_token_balance / (Number(`1e${precision}`))) : (trx_token_balance / (Number(`1e${precision}`))) + ','
                                                });
                                                try {
                                                    await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                                        $set: {
                                                            capture_status: true
                                                        }
                                                    });
                                                } catch (error) {
                                                    console.log("(TOKEN) Error in update deposit history!: ", error);
                                                }
                                                
                                                /**
                                                 * ! create history
                                                 */
                                                try {
                                                    await UserWalletCapture.create({
                                                        user_id: token_wallet.user,
                                                        tx_id: bttreceipt,
                                                        symbol: token_wallet.wallet_type,
                                                        amount: trx_token_balance / (Number(`1e${precision}`)),
                                                        from_address: token_wallet.wallet_address,
                                                        to_address: cold_wallet.wallet_address,
                                                        type: contract_type
                                                    });
                                                } catch (error) {
                                                    console.log("(TOKEN) Error in create capturing history!: ", error)
                                                }
                                                // await captureNextToken(wallet_list, index+1);
                                                // return true;
                                            }
                                        } else {
                                            await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                                $set: {
                                                    capture_status: true
                                                }
                                            })
                                            // await captureNextToken(wallet_list, index+1);
                                            // return false;
                                        }
                                    } else {
                                        // return false;
                                    }
                                } else {
                                    // return false;
                                }
                            } else {
                                // return false;
                            }
                        } catch (error) {
                            console.log("Error in trc10 capture: ", error);
                            // return false;
                        }
                    } else if (contract_type == 'bep20') {
                        try {
                            const contract = new web3BNB.eth.Contract(dex, token_wallet.contract_address);
                            const bal = await contract.methods.balanceOf(token_wallet.wallet_address).call();
                            if (bal > 0) {
                                //Creates an unsigned TRX transfer transaction
                                web3BNB.eth.accounts.wallet.add(token_wallet.private_key);
                                const gas = await contract.methods.transfer(cold_wallet.wallet_address, bal).estimateGas({ value: 0, from: token_wallet.wallet_address });
                                const receipt = await contract.methods.transfer(cold_wallet.wallet_address, bal).send({ value: 0, from: token_wallet.wallet_address, gas: gas });
                                if (receipt) {
                                    /**
                                     * ~ update token wallet and create history & change current deposit status
                                     */
                                    await Wallets.updateOne({ _id: token_wallet._id }, {
                                        v_balanace: 0,
                                        ac_balance: bal / (Number(`1e${precision}`)),
                                        ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
                                        ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (bal / (Number(`1e${precision}`))) : (bal / (Number(`1e${precision}`))) + ','
                                    });
                                    try {
                                        await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                            $set: {
                                                capture_status: true
                                            }
                                        })
                                    } catch (error) {
                                        console.log("(TOKEN) Error in update deposit history!: ", error);
                                    }
                                    
                                    /**
                                     * ! create history
                                     */
                                    try {
                                        await UserWalletCapture.create({
                                            user_id: token_wallet.user,
                                            tx_id: receipt.transactionHash,
                                            symbol: token_wallet.wallet_type,
                                            amount: bal / (Number(`1e${precision}`)),
                                            from_address: token_wallet.wallet_address,
                                            to_address: cold_wallet.wallet_address,
                                            type: contract_type
                                        });
                                    } catch (error) {
                                        console.log("(TOKEN) Error in create capturing history!: ", error);
                                    }
                                    // await captureNextToken(wallet_list, index+1);
                                    // return true;
                                } else {
                                    console.log("Transaction failed: ", trxreceipt);
                                    // return false;
                                }
                            } else {
                                await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                    $set: {
                                        capture_status: true
                                    }
                                })
                                // await captureNextToken(wallet_list, index+1);
                                // return false;
                            }
                        } catch (error) {
                            console.log("Error in admin transfer (" + contract_type + ") : ", error);
                            // return false;
                        }
                    } else if (contract_type == 'erc20') {
                        try {
                            const contract = new web3Eth.eth.Contract(dex, token_wallet.contract_address);
                            const bal = await contract.methods.balanceOf(token_wallet.wallet_address).call();
                            if (bal > 0) {
                                //Creates an unsigned TRX transfer transaction
                                web3Eth.eth.accounts.wallet.add(token_wallet.private_key);
                                const gas = await contract.methods.transfer(cold_wallet.wallet_address, bal).estimateGas({ value: 0, from: token_wallet.wallet_address });
                                const receipt = await contract.methods.transfer(cold_wallet.wallet_address, bal).send({ value: 0, from: token_wallet.wallet_address, gas: gas });
                                if (receipt) {
                                    /**
                                     * ~ update token wallet and create history & change current deposit status
                                     */
                                    await Wallets.updateOne({ _id: token_wallet._id }, {
                                        v_balanace: 0,
                                        ac_balance: bal / (Number(`1e${precision}`)),
                                        ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
                                        ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (bal / (Number(`1e${precision}`))) : (bal / (Number(`1e${precision}`))) + ','
                                    });
                                    
                                    try {
                                        await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                            $set: {
                                                capture_status: true
                                            }
                                        })
                                    } catch (error) {
                                        console.log("(TOKEN) Error in update deposit history!: ", error);
                                    }
                                    /**
                                     * ! create history
                                     */
                                    try {
                                        await UserWalletCapture.create({
                                            user_id: token_wallet.user,
                                            tx_id: receipt,
                                            symbol: token_wallet.wallet_type,
                                            amount: bal / (Number(`1e${precision}`)),
                                            from_address: token_wallet.wallet_address,
                                            to_address: cold_wallet.wallet_address,
                                            type: contract_type
                                        });
                                    } catch (error) {
                                        console.log("(TOKEN) Error in create capturing history!: ", error);
                                    }
                                    // await captureNextToken(wallet_list, index+1);
                                    // return true;
                                } else {
                                    console.log("Transaction failed: ", trxreceipt);
                                    // return false;
                                }
                            } else {
                                await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
                                    $set: {
                                        capture_status: true
                                    }
                                })
                                // return false;
                            }
                        } catch (error) {
                            console.log("Error in admin transfer (" + index + ") : ", error);
                            // return false;
                        }
                    } else {
                        // return false;
                    }
                } else {
                    // return false;
                }
            } else {
                // return false;
            }
            
            await captureNextToken(wallet_list, index+1);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error in capture next token: ", index, error.message);
        return false;
    }
}
async function captureToken(wallet_list) {
    // const Deposithistory = require('../models/deposite_history');
    // const Wallets = require('../models/wallets');
    // const ColdWallet = require('../models/wallet_cold');
    // const UserWalletCapture = require('../models/user_wallet_capture');
    /**
     * 
        var trc20_transfer = 20;
        var trc20_fee_limit = 20000000;
        var trc10_transfer = 1;
        var trc10_fee_limit = 10000000;
        var bep20_transfer = 0.0008;
        var erc20_transfer = 0.004;
     *
     */
     console.log("Error: (captureToken) ", wallet_list);
    try {
        if (wallet_list) {
            await captureNextToken(wallet_list, 0);
            return true;
            // let keys = Object.keys(wallet_list);
            // if (keys && keys.length > 0) {
            //     let a = keys.map(async (dk) => {
            //         let d = wallet_list[dk];
            //         let blockchain = d.blockchain;
            //         let address = d.wallet_address;
            //         let contract_addtess = d.contract_address;
            //         let contract_type = d.token_type;
            //         let symbol = d.symbol;
            //         let precision = d.precision;
            //         let _id = d._id;
            //         let currency_wallet = await Wallets.findOne({
            //             wallet_address: address,
            //             wallet_type: blockchain.toUpperCase()
            //         });
            //         let token_wallet = await Wallets.findOne({
            //             wallet_address: address,
            //             wallet_type: symbol
            //         });
            //         if (currency_wallet && token_wallet) {
            //             let cold_wallet = await ColdWallet.findOne({
            //                 wallet_type: blockchain.toUpperCase()
            //             })
            //             if (cold_wallet) {
            //                 if (contract_type == 'trc20') {
            //                     try {
            //                         tronWeb.setAddress(token_wallet.wallet_address);
            //                         const instance = await tronWeb.contract().at(token_wallet.contract_address);
            //                         const hex_balance = await instance.balanceOf(token_wallet.wallet_address).call();
            //                         const usdt_balance = Number(hex_balance._hex);
            //                         if (usdt_balance > 0) {
            //                             //Creates an unsigned TRX transfer transaction
            //                             const usdtreceipt = await instance.transfer(
            //                                 cold_wallet.wallet_address,
            //                                 usdt_balance
            //                             ).send({
            //                                 feeLimit: trc20_fee_limit
            //                             }, token_wallet.private_key);
            //                             if (usdtreceipt) {
            //                                 /**
            //                                  * ~ update token wallet and create history & change current deposit status
            //                                  */
            //                                 await Wallets.updateOne({ _id: token_wallet._id }, {
            //                                     v_balanace: 0,
            //                                     ac_balance: usdt_balance / (Number(`1e${precision}`)),
            //                                     ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + ',' + Date.now() : Date.now(),
            //                                     ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + ',' + usdt_balance / (Number(`1e${precision}`)) : usdt_balance / (Number(`1e${precision}`))
            //                                 });
            //                                 await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
            //                                     $set: {
            //                                         capture_status: true
            //                                     }
            //                                 })
            //                                 /**
            //                                  * ! create history
            //                                  */
            //                                 await UserWalletCapture.create({
            //                                     user_id: token_wallet.user,
            //                                     tx_id: usdtreceipt,
            //                                     symbol: token_wallet.wallet_type,
            //                                     amount: usdt_balance / (Number(`1e${precision}`)),
            //                                     from_address: token_wallet.wallet_address,
            //                                     to_address: cold_wallet.wallet_address,
            //                                     type: contract_type
            //                                 });
            //                                 return true;
            //                             } else {
            //                                 console.log("Transaction failed: ", trxreceipt);
            //                                 return false;
            //                             }
            //                         } else {
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in admin transfer (" + contract_type + ") : ", error);
            //                         return false;
            //                     }
            //                 } else if (contract_type == 'trc10') {
            //                     try {
            //                         const ds = await fetch(`https://api.trongrid.io/v1/accounts/${token_wallet.wallet_address}`);//TV6MuMXfmLbBqPZvBHdwFsDnQeVfnmiuSi`);//
            //                         const dt = await ds.json();
            //                         if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
            //                             let trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
            //                             if (trc10.length > 0) {
            //                                 const btt_data = trc10.find((data) => data.key == token_wallet.contract_address);
            //                                 if (btt_data && btt_data.key) {
            //                                     let trx_token_balance = btt_data.value;
            //                                     if (trx_token_balance > 0) {
            //                                         const btttradeobj = await tronWeb.transactionBuilder.sendToken(cold_wallet.wallet_address, trx_token_balance, token_wallet.contract_address, token_wallet.wallet_address);
            //                                         const bttsignedtxn = await tronWeb.trx.sign(btttradeobj, token_wallet.private_key);
            //                                         const bttreceipt = await tronWeb.trx.sendRawTransaction(bttsignedtxn);
            //                                         if (bttreceipt.result) {
            //                                             /**
            //                                              * ~ update token wallet and create history & change current deposit status
            //                                              */
            //                                             await Wallets.updateOne({ _id: token_wallet._id }, {
            //                                                 v_balanace: 0,
            //                                                 ac_balance: trx_token_balance / (Number(`1e${precision}`)),
            //                                                 ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
            //                                                 ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (trx_token_balance / (Number(`1e${precision}`))) : (trx_token_balance / (Number(`1e${precision}`))) + ','
            //                                             });
            //                                             try {
            //                                                 await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
            //                                                     $set: {
            //                                                         capture_status: true
            //                                                     }
            //                                                 });
            //                                             } catch (error) {
            //                                                 console.log("(TOKEN) Error in update deposit history!: ", error);
            //                                             }
                                                        
            //                                             /**
            //                                              * ! create history
            //                                              */
            //                                             try {
            //                                                 await UserWalletCapture.create({
            //                                                     user_id: token_wallet.user,
            //                                                     tx_id: bttreceipt,
            //                                                     symbol: token_wallet.wallet_type,
            //                                                     amount: trx_token_balance / (Number(`1e${precision}`)),
            //                                                     from_address: token_wallet.wallet_address,
            //                                                     to_address: cold_wallet.wallet_address,
            //                                                     type: contract_type
            //                                                 });
            //                                             } catch (error) {
            //                                                 console.log("(TOKEN) Error in create capturing history!: ", error)
            //                                             }
            //                                             return true;
            //                                         }
            //                                     }
            //                                 }
            //                             }
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in trc10: ", error);
            //                     }
            //                 } else if (contract_type == 'bep20') {
            //                     try {
            //                         const contract = new web3BNB.eth.Contract(dex, token_wallet.contract_address);
            //                         const bal = await contract.methods.balanceOf(token_wallet.wallet_address).call();
            //                         if (bal > 0) {
            //                             //Creates an unsigned TRX transfer transaction
            //                             web3BNB.eth.accounts.wallet.add(token_wallet.private_key);
            //                             const gas = await contract.methods.transfer(cold_wallet.wallet_address, bal).estimateGas({ value: 0, from: token_wallet.wallet_address });
            //                             const receipt = await contract.methods.transfer(cold_wallet.wallet_address, bal).send({ value: 0, from: token_wallet.wallet_address, gas: gas });
            //                             if (receipt) {
            //                                 /**
            //                                  * ~ update token wallet and create history & change current deposit status
            //                                  */
            //                                 await Wallets.updateOne({ _id: token_wallet._id }, {
            //                                     v_balanace: 0,
            //                                     ac_balance: bal / (Number(`1e${precision}`)),
            //                                     ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
            //                                     ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (bal / (Number(`1e${precision}`))) : (bal / (Number(`1e${precision}`))) + ','
            //                                 });
            //                                 try {
            //                                     await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
            //                                         $set: {
            //                                             capture_status: true
            //                                         }
            //                                     })
            //                                 } catch (error) {
            //                                     console.log("(TOKEN) Error in update deposit history!: ", error);
            //                                 }
                                            
            //                                 /**
            //                                  * ! create history
            //                                  */
            //                                 try {
            //                                     await UserWalletCapture.create({
            //                                         user_id: token_wallet.user,
            //                                         tx_id: receipt.transactionHash,
            //                                         symbol: token_wallet.wallet_type,
            //                                         amount: bal / (Number(`1e${precision}`)),
            //                                         from_address: token_wallet.wallet_address,
            //                                         to_address: cold_wallet.wallet_address,
            //                                         type: contract_type
            //                                     });
            //                                 } catch (error) {
            //                                     console.log("(TOKEN) Error in create capturing history!: ", error);
            //                                 }
            //                                 return true;
            //                             } else {
            //                                 console.log("Transaction failed: ", trxreceipt);
            //                                 return false;
            //                             }
            //                         } else {
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in admin transfer (" + contract_type + ") : ", error);
            //                         return false;
            //                     }
            //                 } else if (contract_type == 'erc20') {
            //                     try {
            //                         const contract = new web3Eth.eth.Contract(dex, token_wallet.contract_address);
            //                         const bal = await contract.methods.balanceOf(token_wallet.wallet_address).call();
            //                         if (bal > 0) {
            //                             //Creates an unsigned TRX transfer transaction
            //                             web3Eth.eth.accounts.wallet.add(token_wallet.private_key);
            //                             const gas = await contract.methods.transfer(cold_wallet.wallet_address, bal).estimateGas({ value: 0, from: token_wallet.wallet_address });
            //                             const receipt = await contract.methods.transfer(cold_wallet.wallet_address, bal).send({ value: 0, from: token_wallet.wallet_address, gas: gas });
            //                             if (receipt) {
            //                                 /**
            //                                  * ~ update token wallet and create history & change current deposit status
            //                                  */
            //                                 await Wallets.updateOne({ _id: token_wallet._id }, {
            //                                     v_balanace: 0,
            //                                     ac_balance: bal / (Number(`1e${precision}`)),
            //                                     ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
            //                                     ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (bal / (Number(`1e${precision}`))) : (bal / (Number(`1e${precision}`))) + ','
            //                                 });
                                            
            //                                 try {
            //                                     await Deposithistory.updateMany({ symbol: token_wallet.wallet_type, to_address: token_wallet.wallet_address }, {
            //                                         $set: {
            //                                             capture_status: true
            //                                         }
            //                                     })
            //                                 } catch (error) {
            //                                     console.log("(TOKEN) Error in update deposit history!: ", error);
            //                                 }
            //                                 /**
            //                                  * ! create history
            //                                  */
            //                                 try {
            //                                     await UserWalletCapture.create({
            //                                         user_id: token_wallet.user,
            //                                         tx_id: receipt,
            //                                         symbol: token_wallet.wallet_type,
            //                                         amount: bal / (Number(`1e${precision}`)),
            //                                         from_address: token_wallet.wallet_address,
            //                                         to_address: cold_wallet.wallet_address,
            //                                         type: contract_type
            //                                     });
            //                                 } catch (error) {
            //                                     console.log("(TOKEN) Error in create capturing history!: ", error);
            //                                 }
                                            
            //                                 return true;
            //                             } else {
            //                                 console.log("Transaction failed: ", trxreceipt);
            //                                 return false;
            //                             }
            //                         } else {
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in admin transfer (" + contract_type + ") : ", error);
            //                         return false;
            //                     }
            //                 }
            //             } else {
            //                 return false;
            //             }
            //         } else {
            //             return false;
            //         }
            //     });
            //     await Promise.all(a);
            //     return true;
            // } else {
            //     return undefined;
            // }
        } else {
            return undefined;
        }
    } catch (error) {
        console.log("Error from (captureToken): ", error.message);
        return undefined;
    }
}
async function captureNextCurrency(wallet_list,index) {
    try {
        let keys = Object.keys(wallet_list);
        if (keys[index]) {
            let dk = keys[index];
            let d = wallet_list[dk];
            let address = d.wallet_address;
            let symbol = d.symbol;
            let _id = d._id;

            let currency_wallet = await Wallets.findOne({
                wallet_address: address,
                wallet_type: symbol.toUpperCase()
            });
            if (currency_wallet) {
                let cold_wallet = await ColdWallet.findOne({
                    wallet_type: symbol.toUpperCase()
                })
                if (cold_wallet) {
                    if (symbol == 'TRX') {
                        try {
                            const ds = await fetch(`https://api.trongrid.io/v1/accounts/${currency_wallet.wallet_address}`);//TBGXMT56vCd7H1jqYUW5RtJYbmqfJ3zM8p`);//${wallet.wallet_address}`);//);
                            const dt = await ds.json();
                            let trc10 = [];
                            let trc20 = [];
                            console.log(dt['data'][0], "trx");
                            if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                                trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
                                let trx_balance = dt['data'][0].balance;
                                console.log('TRX balance: ', trx_balance);
                                if (trx_balance > 0) {
                                    const tradeobj = await tronWeb.transactionBuilder.sendTrx(cold_wallet.wallet_address, trx_balance - (0.3*1e6), currency_wallet.wallet_address);
                                    const signedtxn = await tronWeb.trx.sign(tradeobj, currency_wallet.private_key);
                                    const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
                                    console.log('TRX trxreceipt: ', trxreceipt);
                                    if (trxreceipt.result) {
                                        /**
                                         * ~ update admin transfer wallet
                                         */
                                        await Wallets.updateOne({ _id: currency_wallet._id }, {
                                            admin_transfer: 0.3,
                                            v_balanace: 0,
                                            ac_last_date: currency_wallet.ac_last_date ? currency_wallet.ac_last_date + Date.now() : Date.now()+",",
                                            ac_transfer_last_bal: currency_wallet.ac_transfer_last_bal ? currency_wallet.ac_transfer_last_bal +  ((trx_balance / 1e6) - 0.3) : ((trx_balance / 1e18) - 0.3)+","
                                        });
                                        try {
                                            await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
                                                $set: {
                                                    capture_status: true
                                                }
                                            })
                                        } catch (error) {
                                            console.log(" Error in update deposit history!: ", error);
                                        }
                                        try {
                                            await UserWalletCapture.create({
                                                user_id: currency_wallet.user,
                                                tx_id: trxreceipt.txid,
                                                symbol: currency_wallet.wallet_type,
                                                amount: (trx_balance / 1e6) - 0.3,
                                                from_address: currency_wallet.wallet_address,
                                                to_address: cold_wallet.wallet_address,
                                                type: ''
                                            });
                                        } catch (error) {
                                            console.log(" Error in create capturing history!: ", error);
                                        }
                                        // await captureNextCurrency(wallet_list, index+1);
                                        // return true;
                                    } else {
                                        console.log("Transaction failed: ", trxreceipt);
                                        // return false;
                                    }
                                } else {
                                    await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
                                        $set: {
                                            capture_status: true
                                        }
                                    })
                                    // return false;
                                }
                            } else {
                                // return false;
                            }
                        } catch (error) {
                            console.log("Error in trx: (cptr): ", error);
                            // return false;
                        }
                    } else if (symbol == 'ETH') {
                        try {
                            const bal = await web3Eth.eth.getBalance(currency_wallet.wallet_address);
                            if (bal > 0) {
                                const esgas = await web3Eth.eth.estimateGas({
                                    to: currency_wallet.wallet_address
                                });
                                const gasp = await web3Eth.eth.getGasPrice()
                                const createTransaction = await web3Eth.eth.accounts.signTransaction(
                                    {
                                        from: currency_wallet.wallet_address,
                                        to: cold_wallet.wallet_address,
                                        value: (bal - (esgas * gasp)),
                                        gas: esgas,
                                    },
                                    currency_wallet.private_key
                                );
                                // Deploy transaction
                                const createReceipt = await web3Eth.eth.sendSignedTransaction(
                                    createTransaction.rawTransaction
                                );
                                if (createReceipt) {
                                    /**
                                        * ~ update admin transfer wallet
                                        */
                                    // const bal1 = await web3Eth.eth.getBalance(currency_wallet.wallet_address);
                                    await Wallets.updateOne({ _id: currency_wallet._id }, {
                                        admin_transfer: 0,
                                        v_balanace: 0,
                                        ac_last_date: currency_wallet.ac_last_date ? currency_wallet.ac_last_date + Date.now() : Date.now() + ',',
                                        ac_transfer_last_bal: currency_wallet.ac_transfer_last_bal ? currency_wallet.ac_transfer_last_bal + (bal / 1e18) : (bal / 1e18) + ','
                                    });
                                    
                                    try {
                                        await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
                                            $set: {
                                                capture_status: true
                                            }
                                        })
                                    } catch (error) {
                                        console.log(" Error in update deposit history!: ", error);
                                    }
                                    try {
                                        await UserWalletCapture.create({
                                            user_id: currency_wallet.user,
                                            tx_id: createReceipt,
                                            symbol: currency_wallet.wallet_type,
                                            amount: bal / 1e18,
                                            from_address: currency_wallet.wallet_address,
                                            to_address: cold_wallet.wallet_address,
                                            type: ''
                                        });
                                    } catch (error) {
                                        console.log(" Error in create capturing history!: ", error);
                                    }
                                    // await captureNextCurrency(wallet_list, index+1);
                                    // return true;
                                } else {
                                    console.log("Transaction failed: ", trxreceipt);
                                    // return false;
                                }
                            } else {
                                await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
                                    $set: {
                                        capture_status: true
                                    }
                                })
                                // return false;
                            }
                        } catch (error) {
                            console.log("Error in eth: (cptr): ", error);
                            // return false;
                        }
                    } else if (symbol == 'BNB') {
                        try {
                            const bal = await web3BNB.eth.getBalance(currency_wallet.wallet_address);
                            if (bal > 0) {
                                const esgas = await web3BNB.eth.estimateGas({
                                    to: currency_wallet.wallet_address
                                });
                                const gasp = await web3BNB.eth.getGasPrice()
                                const createTransaction = await web3BNB.eth.accounts.signTransaction(
                                    {
                                        from: currency_wallet.wallet_address,
                                        to: cold_wallet.wallet_address,
                                        value: (bal - (esgas * gasp)),
                                        gas: esgas,
                                    },
                                    currency_wallet.private_key
                                );
                                // Deploy transaction
                                const createReceipt = await web3BNB.eth.sendSignedTransaction(
                                    createTransaction.rawTransaction
                                );
                                if (createReceipt.result) {
                                    /**
                                        * ~ update admin transfer wallet
                                        */
                                    // const bal2 = await web3BNB.eth.getBalance(currency_wallet.wallet_address);
                                    await Wallets.updateOne({ _id: currency_wallet._id }, {
                                        admin_transfer: 0,
                                        v_balanace: 0,
                                        ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
                                        ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (bal / 1e18) : (bal / 1e18) + ','
                                    });
                                    try {
                                        await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
                                            $set: {
                                                capture_status: true
                                            }
                                        })
                                    } catch (error) {
                                        console.log(" Error in update deposit history!: ", error);
                                    }
                                    try {
                                        await UserWalletCapture.create({
                                            user_id: currency_wallet.user,
                                            tx_id: createReceipt.transactionHash,
                                            symbol: currency_wallet.wallet_type,
                                            amount: bal / 1e18,
                                            from_address: currency_wallet.wallet_address,
                                            to_address: cold_wallet.wallet_address,
                                            type: ''
                                        });
                                    } catch (error) {
                                        console.log(" Error in create capturing history!: ", error);
                                    }
                                    // await captureNextCurrency(wallet_list, index+1);
                                    // return true;
                                } else {
                                    console.log("Transaction failed: ", createReceipt);
                                    // return false;
                                }
                            } else {
                                await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
                                    $set: {
                                        capture_status: true
                                    }
                                })
                                // return false;
                            }
                        } catch (error) {
                            console.log("Error in bnb: (cptr): ", error);
                            // return false;
                        }
                    } else {
                        // return false;
                    }
                } else {
                    // return false;
                }
            } else {
                // return false;
            }
            await captureNextCurrency(wallet_list,index+1);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error in capture cutency: ", index, error.message);
    }
}
async function captureCurrency(wallet_list) {
    try {
        if (wallet_list) {
            await captureNextCurrency(wallet_list, 0);
            return true;
            // let keys = Object.keys(wallet_list);
            // if (keys && keys.length > 0) {
            //     let a = keys.map(async (dk) => {
            //         let d = wallet_list[dk];
            //         let address = d.wallet_address;
            //         let symbol = d.symbol;
            //         let _id = d._id;

            //         let currency_wallet = await Wallets.findOne({
            //             wallet_address: address,
            //             wallet_type: symbol.toUpperCase()
            //         });
            //         if (currency_wallet) {
            //             let cold_wallet = await ColdWallet.findOne({
            //                 wallet_type: symbol.toUpperCase()
            //             })
            //             if (cold_wallet) {
            //                 if (symbol == 'TRX') {
            //                     try {
            //                         const ds = await fetch(`https://api.trongrid.io/v1/accounts/${currency_wallet.wallet_address}`);//TBGXMT56vCd7H1jqYUW5RtJYbmqfJ3zM8p`);//${wallet.wallet_address}`);//);
            //                         const dt = await ds.json();
            //                         let trc10 = [];
            //                         let trc20 = [];
            //                         console.log(dt['data'][0], "trx");
            //                         if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
            //                             trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
            //                             trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
            //                             let trx_balance = dt['data'][0].balance;
            //                             console.log('TRX balance: ', trx_balance);
            //                             if (trx_balance > 0) {
            //                                 const tradeobj = await tronWeb.transactionBuilder.sendTrx(cold_wallet.wallet_address, trx_balance - (0.3*1e6), currency_wallet.wallet_address);
            //                                 const signedtxn = await tronWeb.trx.sign(tradeobj, currency_wallet.private_key);
            //                                 const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
            //                                 console.log('TRX trxreceipt: ', trxreceipt);
            //                                 if (trxreceipt.result) {
            //                                     /**
            //                                      * ~ update admin transfer wallet
            //                                      */
            //                                     await Wallets.updateOne({ _id: currency_wallet._id }, {
            //                                         admin_transfer: 0.3,
            //                                         v_balanace: 0,
            //                                         ac_last_date: currency_wallet.ac_last_date ? currency_wallet.ac_last_date + Date.now() : Date.now()+",",
            //                                         ac_transfer_last_bal: currency_wallet.ac_transfer_last_bal ? currency_wallet.ac_transfer_last_bal +  ((trx_balance / 1e6) - 0.3) : ((trx_balance / 1e18) - 0.3)+","
            //                                     });
            //                                     try {
            //                                         await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
            //                                             $set: {
            //                                                 capture_status: true
            //                                             }
            //                                         })
            //                                     } catch (error) {
            //                                         console.log(" Error in update deposit history!: ", error);
            //                                     }
            //                                     try {
            //                                         await UserWalletCapture.create({
            //                                             user_id: currency_wallet.user,
            //                                             tx_id: trxreceipt.txid,
            //                                             symbol: currency_wallet.wallet_type,
            //                                             amount: (trx_balance / 1e6) - 0.3,
            //                                             from_address: currency_wallet.wallet_address,
            //                                             to_address: cold_wallet.wallet_address,
            //                                             type: ''
            //                                         });
            //                                     } catch (error) {
            //                                         console.log(" Error in create capturing history!: ", error);
            //                                     }
                                                
            //                                     return true;
            //                                 } else {
            //                                     console.log("Transaction failed: ", trxreceipt);
            //                                     return false;
            //                                 }
            //                             } else {
            //                                 return false;
            //                             }
            //                         } else {
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in trx: (cptr): ", error);
            //                         return false;
            //                     }
            //                 } else if (symbol == 'ETH') {
            //                     try {
            //                         const bal = await web3Eth.eth.getBalance(currency_wallet.wallet_address);
            //                         if (bal > 0) {
            //                             const esgas = await web3Eth.eth.estimateGas({
            //                                 to: currency_wallet.wallet_address
            //                             });
            //                             const gasp = await web3Eth.eth.getGasPrice()
            //                             const createTransaction = await web3Eth.eth.accounts.signTransaction(
            //                                 {
            //                                     from: currency_wallet.wallet_address,
            //                                     to: cold_wallet.wallet_address,
            //                                     value: (bal - (esgas * gasp)),
            //                                     gas: esgas,
            //                                 },
            //                                 currency_wallet.private_key
            //                             );
            //                             // Deploy transaction
            //                             const createReceipt = await web3Eth.eth.sendSignedTransaction(
            //                                 createTransaction.rawTransaction
            //                             );
            //                             if (createReceipt) {
            //                                 /**
            //                                  * ~ update admin transfer wallet
            //                                  */
            //                                 // const bal1 = await web3Eth.eth.getBalance(currency_wallet.wallet_address);
            //                                 await Wallets.updateOne({ _id: currency_wallet._id }, {
            //                                     admin_transfer: 0,
            //                                     v_balanace: 0,
            //                                     ac_last_date: currency_wallet.ac_last_date ? currency_wallet.ac_last_date + Date.now() : Date.now() + ',',
            //                                     ac_transfer_last_bal: currency_wallet.ac_transfer_last_bal ? currency_wallet.ac_transfer_last_bal + (bal / 1e18) : (bal / 1e18) + ','
            //                                 });
                                            
            //                                 try {
            //                                     await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
            //                                         $set: {
            //                                             capture_status: true
            //                                         }
            //                                     })
            //                                 } catch (error) {
            //                                     console.log(" Error in update deposit history!: ", error);
            //                                 }
            //                                 try {
            //                                     await UserWalletCapture.create({
            //                                         user_id: currency_wallet.user,
            //                                         tx_id: createReceipt,
            //                                         symbol: currency_wallet.wallet_type,
            //                                         amount: bal / 1e18,
            //                                         from_address: currency_wallet.wallet_address,
            //                                         to_address: cold_wallet.wallet_address,
            //                                         type: ''
            //                                     });
            //                                 } catch (error) {
            //                                     console.log(" Error in create capturing history!: ", error);
            //                                 }
                                            
            //                                 return true;
            //                             } else {
            //                                 console.log("Transaction failed: ", trxreceipt);
            //                                 return false;
            //                             }
            //                         } else {
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in eth: (cptr): ", error);
            //                         return false;
            //                     }
            //                 } else if (symbol == 'BNB') {
            //                     try {
            //                         const bal = await web3BNB.eth.getBalance(currency_wallet.wallet_address);
            //                         if (bal > 0) {
            //                             const esgas = await web3BNB.eth.estimateGas({
            //                                 to: currency_wallet.wallet_address
            //                             });
            //                             const gasp = await web3BNB.eth.getGasPrice()
            //                             const createTransaction = await web3BNB.eth.accounts.signTransaction(
            //                                 {
            //                                     from: currency_wallet.wallet_address,
            //                                     to: cold_wallet.wallet_address,
            //                                     value: (bal - (esgas * gasp)),
            //                                     gas: esgas,
            //                                 },
            //                                 currency_wallet.private_key
            //                             );
            //                             // Deploy transaction
            //                             const createReceipt = await web3BNB.eth.sendSignedTransaction(
            //                                 createTransaction.rawTransaction
            //                             );
            //                             if (createReceipt.result) {
            //                                 /**
            //                                  * ~ update admin transfer wallet
            //                                  */
            //                                 // const bal2 = await web3BNB.eth.getBalance(currency_wallet.wallet_address);
            //                                 await Wallets.updateOne({ _id: currency_wallet._id }, {
            //                                     admin_transfer: 0,
            //                                     v_balanace: 0,
            //                                     ac_last_date: token_wallet.ac_last_date ? token_wallet.ac_last_date + Date.now() : Date.now() + ',',
            //                                     ac_transfer_last_bal: token_wallet.ac_transfer_last_bal ? token_wallet.ac_transfer_last_bal + (bal / 1e18) : (bal / 1e18) + ','
            //                                 });
            //                                 try {
            //                                     await Deposithistory.updateMany({ symbol: currency_wallet.wallet_type, to_address: currency_wallet.wallet_address }, {
            //                                         $set: {
            //                                             capture_status: true
            //                                         }
            //                                     })
            //                                 } catch (error) {
            //                                     console.log(" Error in update deposit history!: ", error);
            //                                 }
            //                                 try {
            //                                     await UserWalletCapture.create({
            //                                         user_id: currency_wallet.user,
            //                                         tx_id: createReceipt.transactionHash,
            //                                         symbol: currency_wallet.wallet_type,
            //                                         amount: bal / 1e18,
            //                                         from_address: currency_wallet.wallet_address,
            //                                         to_address: cold_wallet.wallet_address,
            //                                         type: ''
            //                                     });
            //                                 } catch (error) {
            //                                     console.log(" Error in create capturing history!: ", error);
            //                                 }
                                            
            //                                 return true;
            //                             } else {
            //                                 console.log("Transaction failed: ", createReceipt);
            //                                 return false;
            //                             }
            //                         } else {
            //                             return false;
            //                         }
            //                     } catch (error) {
            //                         console.log("Error in bnb: (cptr): ", error);
            //                         return false;
            //                     }
            //                 } else {
            //                     return false;
            //                 }
            //             } else {
            //                 return false;
            //             }
            //         } else {
            //             return false;
            //         }
            //     });
            //     await Promise.all(a);
            //     return true;
            // } else {
            //     return undefined;
            // }
        } else {
            return undefined;
        }
    } catch (error) {
        console.log("Error in capture currency: ", error)
        return undefined;
    }
}
module.exports = {
    createUniqueID,
    calculatePercentage,
    calculateMakerFee,
    calculateTakerFee,
    createUniqueAccessToken,
    generateOTP,
    createHash,
    generateReferalCode,
    compareHash,
    formatEmail,
    getUserIdFromReferalCode,
    distributeReferal,
    MergeWithTable,
    isKycDone,
    isPaired,
    distributeAirdrop,
    updateAirDrophistory,
    generateTransectionid,
    updateReferalhistory,
    getBankDetails,
    injectInGraph,
    getUserActivity,
    getCMCOHVA,
    createAccessToken,
    decrypt,
    toFixed,
    getHighest,
    getLowest,
    getTotalVolume,
    getIndianHours,
    getIndianHoursFrom,
    calcTime,
    getIndianDate,
    getIndianDateFrom,
    getFilteredDepositHistory,
    sendAdmimTransfer,
    captureToken,
    captureCurrency
}
