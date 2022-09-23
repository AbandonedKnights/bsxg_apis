const { validateUserId } = require("../utils/validator");
const HotWallet = require('../models/wallet_hot');
const Wallets = require('../models/wallets');
const Deposithistory = require('../models/deposite_history');
const ColdWallet = require('../models/wallet_cold');
const UserWalletCapture = require('../models/user_wallet_capture');
const packages = require("../mlm_models/packages");
const investment_data = require("../mlm_models/investment");
const Users = require("../models/user");

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

/**
 * eth
 */
const eth_mainnet = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
const eth_testnet = 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
const Web3 = require("web3");
const web3Provider = new Web3.providers.HttpProvider(eth_mainnet);
const web3Eth = new Web3(web3Provider);

/**
 * trx
 * here we will use cross fetch
 */

//testnet https://api.shasta.trongrid.io/
// mainnet https://api.trongrid.io
const TronWeb = require("tronweb");
const tronWeb = new TronWeb({ fullHost: "https://api.shasta.trongrid.io", });
const fetch = require('cross-fetch');
const { updateParent, provideSpIncome, activateBooster } = require("../router/mlmapp");
const { percent } = require("../utils/Math");

/**
 * bnb
 */
const BSCTESTNET_WSS = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const BSCMAINNET_WSS = "https://bsc-dataseed.binance.org/";
const web3ProviderBnb = new Web3.providers.HttpProvider(BSCMAINNET_WSS);
const web3Bnb = new Web3(web3ProviderBnb);

