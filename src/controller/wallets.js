const { createUserWallets, getWithdrawHistory, getDepositHistory, getInrHistory } = require("../utils/function.wallets");
const { getFilteredDepositHistory, sendAdmimTransfer, captureToken, captureCurrency, generateTransectionid, generateOTP } = require("../utils/functions");
const { setMobileOtp, sendMobileOtp } = require("../utils/functions.users");
const {
    createBTCAddress,
    createETHAddress,
    createTRXAddress,
    createBCHAddress,
    createLTCAddress,
    createDASHAddress,
    createXRPAddress,
    createUSDTAddress,
    createBTTAddress,
    createUNIAddress,
    createDOGEAddress,
    updateColdW,
    updateHotW,
    synchotWallet
 } = require("../utils/functions.wallets");
const { validateUserId, isAdmin, isFloat} = require("../utils/validator");

async function createWallet(req, res) {
    try {
        const Wallets = require("../models/wallets");
        const { user_id, symbol } = req.body;
        console.log(user_id, symbol)
        if (user_id && validateUserId(user_id)) {
            if (symbol) {
                /**
                 * check for wallet already created or not
                 */
                const user_wallet = await Wallets.findOne({ user: user_id, wallet_type: new RegExp("^" + symbol + "$", "i") });
                if (user_wallet && user_wallet.address) {
                    return res.json({
                        status: 200,
                        error: false,
                        wallet_address: user_wallet.address,
                        message: "Success!"
                    })
                }
                switch (symbol.toUpperCase()) {
                    case 'BTC':
                        /**
                         * first check if user already have created wallet or not:
                         * if yes then return previous data
                         * if no then create new wallet
                         */
                        const btc_addr = await createBTCAddress();
                        if (btc_addr && btc_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = btc_addr.symbol;
                            // currency_data.name = btc_addr.type;
                            currency_data.private_key = btc_addr.privateKey;
                            currency_data.wallet_address = btc_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: btc_addr.privateKey,
                                        wallet_address: btc_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: btc_addr.address,
                                    symbol: btc_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'ETH':
                        const eth_address = await createETHAddress();
                        if (eth_address && eth_address.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = eth_address.symbol;
                            // currency_data.name = eth_address.type;
                            currency_data.private_key = eth_address.privateKey;
                            currency_data.wallet_address = eth_address.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: eth_address.privateKey,
                                        wallet_address: eth_address.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: eth_address.address,
                                    symbol: eth_address.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'TRX':
                        const trx_addr = await createTRXAddress();
                        if (trx_addr && trx_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = trx_addr.symbol;
                            // currency_data.name = trx_addr.type;
                            currency_data.private_key = trx_addr.privateKey;
                            currency_data.wallet_address = trx_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: trx_addr.privateKey,
                                        wallet_address: trx_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: trx_addr.address,
                                    symbol: trx_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'BCH':
                        const bch_addr = await createBCHAddress();
                        if (bch_addr && bch_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = bch_addr.symbol;
                            // currency_data.name = bch_addr.type;
                            currency_data.private_key = bch_addr.privateKey;
                            currency_data.wallet_address = bch_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: bch_addr.privateKey,
                                        wallet_address: bch_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: bch_addr.address,
                                    symbol: bch_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'LTC':
                        const ltc_addr = await createLTCAddress();
                        if (ltc_addr && ltc_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = ltc_addr.symbol;
                            // currency_data.name = ltc_addr.type;
                            currency_data.private_key = ltc_addr.privateKey;
                            currency_data.wallet_address = ltc_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: ltc_addr.privateKey,
                                        wallet_address: ltc_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: ltc_addr.address,
                                    symbol: ltc_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'DASH':
                        const dash_addr = await createDASHAddress();
                        if (dash_addr && dash_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = dash_addr.symbol;
                            // currency_data.name = dash_addr.type;
                            currency_data.private_key = dash_addr.privateKey;
                            currency_data.wallet_address = dash_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: dash_addr.privateKey,
                                        wallet_address: dash_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: dash_addr.address,
                                    symbol: dash_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'XRP':
                        const xrp_addr = await createXRPAddress();
                        if (xrp_addr && xrp_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = xrp_addr.symbol;
                            // currency_data.name = xrp_addr.type;
                            currency_data.private_key = xrp_addr.privateKey;
                            currency_data.wallet_address = xrp_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: xrp_addr.privateKey,
                                        wallet_address: xrp_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: xrp_addr.address,
                                    symbol: xrp_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'USDT':
                        const usdt_addr = await createUSDTAddress();
                        if (usdt_addr && usdt_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = usdt_addr.symbol;
                            // currency_data.name = usdt_addr.type;
                            currency_data.private_key = usdt_addr.privateKey;
                            currency_data.wallet_address = usdt_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: usdt_addr.privateKey,
                                        wallet_address: usdt_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: usdt_addr.address,
                                    symbol: usdt_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'BTT':
                        const btt_addr = await createBTTAddress();
                        if (btt_addr && btt_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = btt_addr.symbol;
                            // currency_data.name = btt_addr.type;
                            currency_data.private_key = btt_addr.privateKey;
                            currency_data.wallet_address = btt_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: btt_addr.privateKey,
                                        wallet_address: btt_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: btt_addr.address,
                                    symbol: btt_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'UNI':
                        const uni_addr = await createUNIAddress();
                        if (uni_addr && uni_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = uni_addr.symbol;
                            // currency_data.name = uni_addr.type;
                            currency_data.private_key = uni_addr.privateKey;
                            currency_data.wallet_address = uni_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: uni_addr.privateKey,
                                        wallet_address: uni_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: uni_addr.address,
                                    symbol: uni_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    case 'DOGE':
                        const doge_addr = await createDOGEAddress();
                        if (doge_addr && doge_addr.address) {
                            const currency_data = {};
                            currency_data.user_id = user_id;
                            currency_data.wallet_type = doge_addr.symbol;
                            // currency_data.name = doge_addr.type;
                            currency_data.private_key = doge_addr.privateKey;
                            currency_data.wallet_address = doge_addr.address;
                            currency_data.date = Date.now();
                            currency_data.wallet_status = 1;

                            // store in db
                            if (user_wallet) {
                                await Wallets.create(currency_data);
                            } else {
                                await Wallets.updateOne({ user: user_id, wallet_type: symbol }, {
                                    $set: {
                                        private_key: doge_addr.privateKey,
                                        wallet_address: doge_addr.address,
                                    }
                                })
                            }
                            return res.json({
                                status: 200,
                                error: false,
                                message: "Success",
                                data: {
                                    address: doge_addr.address,
                                    symbol: doge_addr.symbol
                                }
                            })
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Something went wrong, please try again!",
                                data: undefined
                            })
                        }
                        break;
                    default:
                        return res.json({
                            status: 400,
                            error: true,
                            message: "Invalid request"
                        })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request*"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request**"
            })
        }
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>createWallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again!"
        })
    }
}
async function createAllWallet(req, res) {
    try {
        const Wallets = require("../models/wallets");
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            /**
             * check for wallet already created or not
             */
            const user_wallet = await Wallets.findOne({ user: user_id, wallet_type:'BTC' });
            if (user_wallet && user_wallet.wallet_address) {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Allready created",
                })
            }
            /**
             * address creation
             */
            const iscreated = await createUserWallets(user_id);
            if (iscreated)
                return res.json({
                    status: 200,
                    error: false,
                    message: "Wallet created"
                })
            else
                return res.json({
                    status: 400,
                    error: true,
                    message: "wallet couldn't created"
                })
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request**"
            })
        }
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>createWallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again!"
        })
    }
}
async function getcoldWallet(req, res) {
    try {
        const { wallet_type } = req.query;
        let wallet = '';
        if (wallet_type) {
            const ColdWallets = require("../models/wallet_cold");
            wallet = await ColdWallets.find({ wallet_type: wallet_type});
        }else{
            const ColdWallets = require("../models/wallet_cold");
            wallet = await ColdWallets.aggregate( [
                {
                    $lookup: {
                        from: "suppoted_currency",
                        localField: "wallet_type",
                        foreignField: "symbol",
                        as: "suppoted_currency",
                    }
                },
            ] );
            await synchotWallet(wallet, ColdWallets);
            wallet = await ColdWallets.aggregate( [
                {
                    $lookup: {
                        from: "suppoted_currency",
                        localField: "wallet_type",
                        foreignField: "symbol",
                        as: "suppoted_currency",
                    }
                },
            ] );
            wallet = wallet.map((item) => {
                let n = item; 
                let contractType = item.suppoted_currency[0] ? item.suppoted_currency[0].contract_type : '';
                let captureFund = item.suppoted_currency[0] ? item.suppoted_currency[0].capture_fund : '';
                n.contract_type = contractType
                n.capture_fund = captureFund
                delete n.suppoted_currency;
                return n
            })
        }
        return res.json(wallet)
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>getcoldWallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in cold wallet, please try again!"
        })
    }
}
async function gethotWallet(req, res) {
    try {
        
        const { wallet_type } = req.query;
        let wallet = '';
        if (wallet_type) {
            const HotWallets = require("../models/wallet_hot");
            wallet = await HotWallets.find({ wallet_type: wallet_type});
            wallet = wallet.map((item) => {
                item.private_key = addStar(item.private_key)
                return item
            })
        }else{
            const HotWallets = require("../models/wallet_hot");
            wallet = await HotWallets.find( {});
            wallet = wallet.map((item) => {
                let n = item; 
                n.private_key = addStar(item.private_key)
                delete n.suppoted_currency;
                return n
            })
        }
        return res.json(wallet)
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>gethotWallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in hot wallet, please try again!"
        })
    }
}
function addStar(str){
    if(str){
        return str.substr(0,5)+"***************"+str.substr(-5)    
    }
    return '';
}
async function getallcoin(req, res) {
    try {
        const Currency = require("../models/suppoted_currency");
        const { wallet_type } = req.query;
        let allcurrency = '';
        if (wallet_type) {
            allcurrency = await Currency.find({ wallet_type: wallet_type});
        }else{
            allcurrency = await Currency.find().sort( { status : 1 });
        }
        return res.json(allcurrency)
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>gethotWallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in hot wallet, please try again!"
        })
    }
}
async function updatecoldwallet(req, res) {
    try {
        const { wallet_type,wallet_address } = req.body;
        if (wallet_type && wallet_address) {
            const iscreated = await updateColdW(wallet_type,wallet_address);
            if (iscreated){
                let ColdWallets = require("../models/wallet_cold");
                let allcurrency = await ColdWallets.find();
                return res.json({
                    status: 200,
                    error: false,
                    query_status: iscreated,
                    table: allcurrency,
                    message: "Wallet address added successfully."
                })
            }
        }
        return res.json({
            status: 200,
            query_status: 0,
            error: true,
            wallet_type: 'wallet_type',
            wallet_address: req,
            message: "Provide Wallet Coin and address"
        })
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>updatecoldwallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in cold wallet, please try again!"
        })
    }
}
async function updatehotwallet(req, res) {
    try {
        const { wallet_type,wallet_address, private_key } = req.body;
        if (wallet_type && (wallet_address || private_key)) {
            const iscreated = await updateHotW(wallet_type,wallet_address,private_key);
            if (iscreated){
                let HotWallets = require("../models/wallet_hot");
                let allcurrency = await HotWallets.find();
                return res.json({
                    status: 200,
                    error: false,
                    query_status: iscreated,
                    table: allcurrency,
                    message: "Wallet address added successfully."
                })
            }
        }
        return res.json({
            status: 200,
            error: true,
            query_status: 0,
            wallet_type: 'wallet_type',
            wallet_address: req,
            message: "Insufficiant sds data"
        })
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>updatecoldwallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in hot wallet, please try again!"
        })
    }
}
function totalCurrency(wallets,index){
    let newAR = {};
    let pushVal = [];
    wallets.map((item) =>{
        item.all_wallet.map((i2) =>{
            let wt = i2.wallet_type;
            let bl = i2[index];
            if(pushVal.includes(wt)){
                let nl = Number(newAR[wt]) + Number(i2[index]);
                newAR[wt] = isFloat(nl) ? nl.toFixed(2) : nl; 
            }else{
                pushVal.push(wt)
                newAR[wt] = Number(bl);
            }
        })
    })
    return newAR;
}
async function getwallets(req, res) {
    const Wallets = require("../models/wallets");
    const KYC = require("../models/pending_kyc");
    let dt = Date.now();
    try {
        const { user_id, action ,wallet_type } = req.body;
        if (user_id && validateUserId(user_id)) {
            const wallets = await Wallets.find({ user: user_id });
            const supported_currency = await getSupportedCurrency();
            let user_wallet = {};
            if (wallets && Array.isArray(wallets) && wallets.length > 0) {
                wallets.map((wallet) => {
                    let temp = {};
                    temp.wallet_address = wallet.wallet_address;
                    temp.symbol = wallet.wallet_type;
                    temp.icon = getIconFromSupportedCurrency(supported_currency, wallet.wallet_type);
                    temp.balance = wallet.balance;
                    temp.locked = wallet.locked;
                    temp.status = getDWStatusFromSupportedCurrency(supported_currency, wallet.wallet_type);
                    user_wallet[wallet.wallet_type] = temp;
                })
            }
            return res.json({
                status: 200,
                error: false,
                params: {
                    wallets: user_wallet
                },
                message: "Success "+ dt+ '-' + Date.now()
            })
        } else {
            let GetWallet = inUserID =  wallets = currencylist = {};
            const Currency = require('../models/suppoted_currency')
            if(action == 'v_balance'){
                wallets = await Wallets.aggregate([
                    {
                        $match: { balance: { $gt: 0 }},
                    },
                    {
                        $group: {
                            _id: "$user",
                            all_wallet: {
                                $push: {
                                    user_id: "$user",
                                    v_balance: "$v_balance",
                                    balance: "$balance",
                                    wallet_type: "$wallet_type",
                                    createdAt: "$createdAt",
                                    updatedAt: "$updatedAt",
                                },
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "pending_kyc",
                            localField: "_id",
                            foreignField: "user_id",
                            as: "users",
                        },
                    },
                    {
                        $replaceRoot: { 
                            newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } 
                        }
                    },
                    {
                        $project: { 
                            first_name:1,last_name:1,middle_name:1 ,email: 1,createdAt:1,user_id:1,all_wallet:1
                        } 
                    }
                  ]);
                wallets = wallets && wallets.map((res) => {
                    if(res.all_wallet){
                        res.all_wallet.map ((res2) => {
                            res[res2.wallet_type] = res2 && res2.balance ? res2.balance : 0;
                        })
                    }
                    return res;
                })
                GetWallet = totalCurrency(wallets,'v_balance');
                currencylist = await Currency.find({},"symbol name").sort( { "symbol": 1 } );
            }else if(action == 'ac_balance') {
                wallets = await Wallets.aggregate([
                    {
                        $match: { ac_balance: { $gt: 0 }},
                    },
                    {
                        $group: {
                            _id: "$user",
                            all_wallet: {
                                $push: {
                                    user_id: "$user",
                                    balance: "$balance",
                                    ac_balance: "$ac_balance",
                                    wallet_type: "$wallet_type",
                                    createdAt: "$createdAt",
                                    updatedAt: "$updatedAt",
                                },
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "pending_kyc",
                            localField: "_id",
                            foreignField: "user_id",
                            as: "users",
                        },
                    },
                    {
                        $replaceRoot: { 
                            newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } 
                        }
                    },
                    {
                        $project: { 
                            first_name:1,last_name:1,middle_name:1 ,email: 1,createdAt:1,user_id:1,all_wallet:1
                        } 
                    }
                  ]);
                  wallets = wallets && wallets.map((res) => {
                    if(res.all_wallet){
                        res.all_wallet.map ((res2) => {
                            res[res2.wallet_type] = res2 && res2.ac_balance ? res2.ac_balance : 0;;
                        })
                    }
                    return res;
                  })
                GetWallet = totalCurrency(wallets,'ac_balance');
                currencylist = await Currency.find({},"symbol name").sort( { "symbol": 1 } );
            }else if(action == "ac_balance_sep"){
                wallets = await Wallets.aggregate( [
                    { "$match": { 
                        ac_balance: { $gt: 0},
                        wallet_type : wallet_type
                    } }, 
                    {
                        $lookup: {
                            from: "pending_kyc",
                            localField: "user",
                            foreignField: "user_id",
                            as: "pending_kyc",
                        },
                    },
                    {
                        $lookup: {
                            from: "user",
                            localField: "user",
                            foreignField: "user_id",
                            as: "user",
                        },
                    },
                    {
                        $replaceRoot: { 
                            newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$pending_kyc", 0 ] }, "$$ROOT" ] } 
                        }
                     },
                    {
                        $replaceRoot: { 
                            newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$user", 0 ] }, "$$ROOT" ] } 
                        }
                     },
                    { 
                        $project: { 
                            first_name:1,last_name:1,middle_name:1 ,email: 1,type: 1, wallet_type:1,createdAt:1,user_id:1,ac_balance:1,volume:1,updatedAt:1,ac_transfer_last_update:1,ac_last_update:1
                        } 
                    }
                ] );
            }
            return res.json({
                status: 200,
                error: false,
                wallets: wallets,
                total_currency: GetWallet,
                currency: currencylist,
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again",
            error1: error.message
        })
    }
}
function getDWStatusFromSupportedCurrency(supported_currency, symbol) {
    // let status = 0;
    // console.log("supported_currency: :ankur: ", supported_currency, symbol, supported_currency[symbol.toLowerCase()])
    if (supported_currency && symbol && supported_currency[symbol.toLowerCase()]) {
        // console.log(supported_currency)
        if (supported_currency[symbol.toLowerCase()].is_withdrawal && supported_currency[symbol.toLowerCase()].is_deposite) {
            return 3;
        } else if (supported_currency[symbol.toLowerCase()].is_deposite) {
            return 1;
        } else if (supported_currency[symbol.toLowerCase()].is_withdrawal) {
            return 2;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}
async function getAllWallets(req, res) {
    const Wallets = require("../models/wallets");
    try {
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            const is_admin = await isAdmin(user_id);
            if (is_admin) {
                const args = {};
                let body = req.body;
                if (body.wallet_type) {
                    args.wallet_type = body.wallet_type ? bodywallet_type : '';
                }
                if (body.users) {
                    args.user_id = {
                        $in: users.split(',')
                    }
                }
                if (body.have_balance && body.have_balance == true) {
                    args.balance = {
                        $gt: 0
                    }
                }
                const wallets = await Wallets.find(args);
                if (wallets) {
                    return res.json({
                        status: 200,
                        error: false,
                        params: {
                            wallets: wallets
                        },
                        message: "Success"
                    })
                } else {
                    return res.json({
                        status: 200,
                        error: false,
                        params: {
                            wallets: []
                        },
                        message: "No wallets found"
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request"
                })
            }
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
            message: "Something went wrong,  please try again"
        })
    }
    // return res.json({

    // })
}
function getIconFromSupportedCurrency(supported_currency, symbol) {
    if (supported_currency && symbol) {
        return supported_currency[symbol.toLowerCase()]?supported_currency[symbol.toLowerCase()].icon ? supported_currency[symbol.toLowerCase()].icon : '': '';
    } else {
        return '';
    }
}
function getStatusFromSupportedCurrency(supported_currency, symbol) {
    if (supported_currency && symbol) {
        // console.log(supported_currency)
        return supported_currency[symbol.toLowerCase()] ? supported_currency[symbol.toLowerCase()].coin_status ? supported_currency[symbol.toLowerCase()].coin_status : '':'';
    } else {
        return '';
    }
}
function getDWStatusFromSupportedCurrency(supported_currency, symbol) {
    // let status = 0;
    // console.log("supported_currency: :ankur: ", supported_currency, symbol, supported_currency[symbol.toLowerCase()])
    if (supported_currency && symbol && supported_currency[symbol.toLowerCase()]) {
        // console.log(supported_currency)
        if (supported_currency[symbol.toLowerCase()].is_withdrawal && supported_currency[symbol.toLowerCase()].is_deposite) {
            return 3;
        } else if (supported_currency[symbol.toLowerCase()].is_deposite) {
            return 1;
        } else if (supported_currency[symbol.toLowerCase()].is_withdrawal) {
            return 2;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}
function getWithdrawLimitFromSupportedCurrency(supported_currency, symbol) {
    if (supported_currency && symbol) {
        // console.log(supported_currency)
        return supported_currency[symbol.toLowerCase()] ? supported_currency[symbol.toLowerCase()].coin_status ? supported_currency[symbol.toLowerCase()].coin_status : '':'';
    } else {
        return '';
    }
}
async function getSupportedCurrency() {
    const SupportedCurrency = require('../models/suppoted_currency');
    try {
        const supported_currency = await SupportedCurrency.find({});
        console.log("supported_currency", supported_currency);
        if (supported_currency && Array.isArray(supported_currency) && supported_currency.length > 0) {
            let obj = {};
            supported_currency.map((currency) => {
                let symbol = currency.symbol ? currency.symbol.toLowerCase() : '';
                if (symbol)
                    obj[symbol] = currency;
            });
            return obj;
        } else {
            return undefined;
        }
    } catch (error) {
        return undefined;
    }
}
async function getWithdraw(req, res) {
    const User = require('../models/user');
    const Wallets = require("../models/wallets");
    const SupportedCurrency = require('../models/suppoted_currency');
    const HotWallet = require('../models/wallet_hot');
    const WithDrawHistory = require("../models/withdraw_history");
    try {
        const { user_id, fromAddress, symbol, toAddress, volume, remark } = req.body;
        if(
            user_id && 
            validateUserId(user_id) && 
            fromAddress &&  
            toAddress && 
            volume>0 && 
            remark
        ) {
            const user_data = await User.findOne({user_id: user_id});
            /**
             * is_email_verified
             * is_mobile_verified
             */
            if (user_data) {
            const mobile_no = user_data.mobile_number;
            const email = user_data.email;
                if (user_data.is_email_verified == 0) {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "Please varifie your email first"
                    })
                } 
                if (user_data.is_mobile_verified == 0) {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "Please varifie your mobile no first"
                    })
                }
                if (user_data.is_kyc_verified == 0) {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "Please varifie your kyc no first"
                    })
                }
                if (user_data.is_email_verified == 1 && user_data.is_mobile_verified == 1 && user_data.is_kyc_verified == 1) {
                    const transection_id = Date.now()+generateTransectionid(20);
                    /**
                     * find user_balance to dedicated wallet_type
                     */
                    /**
                     * find withdrawl fee and with draw limit from supported currencty collection
                     */
                    const currency_info = await SupportedCurrency.findOne({symbol: symbol.toUpperCase()});
                    if (currency_info) {
                    var moment = require('moment');
                    var start = moment().startOf('day'); // set to 12:00 am today
                    var end = moment().endOf('day'); // set to 23:59 pm today
                    let totalWithdraw = 0;
                    const totalWithdrawData = await WithDrawHistory.find({user_id: user_id, status:1, createdAt: {$gte: start, $lt: end}})
                    totalWithdrawData.map((d)=>{
                        const temp = d.amount?parseFloat(d.amount):0;
                        totalWithdraw = totalWithdraw+temp;
                    })
                    // const inbalance = await WithDrawHistory.aggregate([
                    // { $match: { 
                    //     createdAt: {$gte: start, $lt: end}
                    // } },
                    // { $group: { _id: null, TotalSum: { $sum: "$amount" } } },
                    // ]);
                    // console.log("total", inbalance);
                    // const totalWithdraw = Array.isArray(inbalance) && inbalance.length?inbalance[0].TotalSum>0?parseFloat(inbalance[0].TotalSum):parseFloat(inbalance[0].TotalSum):0;
                        totalWithdraw = totalWithdraw+parseFloat(volume);
                        let withdrawl_fee = currency_info.withdrawal_fee?parseFloat(currency_info.withdrawal_fee):0;
                        let min_withdrawl_limit = currency_info.min_withdraw_limit?parseFloat(currency_info.min_withdraw_limit):0;
                        let max_withdrawl_limit = currency_info.max_withdraw_limit?parseFloat(currency_info.max_withdraw_limit):0;
                        let daily_withdrawl_limit = currency_info.daily_withdraw_limit?parseFloat(currency_info.daily_withdraw_limit):0;
                        if (max_withdrawl_limit >= volume && volume >= min_withdrawl_limit && totalWithdraw <=  daily_withdrawl_limit && volume>withdrawl_fee) {
                            const wallet_info = await Wallets.findOne({user: user_id, wallet_type: symbol.toUpperCase()});
                            if (wallet_info) {
                                let total_available_balance = (wallet_info.balance?parseFloat(wallet_info.balance):0) - (wallet_info.locked?parseFloat(wallet_info.locked):0);
                                if (total_available_balance > 0 && total_available_balance >= volume) {
                                    let final_withdrawl_amount = parseFloat(volume) - withdrawl_fee;
                                    /**
                                     * check for hotwallet fund
                                     */
                                    const hot_wallet = await HotWallet.findOne({
                                        wallet_type: symbol.toUpperCase()
                                    })
                                    console.log("hot_wallet", hot_wallet);
                                    if (hot_wallet && hot_wallet.total_funds > 0 && hot_wallet.total_funds > final_withdrawl_amount) {
                                        /**
                                         * update withdrawl history && send otp
                                         */
                                        const otp = generateOTP();
                                        if (otp) {
                                            /**
                                             * update user balance && create transaction history
                                             */
                                            if (setMobileOtp({user_id: user_id, otp: otp})) {
                                                await WithDrawHistory.create({
                                                    user_id: user_id,
                                                    email:email,
                                                    symbol: symbol.toUpperCase(),
                                                    status: 0,
                                                    amount: volume,
                                                    withdrawal_fee:withdrawl_fee,
                                                    from_address: fromAddress,
                                                    to_address: toAddress,
                                                    type: 'withdrawal',
                                                    remark: remark,
                                                    transection_id: transection_id,
                                                    otp_varified: false
                                                });
                                                /**
                                                 * send otp then return success responce
                                                 */
                                                 await sendMobileOtp(mobile_no, otp);
                                                 return res.json({
                                                    status: 200,
                                                    error: false,
                                                    params:{
                                                        transection_id:transection_id,
                                                    },
                                                    message: "OTP Send Successfully!"
                                                })
                                            } else {
                                                return res.json({
                                                    status: 400,
                                                    error: true,
                                                    message: "Something went wrong, please try again!"
                                                })
                                            }
                                        } else {
                                            return res.json({
                                                status: 400,
                                                error: true,
                                                message: "Something went wrong, please try again!"
                                            })
                                        }
                                    } else {
                                        return res.json({
                                            status: 400,
                                            error: true,
                                            message: "Withdrawal is temporaty unavailable, please try after some time!"
                                        })
                                    }
                                }  else {
                                    return res.json({
                                        status: 400,
                                        error: true,
                                        message: "Insufficient fund in wallet!"
                                    })
                                }
                            } else {
                                return res.json({
                                    status: 400,
                                    error: true,
                                    message: "currency Info is Not correct!!"
                                })
                            }
                        } else {
                            let msg = max_withdrawl_limit < volume ? "You are exceeding maximum withdrawal limit":
                                      volume < min_withdrawl_limit ? "Minimum "+min_withdrawl_limit+" "+symbol+" is required for withdrawal":
                                      totalWithdraw >  daily_withdrawl_limit ? "You have exceeded your maximum daily withdrawal limit":
                                      volume<withdrawl_fee? "Amount is less than withdrawal fee ("+withdrawl_fee+")":
                                      symbol+" Withdrawal is currently suspended, please try After Some Time";
                            return res.json({
                                status: 400,
                                error: true,
                                message: msg
                            })
                        }
                    } else {
                        return res.json({
                            status: 400,
                            error: true,
                            message: "This currency is not allowed to be withdrawal!"
                        })
                    }
                }
                return res.json({
                    status: 400,
                    error: true,
                    message: "Please varifie your email and mobile and kyc first"
                })
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid Request**"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request***"
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
async function successWithdraw(req, res) {
    const Web3 = require("web3");
    const TronWeb = require("tronweb");
    const web3 = new Web3("https://bsc-dataseed4.binance.org/");
    //const web3 = new Web3("https://data-seed-prebsc-1-s2.binance.org:8545/");
    const web3Eth = new Web3("https://mainnet.infura.io/v3/d5bcba9decc042879125ca752dc4637b");
    const tronWeb = new TronWeb({
        fullHost: "https://api.trongrid.io",
    });
    const HotWallet = require('../models/wallet_hot');
    const WithdrawHistory = require('../models/withdraw_history');
    const SupportedCurrency = require('../models/suppoted_currency');
    const Wallets = require("../models/wallets");
    try{
        const {transection_id} = req.body;
        if(transection_id) {
            const Withdraw_history = await WithdrawHistory.findOne({transection_id:transection_id, status:2});
            if(Withdraw_history && Withdraw_history.symbol && Withdraw_history.amount) {
                await WithdrawHistory.updateOne({transection_id:transection_id, status:2},{
                    $set: {
                        status: 5,
                    }
                })
                const wallet_type =  Withdraw_history.symbol?Withdraw_history.symbol:'';
                let amount = Withdraw_history.amount?parseFloat(Withdraw_history.amount):0;
                const currency_info = await SupportedCurrency.findOne({symbol: wallet_type.toUpperCase()});
                if (currency_info) {
                    let withdrawl_fee = currency_info.withdrawal_fee?parseFloat(currency_info.withdrawal_fee):0;
                    const decimal = currency_info.precision ? Number(`1e${currency_info.precision}`) : 0;
                    const wallet_data=await Wallets.findOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()});
                    if (wallet_data) {
                        let total_available_balance = (wallet_data.balance?parseFloat(wallet_data.balance):0) - (wallet_data.locked?parseFloat(wallet_data.locked):0);
                        console.log("total_available_balance", total_available_balance);
                        if (total_available_balance > 0 && total_available_balance >= amount) {
                            let total_final_amt = (amount-withdrawl_fee);
                            // console.log("final_amount", final_amount);
                            /**
                             * check for hotwallet fund
                             */
                            
                            const hot_wallet = await HotWallet.findOne({
                                wallet_type: wallet_type.toUpperCase()
                            })
                            if (hot_wallet && hot_wallet.total_funds > 0 && hot_wallet.total_funds > total_final_amt) {
                                console.log("updateWal",hot_wallet.total_funds);
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
                                    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
                                    payable: false,
                                    stateMutability: "view",
                                    type: "function",
                                    },
                                    {
                                    constant: false,
                                    inputs: [{name: "_to",type: "address"},{name: "_value",type: "uint256"}],
                                    name: "transfer",
                                    outputs: [{name: "success",type: "bool"}],
                                    payable: false,
                                    stateMutability: "nonpayable",
                                    type: "function"
                                    },
                                ];
                                var contract = new web3.eth.Contract(abi, currency_info.contract_address);
                                var contractEth = new web3Eth.eth.Contract(abi, currency_info.contract_address);
                                if(wallet_data.wallet_type == 'BNB') {
                                    const esgas = await web3.eth.estimateGas({
                                        to: hot_wallet.wallet_address
                                    });
                                    const gasp = await web3.eth.getGasPrice()
                                    const createTransaction = await web3.eth.accounts.signTransaction(
                                        {
                                            from: hot_wallet.wallet_address,
                                            to: Withdraw_history.to_address,
                                            value:((total_final_amt*1e18)-(esgas*gasp)),
                                            gas: esgas,
                                        },
                                        hot_wallet.private_key
                                    );
                                    // Deploy transaction
                                    const createReceipt = await web3.eth.sendSignedTransaction(
                                        createTransaction.rawTransaction
                                    );
                                    console.log("bnb transection",createReceipt);
                                    if(createReceipt) {
                                        const bnbnew_balance = parseFloat(wallet_data.balance)-amount;
                                        //  console.log("final_amount", new_balance);
                                            await Wallets.updateOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()},{
                                            $set: {
                                                balance: bnbnew_balance,
                                            },
                                            })
                                        await HotWallet.updateOne({wallet_type:wallet_type.toUpperCase()}, {
                                            $set: {
                                                total_funds: parseFloat(hot_wallet.total_funds)-total_final_amt,
                                            },
                                        })
                                        WithdrawHistory.updateOne({transection_id:transection_id},{
                                                $set: {
                                                    tx_id:createReceipt.transactionHash,
                                                    blockNumber:createReceipt.blockNumber,
                                                    status: 1,
                                                },
                                        }).then(()=>{
                                                return res.json({
                                                    status:200,
                                                    error:false,
                                                    message: wallet_data.wallet_type+" WITHDRAWAL SUCCESSFULLY!"
                                                });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message: wallet_data.wallet_type + " NOT Withdraw!!"
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
                                                    message:"createReceipt not Found **"
                                                });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:"createReceipt not Found *"
                                            });
                                        })
                                    }
                                } else if(wallet_data.type == 'bep20') {
                                    web3.eth.accounts.wallet.add(hot_wallet.private_key);
                                    let decimal = await contract.methods.decimals().call();
                                    decimal=Number(`1e${decimal}`);
                                    const amt = toFixed(total_final_amt*decimal).toString();
                                    const gas = await contract.methods.transfer(Withdraw_history.to_address,amt).estimateGas({value:0,from:hot_wallet.wallet_address});
                                    const receipt = await contract.methods.transfer(Withdraw_history.to_address,amt).send({ value: 0, from:hot_wallet.wallet_address, gas:gas});
                                    if (receipt) {
                                        const new_balance = parseFloat(wallet_data.balance)-amount;
                                        //  console.log("final_amount", new_balance);
                                            await Wallets.updateOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()},{
                                            $set: {
                                                balance: new_balance,
                                            },
                                            })
                                        await HotWallet.updateOne({wallet_type:wallet_type.toUpperCase()}, {
                                            $set: {
                                                total_funds: parseFloat(hot_wallet.total_funds)-total_final_amt,
                                            },
                                        })
                                        WithdrawHistory.updateOne({transection_id:transection_id},{
                                                $set: {
                                                    tx_id:receipt.transactionHash,
                                                    blockNumber:receipt.blockNumber,
                                                    status: 1,
                                                },
                                        }).then(()=>{
                                            return res.json({
                                                status:200,
                                                error:false,
                                                message:wallet_data.wallet_type+" WITHDRAWAL SUCCESSFULLY!"
                                            });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:wallet_data.wallet_type+" NOT Withdraw!!"
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
                                                message:"Receipt not found!*"
                                            });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:"Receipt not found!"
                                            });
                                        })
                                    }
                                } else if(wallet_data.type == 'erc20') {
                                    web3Eth.eth.accounts.wallet.add(hot_wallet.private_key);
                                    let decimal = await contractEth.methods.decimals().call();
                                    decimal=Number(`1e${decimal}`);
                                    const amt = toFixed(total_final_amt*decimal).toString();
                                    const gas = await contractEth.methods.transfer(Withdraw_history.to_address,amt).estimateGas({value:0,from:hot_wallet.wallet_address});
                                    const receipt = await contractEth.methods.transfer(Withdraw_history.to_address,amt).send({ value: 0, from:hot_wallet.wallet_address, gas:gas});
                                    if (receipt) {
                                        const new_balance = parseFloat(wallet_data.balance)-amount;
                                        //  console.log("final_amount", new_balance);
                                            await Wallets.updateOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()},{
                                            $set: {
                                                balance: new_balance,
                                            },
                                            })
                                        await HotWallet.updateOne({wallet_type:wallet_type.toUpperCase()}, {
                                            $set: {
                                                total_funds: parseFloat(hot_wallet.total_funds)-total_final_amt,
                                            },
                                        })
                                        WithdrawHistory.updateOne({transection_id:transection_id},{
                                                $set: {
                                                    tx_id:receipt.transactionHash,
                                                    blockNumber:receipt.blockNumber,
                                                    status: 1,
                                                },
                                        }).then(()=>{
                                            return res.json({
                                                status:200,
                                                error:false,
                                                message:wallet_data.wallet_type+" WITHDRAWAL SUCCESSFULLY!"
                                            });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:wallet_data.wallet_type+" NOT Withdraw!!"
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
                                                message:"Receipt not found!*"
                                            });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:"Receipt not found!"
                                            });
                                        })
                                    }
                                } else if (wallet_data.wallet_type == 'ETH') {
                                    const ethesgas = await web3Eth.eth.estimateGas({
                                        to: hot_wallet.wallet_address
                                    });
                                    const ethgasp = await web3Eth.eth.getGasPrice()
                                    const ethcreateTransaction = await web3Eth.eth.accounts.signTransaction(
                                        {
                                            from: hot_wallet.wallet_address,
                                            to: Withdraw_history.to_address,
                                            value:((total_final_amt*1e18)-(ethesgas*ethgasp)),
                                            gas: ethesgas,
                                        },
                                        hot_wallet.private_key
                                    );
                                    // Deploy transaction
                                    const ethcreateReceipt = await web3Eth.eth.sendSignedTransaction(
                                        ethcreateTransaction.rawTransaction
                                    );
                                    console.log("eth transection",ethcreateReceipt);
                                    if(ethcreateReceipt) {
                                        const ethnew_balance = parseFloat(wallet_data.balance)-amount;
                                        //  console.log("final_amount", new_balance);
                                            await Wallets.updateOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()},{
                                            $set: {
                                                balance: ethnew_balance,
                                            },
                                            })
                                        await HotWallet.updateOne({wallet_type:wallet_type.toUpperCase()}, {
                                            $set: {
                                                total_funds: parseFloat(hot_wallet.total_funds)-total_final_amt,
                                            },
                                        })
                                        WithdrawHistory.updateOne({transection_id:transection_id},{
                                                $set: {
                                                    tx_id:ethcreateReceipt.transactionHash,
                                                    blockNumber:ethcreateReceipt.blockNumber,
                                                    status: 1,
                                                },
                                        }).then(()=>{
                                            return res.json({
                                                status:200,
                                                error:false,
                                                message:wallet_data.wallet_type+" WITHDRAWAL SUCCESSFULLY!"
                                            });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:wallet_data.wallet_type+" NOT Withdraw!!"
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
                                                message:"ethcreateReceipt not Found**"
                                            });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:"ethcreateReceipt not Found***"
                                            });
                                        })
                                    }
                                } else if(wallet_data.type == 'trc20') {
                                    tronWeb.setAddress(hot_wallet.wallet_address);
                                    let usdtcontract = await tronWeb.contract().at(currency_info.contract_address);
                                        //Creates an unsigned TRX transfer transaction
                                    const usdtreceipt = await usdtcontract.transfer(
                                        Withdraw_history.toAddress,
                                        (total_final_amt * decimal)
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
                                        WithdrawHistory.updateOne({transection_id:transection_id},{
                                                $set: {
                                                    tx_id:usdtreceipt.txid,
                                                    status: 1,
                                                },
                                        }).then(()=>{
                                            return res.json({
                                                status:200,
                                                error:false,
                                                message:wallet_data.wallet_type+" WITHDRAWAL SUCCESSFULLY!"
                                            });
                                        }).catch(() =>{
                                            return res.json({
                                                status:400,
                                                error:true,
                                                message:wallet_data.wallet_type+" NOT Withdraw!!"
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
                                } else if(wallet_data.wallet_type == 'TRX') {
                                    const tradeobj = await tronWeb.transactionBuilder.sendTrx(Withdraw_history.to_address, (total_final_amt*1e6), hot_wallet.wallet_address);
                                    const signedtxn = await tronWeb.trx.sign(tradeobj, hot_wallet.private_key);
                                    const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
                                        if (trxreceipt.result) {   
                                            const new_balance = parseFloat(wallet_data.balance)-amount;
                                                console.log("final_amount", new_balance);
                                            const ht = await Wallets.updateOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()},{
                                                $set: {
                                                balance: new_balance,
                                                },
                                            })
                                            console.log("shd",ht);
                                            await HotWallet.updateOne({wallet_type:wallet_type.toUpperCase()}, {
                                                $set: {
                                                    total_funds: parseFloat(hot_wallet.total_funds)-total_final_amt,
                                                },
                                            })
                                            WithdrawHistory.updateOne({transection_id:transection_id},{
                                                $set: {
                                                    tx_id:trxreceipt.txid,
                                                    status: 1,
                                                },
                                            }).then(()=>{
                                                return res.json({
                                                    status:200,
                                                    error:false,
                                                    message:wallet_data.wallet_type+" WITHDRAWAL SUCCESSFULLY!"
                                                });
                                            });
                                        } else {
                                            WithdrawHistory.updateOne({transection_id:transection_id},{
                                                $set: {
                                                    tx_id:trxreceipt.txid,
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
                                } else if(wallet_data.type == 'trc10') {
                                const btttradeobj = await tronWeb.transactionBuilder.sendToken(Withdraw_history.to_address, (total_final_amt * 1e6), currency_info.contract_address, hot_wallet.wallet_address);
                                const bttsignedtxn = await tronWeb.trx.sign(btttradeobj, hot_wallet.private_key);
                                const bttreceipt = await tronWeb.trx.sendRawTransaction(bttsignedtxn);
                                if (bttreceipt.result) {   
                                    const new_balance = parseFloat(wallet_data.balance)-amount;
                                        console.log("final_amount", new_balance);
                                    const ht = await Wallets.updateOne({user:Withdraw_history.user_id, wallet_type:wallet_type.toUpperCase()},{
                                        $set: {
                                        balance: new_balance,
                                        },
                                    })
                                    console.log("shd",ht);
                                    await HotWallet.updateOne({wallet_type:wallet_type.toUpperCase()}, {
                                        $set: {
                                            total_funds: parseFloat(hot_wallet.total_funds)-total_final_amt,
                                        },
                                    })
                                    WithdrawHistory.updateOne({transection_id:transection_id},{
                                        $set: {
                                            tx_id:bttreceipt.txid,
                                            status: 1,
                                        },
                                    }).then(()=>{
                                        return res.json({
                                            status:200,
                                            error:false,
                                            message:wallet_data.wallet_type+" WITHDRAWAL SUCCESSFULLY!"
                                        });
                                    });
                                } else {
                                    WithdrawHistory.updateOne({transection_id:transection_id},{
                                        $set: {
                                            tx_id:bttreceipt.txid,
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
                                } else {
                                    return res.json({
                                        status:400,
                                        error:true,
                                        message:"Somthing Went Wrong!! Default"
                                    });
                                }
                            } else {
                                await WithdrawHistory.updateOne({transection_id:transection_id},{
                                    $set: {
                                        status: -2,
                                    },
                                });
                                return res.json({
                                    status:400,
                                    error:true,
                                    message:"Somthing Went Wrong!!*"
                                });
                            }
                        } else {
                            // fund is not available in fund
                            await WithdrawHistory.updateOne({transection_id:transection_id},{
                                $set: {
                                    status: -1,
                                },
                            });
                            return res.json({
                                status:400,
                                error:true,
                                message:"Somthing Went Wrong!!**",
                                err: "Insufficient fund"
                            });
                        }
                    } else {
                        // user wallet is not found of perticular currency
                        await WithdrawHistory.updateOne({transection_id:transection_id},{
                            $set: {
                                status: -1,
                            },
                        });
                        return res.json({
                            status:400,
                            error:true,
                            message:"Somthing Went Wrong!!***",
                            err: "User wallet not found"
                        });
                    }
                } else {
                    // transaction currency is not in supported currency
                    await WithdrawHistory.updateOne({transection_id:transection_id},{
                        $set: {
                            status: -1,
                        },
                    });
                    return res.json({
                        status:400,
                        error:true,
                        message:"Somthing Went Wrong!!****",
                        err: wallet_type.toUpperCase()+"Not found in supported currency"
                    });
                }
            } else {
                // transaction history not found with status 2 (otp not varified)
                // await WithdrawHistory.updateOne({transection_id:transection_id},{
                //         $set: {
                //             status: -2,
                //         },
                //     });
                return res.json({
                    status:400,
                    error:true,
                    message:"Somthing Went Wrong!!*****"
                });
            }
        } else {
            //transaction id not found in req.body
            return res.json({
                status:400,
                error:true,
                message:"Somthing Went Wrong!!******"
            });
        }
    } catch (error) {
        return res.json({
            status:400,
            error:true,
            message:"Somthing Went Wrong!!**********",
            err:error.message
        });
    }
}
async function addFundToUser(req, res) {
    try {
        const Wallets = require("../models/wallets");
        const Fundhistory = require("../models/fundtranfer_history");
        const { user_id, wallet_type, from_user,amount } = req.body;
        if (user_id && validateUserId(user_id) && wallet_type && amount) {
            /**
             * check for wallet already created or not
             */
            const user_wallet = await Wallets.findOne({ user: user_id, wallet_type:wallet_type });
            if (user_wallet && user_wallet.wallet_address) {
                let updateBal =  await Wallets.updateOne({ user: user_id, wallet_type:wallet_type  }, {
                    $set: {
                        balance: parseInt(user_wallet.balance)+parseInt(amount),
                    }
                })

                if(updateBal.matchedCount){
                    let update_history = await Fundhistory.create({ to_user:user_id, wallet_type:wallet_type, from_user:from_user,amount:amount});
                    let history = await FundTransfer.aggregate( [
                        {
                            $lookup: {
                                from: "pending_kyc",
                                localField: "to_user",
                                foreignField: "user_id",
                                as: "pending_kyc",
                            }
                        },
                    ] );
                    return res.json({
                        status: 200,
                        error: false,
                        history: history,
                        message: "Fund added successfully",
                    })
                }
                return res.json({
                    status: 200,
                    error: false,
                    query_status : updateBal.matchedCount,
                    message: "Fund not addedd",
                })
            }else{
                return res.json({
                    status: 400,
                    error: true,
                    message: "Wallet not created",
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Insufficiant data for update balance"
            })
        }
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>addFundToUser: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again!"
        })
    }
}

async function transectionHistory(req, res) {
try{
    const { user_id } = req.body;
    let deposit = await getDepositHistory(user_id);
    let withdraw = await getWithdrawHistory(user_id);
    let inr = await getInrHistory(user_id);
    let result = [...deposit, ...withdraw].sort((a, b) =>  new Date(b.createdAt) - new Date(a.createdAt));
     if(result) {
        return res.json({
            status: 200,
            error: false,
            params: {
                result:result,
            },
            message: "data fetch!!",
        }) 
    } else {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again Withdraw history Not Found!!",
        }) 
    }

} catch (error) {
    return res.json({
        status: 400,
        error: true,
        message: "Something went wrong, please try again",
        errorM:error.message
    })
}
}