async function updateUserDepositNext(wallet_list, index) {
    try {
        if (wallet_list && wallet_list[index] && wallet_list[index] != 'BSXG') {

            let wallet = wallet_list[index];
            let main_wallet = wallet_list.find((item) => item.wallet_type == 'BSXG');
            let fl;
            let fs = require('fs');
            let path = require("path");
            let dirname = path.join(__dirname, `../json/latest_coin_price.json`);
            let rFile = fs.readFileSync(dirname, 'utf8');
            if(rFile){
                fl = JSON.parse(rFile);
            }
            let user_id = wallet.user;
            const user_data = await Users.findOne({ user_id: user_id });
            if (wallet && (wallet.wallet_type == 'ETH')) {
                console.log(wallet.wallet_type)
                let wallet_price = fl.find((item) => item.symbol == 'ETH');
                let decimal = 1e18;
                const bal = await web3Eth.eth.getBalance(wallet.wallet_address);
                let balance = bal ? bal / decimal : 0;
                if (balance > 0) {
                    /**
                     * check for v balance
                     */
                    const v_balance = wallet.v_balanace ? parseFloat(wallet.v_balanace) : 0;
                    const w_balance = wallet.balance ? parseFloat(wallet.balance) : 0;
                    /**check for admin transfer */
                    const admin_transfer = wallet.admin_transfer ? parseFloat(wallet.admin_transfer) : 0;
                    const balance_without_admin_transfer = balance - admin_transfer;
                    const updated_balance = balance_without_admin_transfer - v_balance;
                    const new_v_balance = v_balance + updated_balance;
                    const new_w_balance = w_balance + updated_balance;
                    /**
                     * update user's wallet
                     */
                    await Wallets.updateOne({ _id: wallet._id }, {
                        $set: {
                            balance: new_w_balance,
                            v_balanace: new_v_balance
                        }
                    });
                    if (updated_balance > 0) {
                        await createDepositHistory(user_id, wallet.wallet_type, wallet.wallet_address, updated_balance);
                        let bal_eth = div(balance, wallet_price.current_price_usdt);
                        //investment entry
                        // sponser income and send shiba inu
                        //update team business and level
                        // 
                        let pack_data = await getPackages(bal_eth);
                            let amount = pack_data.amount;
                            let per_amount = percent(amount, 5)
                            //investment details
                            let invest_data = await investment_data.findOne({user_id:user_id,  package_id:pack_data._id})
                            let invest_type = 1;
                            if(invest_data) {
                                invest_type=2;
                            }
                            await investment_data.create({
                                user_id:user_id,
                                package_id:pack_data._id,
                                roi_max_days: pack_data.duration,
                                invest_type:invest_type
                            })
                            await updateTotalBusiness(amount);
                            await updateParent(user_id, amount); // update parent team business
                            if(invest_type == 1) {
                                await provideSpIncome(user_id, user_data.parent_ref_code, per_amount);
                            }
                            await activateBooster(user_id, user_data.parent_ref_code); //to activate booter
                            await captureCurrency(wallet)

                    }
                }
            }
            if (wallet && wallet.wallet_type == 'TRX') {
                console.log(wallet.wallet_type)
                let wallet_price = fl.find((item) => item.symbol == 'TRX');
                let decimal = 1e6;
                const ds = await fetch(`https://api.shasta.trongrid.io/v1/accounts/${wallet.wallet_address}`);//TBGXMT56vCd7H1jqYUW5RtJYbmqfJ3zM8p`);//${wallet.wallet_address}`);//);
                const dt = await ds.json();
                // console.log(dt['data'][0], "trx");
                if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                    // trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                    // trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
                    let trx_balance = dt['data'][0].balance;
                    console.log("trx_balance", trx_balance);
                    if (trx_balance > 0) {
                        /** 
                         * perform transaction of trx
                         */

                        let balance = trx_balance ? trx_balance / decimal : 0;
                        /**
                         * check for v balance
                         */
                        const v_balance = !isNaN(wallet.v_balanace) ? parseFloat(wallet.v_balanace) : 0;
                        const w_balance = wallet.balance ? parseFloat(wallet.balance) : 0;
                        // console.log("v balance: ", v_balance);
                        /**check for admin transfer */
                        const admin_transfer = wallet.admin_transfer ? parseFloat(wallet.admin_transfer) : 0;
                        const balance_without_admin_transfer = balance - admin_transfer;
                        // console.log("balance www: ", v_balance, balance, balance_without_admin_transfer, balance_without_admin_transfer - v_balance)
                        const updated_balance = balance_without_admin_transfer - v_balance;
                        // console.log("updated_balance : ", updated_balance);
                        if (updated_balance >= 5) {
                            const new_v_balance = v_balance + updated_balance;
                            // console.log(new_v_balance, wallet.v_balanace)
                            const new_w_balance = w_balance + updated_balance;
                            /**
                             * update user's wallet
                             */

                            // console.log("balance: ", balance, new_v_balance, new_w_balance, wallet);
                            const ttt = await Wallets.updateOne({ _id: wallet._id }, {
                                $set: {
                                    balance: new_w_balance,
                                    v_balanace: new_v_balance
                                }
                            });
                            if (updated_balance > 0) {
                                await createDepositHistory(user_id, wallet.wallet_type, wallet.wallet_address, updated_balance)
                                let bal_trx = div(balance, wallet_price.current_price_usdt);
                                let pack_data = await getPackages(bal_trx);
                            let amount = pack_data.amount;
                            let per_amount = percent(amount, 5)
                            //investment details
                            let invest_data = await investment_data.findOne({user_id:user_id,  package_id:pack_data._id})
                            let invest_type = 1;
                            if(invest_data) {
                                invest_type=2;
                            }
                            await investment_data.create({
                                user_id:user_id,
                                package_id:pack_data._id,
                                roi_max_days: pack_data.duration,
                                invest_type:invest_type
                            })
                            await updateTotalBusiness(amount);
                            await updateParent(user_id, amount); // update parent team business
                            if(invest_type == 1) {
                                await provideSpIncome(user_id, user_data.parent_ref_code, per_amount);
                            }
                            await activateBooster(user_id, user_data.parent_ref_code); //to activate booter
                                await captureCurrency(wallet)
                            }
                        } else {
                            // invalid deposit
                            // const new_v_balance = v_balance + updated_balance;
                            /**
                             * update user's wallet
                             */

                            // console.log("balance: ", balance, new_v_balance, new_w_balance, wallet);
                            const ttt = await Wallets.updateOne({ _id: wallet._id }, {
                                $set: {
                                    admin_transfer: updated_balance
                                }
                            });
                        }

                    }
                }
            }
            if (wallet && wallet.wallet_type == 'BNB') {
                console.log(wallet.wallet_type)
                let decimal = 1e18;
                let wallet_price = fl.find((item) => item.symbol == 'BNB');
                const bal = await web3Bnb.eth.getBalance(wallet.wallet_address);
                let balance = bal ? bal / decimal : 0;
                if (balance > 0) {
                    /**
                     * check for v balance
                     */
                    const v_balance = wallet.v_balanace ? parseFloat(wallet.v_balanace) : 0;
                    const w_balance = wallet.balance ? parseFloat(wallet.balance) : 0;
                    /**check for admin transfer */
                    const admin_transfer = wallet.admin_transfer ? parseFloat(wallet.admin_transfer) : 0;
                    const balance_without_admin_transfer = balance - admin_transfer;
                    const updated_balance = balance_without_admin_transfer - v_balance;
                    const new_v_balance = v_balance + updated_balance;
                    const new_w_balance = w_balance + updated_balance;
                    /**
                     * update user's wallet
                     */
                    await Wallets.updateOne({ _id: wallet._id }, {
                        $set: {
                            balance: new_w_balance,
                            v_balanace: new_v_balance
                        }
                    });
                    if (updated_balance > 0) {
                        await createDepositHistory(user_id, wallet.wallet_type, wallet.wallet_address, updated_balance);
                            let bal_bnb = div(balance, wallet_price.current_price_usdt);
                            let pack_data = await getPackages(bal_bnb);
                            let amount = pack_data.amount;
                            let per_amount = percent(amount, 5)
                            //investment details
                            let invest_data = await investment_data.findOne({user_id:user_id,  package_id:pack_data._id})
                            let invest_type = 1;
                            if(invest_data) {
                                invest_type=2;
                            }
                            await investment_data.create({
                                user_id:user_id,
                                package_id:pack_data._id,
                                roi_max_days: pack_data.duration,
                                invest_type:invest_type
                            })
                            await updateTotalBusiness(amount);
                            await updateParent(user_id, amount); // update parent team business
                            if(invest_type == 1) {
                                await provideSpIncome(user_id, user_data.parent_ref_code, per_amount);
                            }
                            await activateBooster(user_id, user_data.parent_ref_code); //to activate booter
                            await captureCurrency(wallet)
                    }
                }
            }
            if (wallet && wallet.wallet_type == 'USDT') {
                console.log("wallet", wallet.wallet_type);
                let decimal = 1e6;
                tronWeb.setAddress(wallet.wallet_address);
                const instance = await tronWeb.contract().at(wallet.contract_address);
                const hex_balance = await instance.balanceOf(wallet.wallet_address).call();
                const usdt_balance = Number(hex_balance._hex);
                if (usdt_balance > 0) {

                    console.log("USDT wallet: ", usdt_balance);
                    // perform transaction of trx

                    let balance = usdt_balance ? usdt_balance / decimal : 0;

                    // check for v balance

                    const v_balance = wallet.v_balanace ? parseFloat(wallet.v_balanace) : 0;
                    const w_balance = wallet.balance ? parseFloat(wallet.balance) : 0;
                    //check for admin transfer 
                    const admin_transfer = wallet.admin_transfer ? parseFloat(wallet.admin_transfer) : 0;
                    const balance_without_admin_transfer = balance - admin_transfer;
                    const updated_balance = balance_without_admin_transfer - v_balance;
                    if (updated_balance >= 0) {
                        const new_v_balance = v_balance + updated_balance;
                        const new_w_balance = w_balance + updated_balance;
                        //update wallet
                        // console.log(new_v_balance, new_w_balance)
                        await Wallets.updateOne({ _id: wallet._id }, {
                            $set: {
                                balance: new_w_balance,
                                v_balanace: new_v_balance
                            }
                        });
                        if (updated_balance > 0) {
                            await createDepositHistory(user_id, wallet.wallet_type, wallet.wallet_address, updated_balance);
                            let pack_data = await getPackages(balance);
                            let amount = pack_data.amount;
                            let per_amount = percent(amount, 5)
                            //investment details
                            let invest_data = await investment_data.findOne({user_id:user_id,  package_id:pack_data._id})
                            let invest_type = 1;
                            if(invest_data) {
                                invest_type=2;
                            }
                            await investment_data.create({
                                user_id:user_id,
                                package_id:pack_data._id,
                                roi_max_days: pack_data.duration,
                                invest_type:invest_type
                            })
                            await updateTotalBusiness(amount);
                            await updateParent(user_id, amount); // update parent team business
                            if(invest_type == 1) {
                                await provideSpIncome(user_id, user_data.parent_ref_code, per_amount);
                            }
                            await activateBooster(user_id, user_data.parent_ref_code); //to activate booter
                            await sendAdminTransfer(wallet);
                            await captureToken(wallet);
                            await captureCurrency(wallet);
                        }
                    } else {
                        await Wallets.updateOne({ _id: wallet._id }, {
                            $set: {
                                admin_transfer: updated_balance
                            }
                        });
                    }
                    // transaction code will not be there

                }
            }
            updateUserDepositNext(wallet_list, index + 1)
        }
    } catch (e) {
        updateUserDepositNext(wallet_list, index + 1)
        console.log("Error in controller.js > deposite.js > function updateUserDepositNext ", e)
    }
}
async function updateDepositWallet(wallet_list) {
    try {
        console.log("updateDepositWallet: ", 0);
        if (wallet_list) {
            await updateUserDepositNext(wallet_list, 0);
        }
    } catch (e) {
        console.log("Error in controller.js > deposite.js > function updateUserDeposit ", e.message)
    }

}
async function updateUserDeposit(req, res) {
    try {
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            /**
             * fetch all wallets
             */
            var walletList = await Wallets.find({ user: user_id });
            if (walletList) {
                await updateDepositWallet(walletList)
                return res.json({
                    status: 200,
                    error: false,
                    message: "Wallets updated"
                })
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "have not Wallet"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid Request"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again: ",
            error: error.message
        })
    }
}
async function checkWalletBalance(wallet) {
    if (wallet) {
        switch (wallet.wallet_type) {
            case 'ETH':

                break;
            case 'TRX':
                break;
            case 'BNB':
                break;
        }
    } else {
        return { balance: 0, decimal: 0 };
    }
}
async function checkETHBalance(wallet) {
    /**
     * check eth balance
     */

    if (balance) {

        return { balance: main_balance, decimal };
    } else {
        return { balance: 0, decimal };
    }
}
async function createDepositHistory(user_id, type, address, amount) {
    const Deposithistory = require('../models/deposite_history');

    try {
        // console.log(user_id, type, address, amount, (user_id && type && address && amount))
        // if (user_id && type && address && amount) {
        await Deposithistory.create({
            user_id: user_id,
            symbol: type,
            status: true,
            amount: amount,
            to_address: address,
            type: "deposit",
            uniqueness: createUniqueness(user_id, type, amount, address)
        });

        // } else {
        //     return false;
        // }
        return true;
    } catch (error) {
        console.log("createDepositHistory: ", error)
        return false;
    }
}
function createUniqueness(user_id, symbol, amount, toaddress) {
    let time = new Date();
    let year = time.getFullYear();
    let month = time.getMonth();
    let date = time.getDate();
    let hour = time.getHours();
    let minute = time.getMinutes();
    let second = time.getSeconds();
    let sec = Math.floor(second / 10);
    return user_id + '*' + symbol + '*' + amount + '*' + toaddress + '*' + year + '-' + month + '-' + date + ':' + hour + '-' + minute + '-' + sec;
}
async function canUpdate(user_id) {
    try {
        let last_deposit = await Deposithistory.findOne({ user_id: user_id }).sort({ createdAt: -1 });
        if (last_deposit) {
            let last_created = last_deposit.createdAt ? last_deposit.createdAt : undefined;
            if (last_created) {
                let d = new Date(last_created).getTime();
                if (d) {
                    if (new Date().getTime() - d > 3000) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    } catch (error) {
        console.log("error in canupdate: ", error.message)
        return false;
    }
}


async function sendAdminTransfer(d) {
    try {
        var trc20_transfer = 20;
        var trc10_transfer = 1;
        var bep20_transfer = 0.0008;
        var erc20_transfer = 0.004;

        let blockchain = d.blockchain;
        let address = d.wallet_address;
        let contract_addtess = d.contract_address;
        let contract_type = d.type;
        let symbol = d.symbol;
        // let precision = d.precision;
        let _id = d._id;
        let hot_wallet = await HotWallet.findOne({
            wallet_type: d.wallet_type
        })
        console.log("hot wallet", hot_wallet, d)
        if (hot_wallet) {
            if (contract_type == 'trc20') {
                try {

                    let txamnt = contract_type == 'trc20' ? trc20_transfer : trc10_transfer;
                    // let gslimit = contract_type == 'trc20' ? trc20_fee_limit : trc10_fee_limit;
                    const tradeobj = await tronWeb.transactionBuilder.sendTrx(address, (txamnt * 1e6), hot_wallet.wallet_address);
                    const signedtxn = await tronWeb.trx.sign(tradeobj, hot_wallet.private_key);
                    const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
                    console.log("trxreceipt", trxreceipt);
                    if (trxreceipt.result) {
                        /**
                         * ~ update admin transfer wallet
                         */
                        await Wallets.updateOne({ _id: _id }, {
                            admin_transfer: d.admin_transfer + txamnt
                        });
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
                    let amt = toFixed((bep20_transfer * 1e18) - (esgas * gasp)).toString();
                    const createTransaction = await web3BNB.eth.accounts.signTransaction(
                        {
                            from: hot_wallet.wallet_address,
                            to: address,
                            value: amt,
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
                        await Wallets.updateOne({ _id: d._id }, {
                            admin_transfer: d.admin_transfer + bep20_transfer
                        });
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
                            to: address,
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
                        await Wallets.updateOne({ _id: d._id }, {
                            admin_transfer: d.admin_transfer + erc20_transfer
                        });
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


    } catch (error) {
        console.log("Error in admin transfer) : ", error);
        return false;
    }
}

async function captureToken(d) {
    try {
        let blockchain = d.blockchain;
        let address = d.wallet_address;
        let private_key = d.private_key;
        let contract_addtess = d.contract_address;
        let contract_type = d.type;
        let symbol = d.symbol;
        let precision = d.precision;
        let _id = d._id;
        let cold_wallet = await ColdWallet.findOne({
            wallet_type: d.wallet_type
        })
        if (cold_wallet) {
            if (contract_type == 'trc20') {
                try {
                    tronWeb.setAddress(address);
                    const instance = await tronWeb.contract().at(contract_addtess);
                    const hex_balance = await instance.balanceOf(address).call();
                    const usdt_balance = Number(hex_balance._hex);
                    console.log("usdt_balance", usdt_balance);
                    if (usdt_balance > 0) {
                        //Creates an unsigned TRX transfer transaction
                        const usdtreceipt = await instance.transfer(
                            cold_wallet.wallet_address,
                            usdt_balance
                        ).send({
                            feeLimit: 15000000
                        }, private_key);
                        if (usdtreceipt) {

                            /**
                             * ~ update token wallet and create history & change current deposit status
                             */
                            await Wallets.updateOne({ _id: _id }, {
                                v_balanace: 0,
                                ac_last_date: d.ac_last_date ? d.ac_last_date + ',' + Date.now() : Date.now(),
                                ac_transfer_last_bal: d.ac_transfer_last_bal ? d.ac_transfer_last_bal + ',' + usdt_balance / (Number(`1e${precision}`)) : usdt_balance / (Number(`1e${precision}`))
                            });
                            await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
                                $set: {
                                    capture_status: true
                                }
                            })
                            /**
                             * ! create history
                             */
                            await UserWalletCapture.create({
                                user_id: d.user,
                                tx_id: usdtreceipt,
                                symbol: d.wallet_type,
                                amount: usdt_balance / (Number(`1e${precision}`)),
                                from_address: d.wallet_address,
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
                        await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
                            $set: {
                                capture_status: true
                            }
                        })
                    }
                } catch (error) {
                    console.log("Error in admin transfer (" + contract_type + ") : ", error);
                    // return false;
                }
            } else if (contract_type == 'bep20') {
                try {
                    const contract = new web3BNB.eth.Contract(dex, contract_addtess);
                    const bal = await contract.methods.balanceOf(address).call();
                    if (bal > 0) {
                        //Creates an unsigned TRX transfer transaction
                        web3BNB.eth.accounts.wallet.add(private_key);
                        const gas = await contract.methods.transfer(cold_wallet.wallet_address, bal).estimateGas({ value: 0, from: address });
                        const receipt = await contract.methods.transfer(cold_wallet.wallet_address, bal).send({ value: 0, from: address, gas: gas });
                        if (receipt) {
                            /**
                             * ~ update token wallet and create history & change current deposit status
                             */
                            await Wallets.updateOne({ _id: _id }, {
                                v_balanace: 0,
                                ac_balance: bal / (Number(`1e${precision}`)),
                                ac_last_date: d.ac_last_date ? d.ac_last_date + Date.now() : Date.now() + ',',
                                ac_transfer_last_bal: d.ac_transfer_last_bal ? d.ac_transfer_last_bal + (bal / (Number(`1e${precision}`))) : (bal / (Number(`1e${precision}`))) + ','
                            });
                            try {
                                await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
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
                                    user_id: d.user,
                                    tx_id: receipt.transactionHash,
                                    symbol: d.wallet_type,
                                    amount: bal / (Number(`1e${precision}`)),
                                    from_address: d.wallet_address,
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
                        await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
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
                    const contract = new web3Eth.eth.Contract(dex, contract_addtess);
                    const bal = await contract.methods.balanceOf(address).call();
                    if (bal > 0) {
                        //Creates an unsigned TRX transfer transaction
                        web3Eth.eth.accounts.wallet.add(private_key);
                        const gas = await contract.methods.transfer(cold_wallet.wallet_address, bal).estimateGas({ value: 0, from: address });
                        const receipt = await contract.methods.transfer(cold_wallet.wallet_address, bal).send({ value: 0, from: address, gas: gas });
                        if (receipt) {
                            /**
                             * ~ update token wallet and create history & change current deposit status
                             */
                            await Wallets.updateOne({ _id: _id }, {
                                v_balanace: 0,
                                ac_balance: bal / (Number(`1e${precision}`)),
                                ac_last_date: d.ac_last_date ? d.ac_last_date + Date.now() : Date.now() + ',',
                                ac_transfer_last_bal: d.ac_transfer_last_bal ? d.ac_transfer_last_bal + (bal / (Number(`1e${precision}`))) : (bal / (Number(`1e${precision}`))) + ','
                            });

                            try {
                                await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
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
                                    user_id: d.user,
                                    tx_id: receipt,
                                    symbol: d.wallet_type,
                                    amount: bal / (Number(`1e${precision}`)),
                                    from_address: d.wallet_address,
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
                        await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
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
        return true;

    } catch (error) {
        console.log("Error in capture next token: ", index, error.message);
        return false;
    }
}

async function captureCurrency(d) {
    try {
        let address = d.wallet_address;
        let private_key = d.private_key;
        let symbol = d.wallet_type;
        let _id = d._id;
        let cold_wallet = await ColdWallet.findOne({
            wallet_type: symbol.toUpperCase()
        })
        if (cold_wallet) {
            if (symbol == 'TRX') {
                try {
                    const ds = await fetch(`https://api.shasta.trongrid.io/v1/accounts/${address}`);//TBGXMT56vCd7H1jqYUW5RtJYbmqfJ3zM8p`);//${wallet.wallet_address}`);//);
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
                            const tradeobj = await tronWeb.transactionBuilder.sendTrx(cold_wallet.wallet_address, toFixed(trx_balance - (0.3 * 1e6)).toString(), address);
                            const signedtxn = await tronWeb.trx.sign(tradeobj, private_key);
                            const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
                            console.log('TRX trxreceipt: ', trxreceipt);
                            if (trxreceipt.result) {
                                /**
                                 * ~ update admin transfer wallet
                                 */
                                await Wallets.updateOne({ _id: _id }, {
                                    admin_transfer: 0.3,
                                    v_balanace: 0,
                                    ac_last_date: d.ac_last_date ? d.ac_last_date + Date.now() : Date.now() + ",",
                                    ac_transfer_last_bal: d.ac_transfer_last_bal ? d.ac_transfer_last_bal + ((trx_balance / 1e6) - 0.3) : ((trx_balance / 1e18) - 0.3) + ","
                                });
                                try {
                                    await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
                                        $set: {
                                            capture_status: true
                                        }
                                    })
                                } catch (error) {
                                    console.log(" Error in update deposit history!: ", error);
                                }
                                try {
                                    await UserWalletCapture.create({
                                        user_id: d.user,
                                        tx_id: trxreceipt.txid,
                                        symbol: d.wallet_type,
                                        amount: (trx_balance / 1e6) - 0.3,
                                        from_address: d.wallet_address,
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
                            await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
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
                    const bal = await web3Eth.eth.getBalance(address);
                    if (bal > 0) {
                        const esgas = await web3Eth.eth.estimateGas({
                            to: address
                        });
                        const gasp = await web3Eth.eth.getGasPrice()
                        const createTransaction = await web3Eth.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: cold_wallet.wallet_address,
                                value: (bal - (esgas * gasp)),
                                gas: esgas,
                            },
                            private_key
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
                            await Wallets.updateOne({ _id: _id }, {
                                admin_transfer: 0,
                                v_balanace: 0,
                                ac_last_date: d.ac_last_date ? d.ac_last_date + Date.now() : Date.now() + ',',
                                ac_transfer_last_bal: d.ac_transfer_last_bal ? d.ac_transfer_last_bal + (bal / 1e18) : (bal / 1e18) + ','
                            });

                            try {
                                await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
                                    $set: {
                                        capture_status: true
                                    }
                                })
                            } catch (error) {
                                console.log(" Error in update deposit history!: ", error);
                            }
                            try {
                                await UserWalletCapture.create({
                                    user_id: d.user,
                                    tx_id: createReceipt,
                                    symbol: d.wallet_type,
                                    amount: bal / 1e18,
                                    from_address: d.wallet_address,
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
                        await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
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
                    const bal = await web3BNB.eth.getBalance(address);
                    if (bal > 0) {
                        const esgas = await web3BNB.eth.estimateGas({
                            to: address
                        });
                        const gasp = await web3BNB.eth.getGasPrice()
                        const createTransaction = await web3BNB.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: cold_wallet.wallet_address,
                                value: (bal - (esgas * gasp)),
                                gas: esgas,
                            },
                            private_key
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
                            await Wallets.updateOne({ _id: _id }, {
                                admin_transfer: 0,
                                v_balanace: 0,
                                ac_last_date: d.ac_last_date ? d.ac_last_date + Date.now() : Date.now() + ',',
                                ac_transfer_last_bal: d.ac_transfer_last_bal ? d.ac_transfer_last_bal + (bal / 1e18) : (bal / 1e18) + ','
                            });
                            try {
                                await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
                                    $set: {
                                        capture_status: true
                                    }
                                })
                            } catch (error) {
                                console.log(" Error in update deposit history!: ", error);
                            }
                            try {
                                await UserWalletCapture.create({
                                    user_id: d.user,
                                    tx_id: createReceipt.transactionHash,
                                    symbol: d.wallet_type,
                                    amount: bal / 1e18,
                                    from_address: d.wallet_address,
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
                        await Deposithistory.updateMany({ symbol: d.wallet_type, to_address: d.wallet_address }, {
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

        return true;

    } catch (error) {
        console.log("Error in capture cutency: ", index, error.message);
    }
}
function toFixed(x) {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x;

}

async function getPackages(amount) {
    const packages_data = await packages.find({});
    let pack_data;
    if(amount>49 && amount<100) {
        pack_data = packages_data.find((item)=>item.amount == 50);
    }
    if(amount>99 && amount<200) {
        pack_data = packages_data.find((item)=>item.amount == 100);
    }
    if(amount>199 && amount<500) {
        pack_data = packages_data.find((item)=>item.amount == 200);
    }
    if(amount>499 && amount<1000) {
        pack_data = packages_data.find((item)=>item.amount == 500);
    }
    if(amount>999 && amount<1500) {
        pack_data = packages_data.find((item)=>item.amount == 1000);
    }
    if(amount>1499 && amount<2000) {
        pack_data = packages_data.find((item)=>item.amount == 1500);
    }
    if(amount>1999 && amount<3000) {
        pack_data = packages_data.find((item)=>item.amount == 2000);
    }
    if(amount>2999 && amount<5000) {
        pack_data = packages_data.find((item)=>item.amount == 3000);
    }
    if(amount>4999 && amount<10000) {
        pack_data = packages_data.find((item)=>item.amount == 5000);
    }
    if(amount>9999 && amount<15000) {
        pack_data = packages_data.find((item)=>item.amount == 10000);
    }
    if(amount>14999) {
        pack_data = packages_data.find((item)=>item.amount == 15000);
    }
    return pack_data;
}
module.exports = {
    updateUserDeposit
}