async function updateColdWalletCoin(req, res) {
    const SupportedCurrency = require('../models/suppoted_currency');
    const ColdWallet = require('../models/wallet_cold');
    const Wallets = require("../models/wallets");
    const UserAdmin = require("../models/user");
  const depositeHistory = require("../models/deposite_history");
  
    const fetch = require('cross-fetch');
    // for BNB(bep20)
    const Web3 = require("web3");
    const BSCMAINNET_WSS = "https://bsc-dataseed.binance.org/";
    const BSCTESTNET_WSS = "https://data-seed-prebsc-1-s1.binance.org:8545/";
    const web3ProviderBnb = new Web3.providers.HttpProvider(BSCMAINNET_WSS);
    const web3Bnb = new Web3(web3ProviderBnb);
    // for TRX (trc20,trc10)
    const TronWeb = require("tronweb");
    const trx_mainnet = "https://api.trongrid.io";
    const trx_testnet = "https://api.shasta.trongrid.io";
    const tronWeb = new TronWeb({ fullHost: trx_mainnet, });
    // for ETH (erc20)
    const eth_mainnet = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    const eth_testnet = 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    const web3Provider = new Web3.providers.HttpProvider(eth_mainnet);
    const web3Eth = new Web3(web3Provider);

    const dex = [
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
                { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
            ],
            "name": "Transfer",
            "type": "event"
        },
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
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: false,
            inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }],
            name: "transfer",
            outputs: [{ name: "success", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function"
        },
    ];
    try {
        /**
         * ADMIN ONLY
         * 1. check coming wallet type is in supported currency or not
         * 2. check it's cold wallet is created or not
         * 3. if exist fetch cold wallet data
         * 4. fetch all user's wallet of this cold wallet type
         * 5. send each wallet's balance to the cold wallet
         * Note: at first send all the tokens first
         */
        const admin_user_id = req.body && req.body.user_id ? req.body.user_id : undefined;
        if (admin_user_id && validateUserId(admin_user_id)) {
            const is_admin = await isAdmin(admin_user_id);
            if (is_admin) {
                const currency = req.body && req.body.currency ? req.body.currency.toUpperCase() : undefined;
                if (currency) {
                    // check for currency, if it is in supported currency or not
                    const supported_currency_data = await SupportedCurrency.findOne({
                        symbol: currency
                    });
                    const AdminUser = await UserAdmin.distinct("user_id",{ user_role:2 });
                    
                    
                    if (supported_currency_data) {
                        // check for cold wallet currency
                        const cold_wallet = await ColdWallet.findOne({
                            wallet_type: currency
                        });
                        if(!supported_currency_data.capture_fund){
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Capture fund  feature is Comming soon for this Coin"
                            })
                        }
                        if (cold_wallet && (cold_wallet.wallet_address)) {
                            // get all users wallet
                            
                            let userID = await depositeHistory.distinct('user_id', { 
                                symbol: { $eq: currency},
                                status : true
                             });
                            const all_wallets = await Wallets.find({
                                wallet_type: currency,
                                user: { $in: userID  }
                            })
                            
                            
                            if (all_wallets && Array.isArray(all_wallets) && (all_wallets.length > 0)) {
                                let index = 0;
                                var interval = setInterval(async ()=>{
                                    let wallet = all_wallets[index++];
                                    if(!wallet || wallet === undefined ){
                                        clearInterval(interval);
                                        return res.json({
                                            status: 200,
                                            message: "Synchronization completed successfully"
                                        })
                                    }
                                    const toAddress = cold_wallet.wallet_address;
                                    const fromAddress = wallet.wallet_address;
                                    const fromUserId    = wallet.user;
                                    const fromPrivateKey = wallet.private_key;
                                    const fromContractAddress = wallet.contract_address; //wallet.contract_address; // BEP20 testnet contract bep20testnetContractAddress: 0x5f1cE1949EbF1dfC97E31147C1b60d874CBc2df5 ,erc20testnetContractAddress : 0x18da1C1C77392C9E41587636A886b4686a2B3e06
                                   try{
                                        if(AdminUser.includes(fromUserId)){
                                            return {
                                                address: fromAddress,
                                                balance: 0
                                            };
                                        }
                                        if (wallet && wallet.wallet_type == 'TRX') {
                                            const decimal = 1e6;
                                            const ds = await fetch(`https://api.trongrid.io/v1/accounts/${fromAddress}`);
                                            const dt = await ds.json();
                                            if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                                let trx_balance = dt['data'][0].balance;
                                                if (trx_balance > 0) {
                                                    let balance = trx_balance ? trx_balance / decimal : 0;
                                                    
                                                    const tradeobj = await tronWeb.transactionBuilder.sendTrx(
                                                        toAddress,
                                                        Number(trx_balance),
                                                        fromAddress
                                                    );
                                                    const signedtxn = await tronWeb.trx.sign(tradeobj, fromPrivateKey);
                                                    const tx = await tronWeb.trx.sendRawTransaction(signedtxn);
                                                    /** update v balance */
                                                    if (tx && tx.result == true) {
                                                        await Wallets.updateOne({ _id: wallet._id }, {
                                                            $set: {
                                                                v_balanace: 0,
                                                                ac_balance: 0,
                                                                ac_transfer_last_update: Date.now()
                                                            }
                                                        });
                                                        return {
                                                            address: fromAddress,
                                                            balance: balance
                                                        };
                                                    } else {
                                                        return {
                                                            address: fromAddress,
                                                            balance: 0
                                                        };
                                                    }
                                                } else {
                                                    // no balance in wallet
                                                    return {
                                                        address: fromAddress,
                                                        balance: 0
                                                    };
                                                }
                                            } else {
                                                // something went wrong
                                                console.log("error in finding wallet balance: ", dt, fromAddress, wallet.type);
                                                return {
                                                    address: fromAddress,
                                                    balance: 0
                                                };
                                            }
                                        } else if (wallet && (wallet.wallet_type == 'BNB')) {
                                            const bnb_balance = await web3Bnb.eth.getBalance(fromAddress);
                                            if(bnb_balance>0){
                                                const esgas = await web3Bnb.eth.estimateGas({
                                                    to: fromAddress
                                                });
                                                const gasp = await web3Bnb.eth.getGasPrice()
                                                const createTransaction = await web3Bnb.eth.accounts.signTransaction(
                                                    {
                                                        from: fromAddress,
                                                        to: toAddress,
                                                        value:(bnb_balance-(esgas*gasp)),
                                                        gas: esgas,
                                                    },
                                                    fromPrivateKey
                                                );
                                                // Deploy transaction
                                                const createReceipt = await web3Bnb.eth.sendSignedTransaction(
                                                    createTransaction.rawTransaction
                                                );
                                                // console.log("bnb transection",createReceipt);
                                                if(createReceipt) {
                                                    await Wallets.updateOne({ _id: wallet._id }, {
                                                        $set: {
                                                            v_balanace: 0,
                                                            ac_balance: 0,
                                                            ac_transfer_last_update: Date.now()
                                                        }
                                                    });
                                                } else {
                                                    return {
                                                        address: fromAddress,
                                                        balance: 0
                                                    };
                                                }
                                            } else {
                                                return {
                                                    address: fromAddress,
                                                    balance: 0
                                                };
                                            }
                                        } else if (wallet && (wallet.wallet_type == 'ETH')) {
                                            const eth_balance = await web3Eth.eth.getBalance(fromAddress);
                                            if(eth_balance>0) {
                                                const ethesgas = await web3Eth.eth.estimateGas({
                                                    to: fromAddress
                                                });
                                                const ethgasp = await web3Eth.eth.getGasPrice()
                                                if(ethesgas < eth_balance){
                                                    const ethcreateTransaction = await web3Eth.eth.accounts.signTransaction(
                                                        {
                                                            from: fromAddress,
                                                            to: toAddress,
                                                            value:(eth_balance-(ethesgas*ethgasp)),
                                                            gas: ethesgas,
                                                        },
                                                        fromPrivateKey
                                                    );
                                                    const ethcreateReceipt = await web3Eth.eth.sendSignedTransaction(
                                                        ethcreateTransaction.rawTransaction
                                                    );
                                                    if(ethcreateReceipt) {
                                                        await Wallets.updateOne({ _id: wallet._id }, {
                                                            $set: {
                                                                v_balanace: 0,
                                                                ac_balance: 0,
                                                                ac_transfer_last_update: Date.now()
                                                            }
                                                        });
                                                    } else {
                                                        return {
                                                            address: fromAddress,
                                                            balance: 0
                                                        };
                                                    }
                                                } else {
                                                    return {
                                                        address: fromAddress,
                                                        balance: 0
                                                    };
                                                }
                                                // Deploy transaction
                                                // console.log("eth transection",ethcreateReceipt);
                                            } else {
                                                return {
                                                    address: fromAddress,
                                                    balance: 0
                                                };
                                            }
                                        } else if (wallet && (wallet.type == 'erc20')) {
                                            const eth_balance = await web3Eth.eth.getBalance(fromAddress);
                                            const contract = new web3Eth.eth.Contract(dex, fromContractAddress);
                                            web3Eth.eth.accounts.wallet.add(fromPrivateKey);
                                            const bal = await contract.methods.balanceOf(fromAddress).call();
                                        
                                            if((bal>0) && (eth_balance > 0)){
                                                const gas = await contract.methods.transfer(toAddress,bal).estimateGas({value:0,from:fromAddress});
                                                if(gas < eth_balance){
                                                    const receipt = await contract.methods.transfer(toAddress,bal).send({ value: 0, from:fromAddress, gas:gas});
                                                    if(receipt) {
                                                        await Wallets.updateOne({ _id: wallet._id }, {
                                                            $set: {
                                                                v_balanace: 0,
                                                                ac_balance: 0,
                                                                ac_transfer_last_update: Date.now()
                                                            }
                                                        });
                                                    } else {
                                                        return {
                                                            address: fromAddress,
                                                            balance: 0
                                                        };
                                                    }
                                                }else {
                                                    return {
                                                        address: fromAddress,
                                                        balance: 0
                                                    };
                                                }
                                            } else {
                                                return {
                                                    address: fromAddress,
                                                    balance: 0
                                                };
                                            }
                                        } else if (wallet && (wallet.type == 'bep20')) {
                                            const bnb_balance = await web3Bnb.eth.getBalance(fromAddress);
                                            const contract = new web3Bnb.eth.Contract(dex, fromContractAddress);
                                            web3Bnb.eth.accounts.wallet.add(fromPrivateKey);
                                            const bal = await contract.methods.balanceOf(fromAddress).call();
                                            if((bal>0) && (bnb_balance > 0)){
                                                const gas = await contract.methods.transfer(toAddress,bal).estimateGas({value:0,from:fromAddress});
                                                if(gas < bnb_balance){
                                                    const receipt = await contract.methods.transfer(toAddress,bal).send({ value: 0, from:fromAddress, gas:gas});
                                                    if(receipt) {
                                                        await Wallets.updateOne({ _id: wallet._id }, {
                                                            $set: {
                                                                v_balanace: 0,
                                                                ac_balance: 0,
                                                                ac_transfer_last_update: Date.now()
                                                            }
                                                        });
                                                    }else{
                                                        return {
                                                            address: fromAddress,
                                                            balance: 0
                                                        };
                                                    }
                                                }else{
                                                    return {
                                                        address: fromAddress,
                                                        balance: 0
                                                    };
                                                }
                                            } else {
                                                return {
                                                    address: fromAddress,
                                                    balance: 0
                                                };
                                            }
                                        } else if (wallet && (wallet.type == 'trc20')) {
                                            
                                            const ds = await fetch(`https://api.trongrid.io/v1/accounts/${fromAddress}`);
                                            const dt = await ds.json();
                                            
                                            if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                                let trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
                                                let trx_balance = dt['data'][0].balance;
                                                
                                                if (trx_balance > 10) {
                                                    if (trc20.length > 0) {
                                                        // fromContractAddress = 'TX8qRpbpsKzkBp1UQHdcYjYvY1Z7HihgRC';
                                                        let contract_data = trc20.find((val, index) => val[fromContractAddress]);
                                                        const decimal = supported_currency_data.precision ? Number(`1e${supported_currency_data.precision}`) : 0;
                                                        if (contract_data && contract_data[fromContractAddress]) {
                                                            let trx_token_balance = parseInt(contract_data[fromContractAddress]);
                                                            if (trx_token_balance > 0) {
                                                                let balance = trx_token_balance ? trx_token_balance / decimal : 0;
                                                                // const toAddress = cold_fromAddress;
                                                                // console.log("TRC20 Balance of address: ", fromAddress, " Balance : ", balance, "-", trx_token_balance);
                                                                tronWeb.setAddress(fromAddress);
                                                                const contract = await tronWeb.contract().at(fromContractAddress);
                                                                const receipt = await contract.transfer(
                                                                    toAddress,
                                                                    trx_token_balance
                                                                ).send({
                                                                    feeLimit: 10000000
                                                                }, fromPrivateKey);
                                                                await Wallets.updateOne({ _id: wallet._id }, {
                                                                    $set: {
                                                                        v_balanace: 0,
                                                                        ac_balance: 0,
                                                                        ac_transfer_last_update: Date.now()
                                                                    }
                                                                });
                                                                return {
                                                                    address: fromAddress,
                                                                    balance: balance
                                                                };
                                                            } else {
                                                                // no balance in wallet
                                                                return {
                                                                    address: fromAddress,
                                                                    balance: 0
                                                                };
                                                            }
                                                        } else {
                                                            return {
                                                                address: fromAddress,
                                                                balance: 0
                                                            };
                                                        }
                                                    } else {
                                                        return {
                                                            address: fromAddress,
                                                            balance: 0
                                                        };
                                                    }
                                                } else {
                                                    // console.log("insufficient tron in wallet to transfer token: ");
                                                    return {
                                                        address: fromAddress,
                                                        balance: 0
                                                    };
                                                }
                                            } else {
                                                // something went wrong
                                                //console.log("error in finding wallet balance: ", dt, fromAddress, wallet.type);
                                                return {
                                                    address: fromAddress,
                                                    balance: 0
                                                };
                                            }
                                        } else if (wallet && (wallet.type == 'trc10')) {
                                            const decimal = 1e6;
                                            const ds = await fetch(`https://api.trongrid.io/v1/accounts/${fromAddress}`);
                                            const dt = await ds.json();
                                            if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                                let trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                                                let trx_balance = dt['data'][0].balance;
                                                if (trx_balance > 10) {
                                                    if (trc10.length > 0) {
                                                        // fromContractAddress = '1000996';
                                                        const contract_data = trc10.find((data) => data.key == fromContractAddress);
                                                        // console.log("contract_data: ", contract_data);
                                                        if (contract_data && contract_data.key) {
                                                            let trx_token_balance = contract_data.value;
                                                            if (trx_token_balance > 0) {
                                                                let balance = trx_token_balance ? trx_token_balance / decimal : 0;
                                                                // const toAddress = cold_fromAddress;
                                                                try{
                                                                    const tradeobj = await tronWeb.transactionBuilder.sendToken(
                                                                        toAddress,
                                                                        Number(trx_token_balance),
                                                                        fromContractAddress,
                                                                        fromAddress
                                                                    );
                                                                    const signedtxn = await tronWeb.trx.sign(tradeobj, fromPrivateKey);
                                                                    const tx = await tronWeb.trx.sendRawTransaction(signedtxn);
                                                                    
                                                                }catch(error){
                                                                    console.log("error in :::",error.message)
                                                                }
                                                            
                                                                return {
                                                                    address: fromAddress,
                                                                    balance: balance
                                                                };
                                                            } else {
                                                                // no balance in wallet
                                                                return {
                                                                    address: fromAddress,
                                                                    balance: 0
                                                                };
                                                            }
                                                        } else {
                                                            return {
                                                                address: fromAddress,
                                                                balance: 0
                                                            };
                                                        }
                                                    } else {
                                                        return {
                                                            address: fromAddress,
                                                            balance: 0
                                                        };
                                                    }
                                                } else {
                                                    // console.log("insufficient tron in wallet to transfer token: ");
                                                    return {
                                                        address: fromAddress,
                                                        balance: 0
                                                    };
                                                }
                                            } else {
                                                // something went wrong
                                                // console.log("error in finding wallet balance: ", dt, fromAddress, wallet.type);
                                                return {
                                                    address: fromAddress,
                                                    balance: 0
                                                };
                                            }
                                        } else {
                                            clearInterval(interval);
                                            return res.json({
                                                status: 200,
                                                mesage: "Success"
                                            })
                                        }
                                   }catch(error){
                                    console.log("error in controller.js< updateColdWalletCoin ",error.message)
                                   }
                                }, 1000);
                            } else {
                                return res.json({
                                    status: 400,
                                    error: true,
                                    message: "No wallet found of this type"
                                })
                            }
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: 'Cold wallet not found'
                            })
                        }
                    } else {
                        return res.json({
                            status: 400,
                            error: true,
                            message: "Invalid currency"
                        })
                    }
                } else {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "Please provide currency"
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: 'Invalid request'
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: error.message
        })
    }
  }
  async function getActualBal(req, res) {
    const SupportedCurrency = require('../models/suppoted_currency');
    const Wallets = require("../models/wallets");
    const depositeHistory = require("../models/deposite_history");
  
    const fetch = require('cross-fetch');
    // for BNB(bep20)
    const Web3 = require("web3");
    const BSCMAINNET_WSS = "https://bsc-dataseed.binance.org/";
    const BSCTESTNET_WSS = "https://data-seed-prebsc-1-s1.binance.org:8545/";
    const web3ProviderBnb = new Web3.providers.HttpProvider(BSCMAINNET_WSS);
    const web3Bnb = new Web3(web3ProviderBnb);
    // for TRX (trc20,trc10)
    const TronWeb = require("tronweb");
    const trx_mainnet = "https://api.trongrid.io";
    const trx_testnet = "https://api.shasta.trongrid.io";
    const tronWeb = new TronWeb({ fullHost: trx_mainnet, });
    // for ETH (erc20)
    const eth_mainnet = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    const eth_testnet = 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    const web3Provider = new Web3.providers.HttpProvider(eth_mainnet);
    const web3Eth = new Web3(web3Provider);

    const TRXWebTestLink = 'https://api.shasta.trongrid.io/v1/accounts/';
    // const TRXWebMainLink = TRXWebTestLink;
    const TRXWebMainLink = 'https://api.trongrid.io/v1/accounts/';
    
    const dex = [
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
                { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
                { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
            ],
            "name": "Transfer",
            "type": "event"
        },
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
            outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        {
            constant: false,
            inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }],
            name: "transfer",
            outputs: [{ name: "success", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function"
        },
    ];
    try {
        /**
         * ADMIN ONLY
         * 1. check coming wallet type is in supported currency or not
         * 2. check it's cold wallet is created or not
         * 3. if exist fetch cold wallet data
         * 4. fetch all user's wallet of this cold wallet type
         * 5. send each wallet's balance to the cold wallet
         * Note: at first send all the tokens first
         */
        const {user_id , action, wallet_type} = req.body;
        if (user_id && validateUserId(user_id)) {
            const is_admin = await isAdmin(user_id);
            // console.log("user_id : ",user_id,is_admin)
            if (is_admin && (action == 'refresh_all')) {
                // get all users wallet
                let userID = await depositeHistory.distinct('user_id', { 
                    symbol: { $eq: wallet_type},
                    status : true
                 });
                const all_wallets = await Wallets.find({
                    wallet_type: wallet_type,
                    user: { $in: userID  }
                })
                const supported_currency_data = await SupportedCurrency.findOne({
                    symbol: wallet_type.toUpperCase()
                });
                if(!supported_currency_data.sync_wallet){
                    return res.json({
                        status: 400,
                        error: true,
                        message: "Sync Wallet feature is Comming soon for this Coin"
                    })
                }
                // console.log("all_wallets: ",userID, all_wallets)
                if (supported_currency_data.sync_wallet && all_wallets && Array.isArray(all_wallets) && (all_wallets.length > 0)) {
                    let index = 0;
                    var interval = setInterval(async ()=>{
                        let wallet = all_wallets[index++];
                        if(!wallet || wallet === undefined ){
                            clearInterval(interval);
                            return res.json({
                                status: 200,
                                mesage: "synchronization completed successfully"
                            })
                        }
                        const fromAddress = wallet.wallet_address;
                        const fromUserId    = wallet.user;
                        let fromContractAddress = wallet.contract_address; //wallet.contract_address; // BEP20 testnet contract bep20testnetContractAddress: 0x5f1cE1949EbF1dfC97E31147C1b60d874CBc2df5 ,erc20testnetContractAddress : 0x18da1C1C77392C9E41587636A886b4686a2B3e06
                        try{
                            if (wallet && wallet.wallet_type == 'TRX') {
                                const decimal = 1e6;
                                const ds = await fetch(TRXWebMainLink+fromAddress);
                                const dt = await ds.json();
                                if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                    let trx_balance = dt['data'][0].balance;
                                    if (trx_balance > 0) {
                                        let balance = trx_balance ? trx_balance / decimal : 0;
                                        
                                        /** update ac balance */
                                        if (balance > 0) {
                                            // console.log("success: ",balance,wallet.wallet_type,fromUserId,)
                                            await Wallets.updateOne({ _id: wallet._id }, {
                                                $set: {
                                                    ac_balance: balance,
                                                    ac_last_update: Date.now()
                                                }
                                            });
                                        }
                                    } 
                                }
                            } else if (wallet && (wallet.wallet_type == 'BNB')) {
                                const bnb_balance = await web3Bnb.eth.getBalance(fromAddress);
                                if(bnb_balance>0){
                                    // console.log("success: ",bnb_balance,wallet.wallet_type,fromUserId,)
                                    await Wallets.updateOne({ _id: wallet._id }, {
                                        $set: {
                                            ac_balance: bnb_balance,
                                            ac_last_update: Date.now()
                                        }
                                    });
                                } 
                            } else if (wallet && (wallet.wallet_type == 'ETH')) {
                                
                                const eth_balance = await web3Eth.eth.getBalance(fromAddress);
                                if(eth_balance>0) {
                                    // console.log("success: ",eth_balance,wallet.wallet_type,fromUserId,)
                                    await Wallets.updateOne({ _id: wallet._id }, {
                                        $set: {
                                            ac_balance: eth_balance,
                                            ac_last_update: Date.now()
                                        }
                                    });
                                } 
                            } else if (wallet && (wallet.type == 'erc20')) {
                                const contract = new web3Eth.eth.Contract(dex, fromContractAddress);
                                const bal = await contract.methods.balanceOf(fromAddress).call();
                            
                                if(bal>0){
                                    // console.log("success: ",bal,wallet.type,fromUserId,)
                                    await Wallets.updateOne({ _id: wallet._id }, {
                                        $set: {
                                            ac_balance: bal,
                                            ac_last_update: Date.now()
                                        }
                                    });
                                }
                            } else if (wallet && (wallet.type == 'bep20')) {
                                const contract = new web3Bnb.eth.Contract(dex, fromContractAddress);
                                const bal = await contract.methods.balanceOf(fromAddress).call();
                                if(bal > 0){
                                    // console.log("success: ",bal,wallet.type,fromUserId,)
                                    await Wallets.updateOne({ _id: wallet._id }, {
                                        $set: {
                                            ac_balance: bal,
                                            ac_last_update: Date.now()
                                        }
                                    });
                                } 
                            } else if (wallet && (wallet.type == 'trc20')) {
                                // fromContractAddress = 'TX8qRpbpsKzkBp1UQHdcYjYvY1Z7HihgRC' //for test net
                                const ds = await fetch(TRXWebMainLink+fromAddress);
                                const dt = await ds.json();
                                console.log("sync: ",fromUserId,index)
                                if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                    let trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
                                    
                                    if (trc20.length > 0) {
                                        let contract_data = trc20.find((val, index) => val[fromContractAddress]);
                                        const decimal = supported_currency_data.precision ? Number(`1e${supported_currency_data.precision}`) : 1e6;
                                        // console.log("contract_data: ",contract_data,fromContractAddress)
                                        if (contract_data && contract_data[fromContractAddress]) {
                                            let trx_token_balance = parseInt(contract_data[fromContractAddress]);
                                            if (trx_token_balance > 0) {
                                                let balance = trx_token_balance ? trx_token_balance / decimal : 0;
                                                console.log("success: ",balance,wallet.type,fromUserId,)
                                                await Wallets.updateOne({ _id: wallet._id }, {
                                                    $set: {
                                                        ac_balance: balance,
                                                        ac_last_update: Date.now()
                                                    }
                                                });
                                            }
                                        }
                                    } 
                                } 
                            } else if (wallet && (wallet.type == 'trc10')) {
                                const decimal = supported_currency_data.precision ? Number(`1e${supported_currency_data.precision}`) : 1e6;
                                const ds = await fetch(TRXWebMainLink+fromAddress);
                                const dt = await ds.json();
                                // fromContractAddress = '1000996' //for testnet
                                if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                                    let trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                                    // console.log("length: ",trc10.length,wallet.type,fromUserId,)
                                    if (trc10.length > 0) {
                                        const contract_data = trc10.find((data) => data.key == fromContractAddress);
                                        if (contract_data && contract_data.key) {
                                            let trx_token_balance = contract_data.value;
                                            if (trx_token_balance > 0) {
                                                let balance = trx_token_balance ? trx_token_balance / decimal : 0;
                                                // console.log("success: ",balance,wallet.type,fromUserId,)
                                                await Wallets.updateOne({ _id: wallet._id }, {
                                                    $set: {
                                                        ac_balance: balance,
                                                        ac_last_update: Date.now()
                                                    }
                                                });
                                            } 
                                        } 
                                    } 
                                } 
                            } else {
                                clearInterval(interval);
                                return res.json({
                                    status: 200,
                                    mesage: "Success"
                                })
                            }
                        }catch(error){
                        console.log("error in controller.js< getActualBal ",error.message)
                        }
                    }, 300);
                } else {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "No wallet found of this type"
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid User"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: 'Invalid request'
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: error.message
        })
    }
  }
  async function captureAllWallet(req, res) {
    const { admin_user_id, wallet_type } = req.body;
    const coldWallet = require('../models/wallet_cold');
    const User = require('../models/user');
    // const coldWallet = require('../models/suppoted_currency');
    let validate = 0;
    let leftTime = 0;
    var leftMin = 0;
    let lockTime = 2 * 60 * 1000; // 5 min
    try {
        
        let getWellt =  await coldWallet.findOne({wallet_type})
        if (admin_user_id && validateUserId(admin_user_id) && wallet_type) {
            let userAdmin = await User.findOne({user_id : admin_user_id , user_role: 2})
            if(userAdmin && getWellt){
                if(getWellt.last_captured){
                    let prevTime = new Date(getWellt.last_captured).getTime();
                    let currentTime  = new Date().getTime();
                    leftTime = currentTime-prevTime;
                    leftMin = leftTime/(60*1000);
                    let nextCaptured = new Date(prevTime+lockTime);
                    if(currentTime < nextCaptured){
                        // validate = 1;
                        return res.json({
                            status : 400,
                            error : true, 
                            message : "You have captured on "+new Date(getWellt.last_captured).toLocaleTimeString()+" , Please capture after "+new Date(nextCaptured).toLocaleTimeString(),
                        })
                    }else{
                        validate = 1;
                        await coldWallet.updateOne({wallet_type}, {
                            $set : {
                                last_captured : new Date()
                            }
                        })
                    }
                }else{
                    validate = 1;
                    await coldWallet.updateOne({wallet_type}, {
                        $set : {
                            last_captured : new Date()
                        }
                    })
                }
            }
        }
        
        // console.log("getWellt: ", getWellt)
        if(validate == 1 && getWellt){
            var can_call_fetch = true;
            var can_call_deposit_admin_transfer = true;
            var can_call_token_capture = true;
            var can_call_main_currency_capture = true;
            // var interval = 30;
            var walletsL = {};
            getWellt =  await coldWallet.findOne({wallet_type})
            var interval = setInterval(async () => {
                try {
                    let newTime = parseFloat((new Date().getTime()-new Date(getWellt.last_captured))/(60*1000)).toFixed(2);
                    // console.log("newTime", newTime, can_call_fetch ,can_call_deposit_admin_transfer ,can_call_token_capture ,can_call_main_currency_capture)
                    if (can_call_fetch) {
                        can_call_fetch = false;
                        walletsL = await getFilteredDepositHistory(wallet_type);
                        // console.log("Fetch called", newTime)
                    }
                    if ((newTime >= 1) && can_call_deposit_admin_transfer) {
                        // console.log("deposit called")
                        can_call_deposit_admin_transfer = false;
                        if (Object.keys(walletsL.tokens).length > 0) {
                            // console.log("deposit called2 ;")
                            await sendAdmimTransfer(walletsL.tokens);
                        }
                    }
                    if (newTime >= 7 && can_call_token_capture) {
                        // console.log("token capture called")
                        can_call_token_capture = false;
                        if (Object.keys(walletsL.tokens).length > 0) {
                            await captureToken(walletsL.tokens);
                        }
                    }
                    if (newTime >= 12 && can_call_main_currency_capture) {
                        // console.log("capture called")
                        can_call_main_currency_capture = false;
                        await captureCurrency(walletsL.all);
                    }
                    if (newTime >= 13 ) {
                        // console.log("clearInterval")
                        clearInterval(interval)
                        wallet_sl = {}
                        return res.json({
                            status : 200,
                            error : false, 
                            message : "Capture Fund completed",
                        })
                    }
                } catch (error) {
                    console.log("Error: in auto capture:1 ", error.message);
                    clearInterval(interval)
                }
            }, 1000);
        }else{
            console.log("Error: in auto capture:2 ");
        }
    } catch (error) {
        console.log("Error: in auto capture:3 ", error.message);
        return res.json({
            status : 200,
            error : false, 
            message : "Something went's Wrong",
        })
    }
}
/**
 * 
 * new create wallet and fetch wallet
 */

 async function createWalletNew(req, res) {
    const supportedCurrency = require("../models/suppoted_currency");
    const Wallets = require("../models/wallets");
    try {
        const { user_id, symbol } = req.body;
        if (user_id && validateUserId(user_id)) {
            if (symbol) {
                /**
                 * check for wallet already created or not
                 */
                const user_wallet = await Wallets.findOne({ user: user_id, wallet_type: symbol});
                if (user_wallet && user_wallet.wallet_address) {
                    return res.json({
                        status: 200,
                        error: false,
                        wallet_address: user_wallet.wallet_address,
                        message: "Success!"
                    })
                }
                const currency = await supportedCurrency.findOne({symbol:symbol});
                    try {
                        if (currency) {
                            if (currency.contract_type == 'erc20' || currency.contract_type == 'bep20') {
                                const eth_addr = await Wallets.findOne({ user: user_id, wallet_type: 'ETH' });
                                if(eth_addr) {
                                    await Wallets.create({
                                        private_key: eth_addr.private_key,
                                        wallet_address: eth_addr.wallet_address,
                                        wallet_type: currency.symbol,
                                        user: user_id,
                                        type: currency.contract_type,
                                        wallet_status: 1,
                                        contract_address: currency.contract_address,
                                        date: Date.now(),
                                        uniqueness: createUniqueness(user_id, currency.symbol)
                                    })
                                    return res.json({
                                        status: 200,
                                        error: false,
                                        message: currency.symbol+" token wallet created"
                                    })
                                } else {
                                    const eth_addr = await createETHAddress();
                                    if(eth_addr) {
                                        await Wallets.create({
                                            private_key: eth_addr.privateKey,
                                            wallet_address: eth_addr.address,
                                            wallet_type: 'ETH',
                                            user: user_id,
                                            wallet_status: 1,
                                            date: Date.now(),
                                            uniqueness: createUniqueness(user_id, 'ETH')
                                        })
                                        await Wallets.create({
                                            private_key: eth_addr.privateKey,
                                            wallet_address: eth_addr.address,
                                            wallet_type: currency.symbol,
                                            user: user_id,
                                            type: currency.contract_type,
                                            wallet_status: 1,
                                            contract_address: currency.contract_address,
                                            date: Date.now(),
                                            uniqueness: createUniqueness(user_id, currency.symbol)
                                        })
                                        return res.json({
                                            status: 200,
                                            error: false,
                                            message: currency.symbol+" token wallet created"
                                        })
                                    } else {
                                        return res.json({
                                            status: 400,
                                            error: true,
                                            message: currency.symbol+" token wallet couldn't created"
                                        })
                                    }
                                }
                            } else if (currency.contract_type == 'trc10' || currency.contract_type == 'trc20') {
                                const trx_addr = await Wallets.findOne({ user: user_id, wallet_type: 'TRX' });
                                if(trx_addr) {
                                    await Wallets.create({
                                        private_key: trx_addr.private_key,
                                        wallet_address: trx_addr.wallet_address,
                                        wallet_type: currency.symbol,
                                        user: user_id,
                                        type: currency.contract_type,
                                        wallet_status: trx_addr.wallet_status ? trx_addr.wallet_status : 0,
                                        contract_address: currency.contract_address,
                                        date: Date.now(),
                                        uniqueness: createUniqueness(user_id, currency.symbol)
                                    })
                                    return res.json({
                                        status: 200,
                                        error: false,
                                        message: currency.symbol+" token wallet created"
                                    })
                                } else {
                                    const trx_addr = await createTRXAddress();
                                    if(trx_addr) {
                                        await Wallets.create({
                                            private_key: trx_addr.privateKey,
                                            wallet_address: trx_addr.address,
                                            wallet_type: 'TRX',
                                            user: user_id,
                                            wallet_status: 1,
                                            date: Date.now(),
                                            uniqueness: createUniqueness(user_id, 'TRX')
                                        })
                                        await Wallets.create({
                                            private_key: trx_addr.privateKey,
                                            wallet_address: trx_addr.address,
                                            wallet_type: currency.symbol,
                                            user: user_id,
                                            type: currency.contract_type,
                                            wallet_status: 1,
                                            contract_address: currency.contract_address,
                                            date: Date.now(),
                                            uniqueness: createUniqueness(user_id, currency.symbol)
                                        })
                                        return res.json({
                                            status: 200,
                                            error: false,
                                            message: currency.symbol+" token wallet created"
                                        })
                                    } else {
                                        return res.json({
                                            status: 400,
                                            error: true,
                                            message: currency.symbol+" token wallet couldn't created"
                                        })
                                    }
                                }
                            } else if(currency.symbol == 'TRX') {
                                const trx_addr = await createTRXAddress();
                                if(trx_addr) {
                                    await Wallets.create({
                                        private_key: trx_addr.privateKey,
                                        wallet_address: trx_addr.address,
                                        wallet_type: currency.symbol,
                                        user: user_id,
                                        wallet_status: 1,
                                        date: Date.now(),
                                        uniqueness: createUniqueness(user_id, 'TRX')
                                    })
                                    return res.json({
                                        status: 200,
                                        error: false,
                                        message: currency.symbol+" token wallet created"
                                    })
                                } else {
                                    return res.json({
                                        status: 400,
                                        error: true,
                                        message: currency.symbol+" token wallet couldn't created"
                                    })
                                }
                            } else if(currency.symbol == 'ETH') {
                                const eth_addr = await createETHAddress();
                                if(eth_addr) {
                                    await Wallets.create({
                                        private_key: eth_addr.privateKey,
                                        wallet_address: eth_addr.address,
                                        wallet_type: currency.symbol,
                                        user: user_id,
                                        wallet_status: 1,
                                        date: Date.now(),
                                        uniqueness: createUniqueness(user_id, 'ETH')
                                    })
                                    return res.json({
                                        status: 200,
                                        error: false,
                                        message: currency.symbol+" token wallet created"
                                    })
                                } else {
                                    return res.json({
                                        status: 400,
                                        error: true,
                                        message: currency.symbol+" token wallet couldn't created"
                                    })
                                }
                             } else if(currency.symbol == 'BNB') {
                                const eth_addr = await Wallets.findOne({ user: user_id, wallet_type: 'ETH' });
                                if(eth_addr) {
                                    await Wallets.create({
                                        private_key: eth_addr.private_key,
                                        wallet_address: eth_addr.wallet_address,
                                        wallet_type: currency.symbol,
                                        user: user_id,
                                        wallet_status: eth_addr.wallet_status ? eth_addr.wallet_status : 0,
                                        date: Date.now(),
                                        uniqueness: createUniqueness(user_id, currency.symbol)
                                    })
                                    return res.json({
                                        status: 200,
                                        error: false,
                                        message: currency.symbol+" token wallet created"
                                    })
                                } else {
                                    const eth_addr = await createETHAddress();
                                    if(eth_addr) {
                                        await Wallets.create({
                                            private_key: eth_addr.privateKey,
                                            wallet_address: eth_addr.address,
                                            wallet_type: 'ETH',
                                            user: user_id,
                                            wallet_status: 1,
                                            date: Date.now(),
                                            uniqueness: createUniqueness(user_id, 'ETH')
                                        })
                                        await Wallets.create({
                                            private_key: eth_addr.privateKey,
                                            wallet_address: eth_addr.address,
                                            wallet_type: currency.symbol,
                                            user: user_id,
                                            wallet_status: 1,
                                            date: Date.now(),
                                            uniqueness: createUniqueness(user_id, currency.symbol)
                                        })
                                        return res.json({
                                            status: 200,
                                            error: false,
                                            message: currency.symbol+" token wallet created"
                                        })
                                    } else {
                                        return res.json({
                                            status: 400,
                                            error: true,
                                            message: currency.symbol+" token wallet couldn't created"
                                        })
                                    }
                                }
                            }
                        } else {
                            console.log("currency: ", currency);
                            return res.json({
                                status: 400,
                                error: true,
                                message: currency.symbol+" token not Found"
                            })
                        }
                            
                    } catch (error) {
                        console.log("Error createWalletNew (function): ", error.message);
                        return res.json({
                            status: 400,
                            error: true,
                            message: "Invalid request*"
                        })
                    }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid request*"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request**"
            })
        }
    } catch (error) {
        // console.log("Error: from: src>controller>wallets.js>createWallet: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again!"
        })
    }
}

function createUniqueness(user_id, symbol) {
    let time = new Date();
    let year = time.getFullYear();
    let month = time.getMonth();
    let date = time.getDate();
    let hour = time.getHours();
    let minute = time.getMinutes();
    let second = time.getSeconds();
    let sec = Math.floor(second/10);
    return user_id + '*' + symbol + '*' + year + '-' + month + '-' + date + ':' + hour + '-' + minute + '-' + sec;
}

async function getwalletsNew(req, res) {
    const Wallets = require("../models/wallets");
    let dt = Date.now();
    try {
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            const wallets = await Wallets.find({ user: user_id });
            const user_wallet = await getSupportedCurrencyNew(wallets);
            return res.json({
                status: 200,
                error: false,
                params: {
                    wallets: user_wallet
                },
                message: "Success "+ dt+ '-' + Date.now()
            })
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid Request!"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again",
            error1: error.message
        })
    }
}

async function getSupportedCurrencyNew(wallets) {
    const SupportedCurrency = require('../models/suppoted_currency');
    try {
        const supported_currency = await SupportedCurrency.find({});
        if (supported_currency && Array.isArray(supported_currency) && supported_currency.length > 0) {
            let obj = {};
            supported_currency.map((currency) => {
                const wallet = wallets.find((item)=>item.wallet_type==currency.symbol)
                let temp = {}; 
                if(wallet) {
                    temp.wallet_address = wallet.wallet_address;
                    temp.symbol = currency.symbol;
                    temp.icon = currency.icon;
                    temp.balance = wallet.balance;
                    temp.locked = wallet.locked;
                    temp.status = getDWStatusFromSupportedCurrencyNew(currency.is_deposite, currency.is_withdrawal);
                } else {
                    temp.wallet_address = '';
                    temp.symbol = currency.symbol;
                    temp.icon = currency.icon;
                    temp.balance = 0;
                    temp.locked = 0;
                    temp.status = getDWStatusFromSupportedCurrencyNew(currency.is_deposite, 0);
                }
                if (currency.symbol)
                    obj[currency.symbol] = temp;
            });
            return obj;
        } else {
            return undefined;
        }
    } catch (error) {
        return undefined;
    }
}

function getDWStatusFromSupportedCurrencyNew(is_deposite, is_withdrawal) {
    if(is_deposite == -1 ){
        return 0;
    }else if (is_withdrawal && is_deposite) {
        return 3;
    } else if (is_deposite) {
        return 1;
    } else if (is_withdrawal) {
        return 2;
    } else {
        return 0;
    }
}
async function getDepositDetails(req, res) {
    const supportedCurrency = require("../models/suppoted_currency");
    const packages = require("../mlm_models/packages");
    try{
        const sCurrency = await supportedCurrency.find({});
        const packages_data = await packages.find({});
        return res.json({
            status:200,
            params:{
                coin:sCurrency,
                packages_data:packages_data,
            },
            error:false,
            message:'success'
           

        })

    } catch(error){
        console.log("error: ", error.message)
        return res.json({
            status:400,
            message:"somthing went Wrong!",
            error:true
        })
    }
}


module.exports = {
    createWallet,
    createAllWallet,
    getcoldWallet,
    gethotWallet,
    getallcoin,
    updatecoldwallet,
    updatehotwallet,
    getwallets,
    getSupportedCurrency,
    getAllWallets,
    getWithdraw,
    successWithdraw,
    addFundToUser,
    transectionHistory,
    updateColdWalletCoin,
    getActualBal,
    getDWStatusFromSupportedCurrency,
    captureAllWallet,
    createWalletNew,
    getwalletsNew,
    getDepositDetails
}