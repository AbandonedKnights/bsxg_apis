const { validateUserId } = require("../utils/validator");
const Wallets = require('../models/wallets');
const suppotedCurrency = require('../models/suppoted_currency');
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
const TronWeb = require("tronweb");
const tronWeb = new TronWeb({ fullHost: "https://api.trongrid.io", });
const fetch = require('cross-fetch');

/**
 * bnb
 */
const BSCTESTNET_WSS = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const BSCMAINNET_WSS = "https://bsc-dataseed.binance.org/";
const web3ProviderBnb = new Web3.providers.HttpProvider(BSCMAINNET_WSS);
const web3Bnb = new Web3(web3ProviderBnb);

async function updateUserDepositNext(wallet_list,index) {
    try {
        if (wallet_list && wallet_list[index]) {
            let wallet = wallet_list[index];
            let main_wallet = wallet_list.find((item)=>item.wallet_type=='BSXG');
            let fl;
            let fs = require('fs');
            let rFile = fs.readFileSync('./src/json/latest_coin_price.json', 'utf8');
            if(rFile){
                fl =  JSON.parse(rFile);
            }
            let user_id = wallet.user;
            if (wallet && (wallet.wallet_type == 'ETH')) {
                console.log(wallet.wallet_type)
                let wallet_price = fl.find((item)=>item.symbol == 'ETH');
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
                    }
                }
            }
            if (wallet && wallet.wallet_type == 'TRX') {
                console.log(wallet.wallet_type)
                let wallet_price = fl.find((item)=>item.symbol == 'TRX');
                let decimal = 1e6;
                const ds = await fetch(`https://api.trongrid.io/v1/accounts/${wallet.wallet_address}`);//TBGXMT56vCd7H1jqYUW5RtJYbmqfJ3zM8p`);//${wallet.wallet_address}`);//);
                const dt = await ds.json();
                // console.log(dt['data'][0], "trx");
                if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                    // trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                    // trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
                    let trx_balance = dt['data'][0].balance;
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
                let wallet_price = fl.find((item)=>item.symbol == 'BNB');
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
                            balance:  new_w_balance,
                            v_balanace:  new_v_balance
                        }
                    });
                    if (updated_balance > 0) {
                        await createDepositHistory(user_id, wallet.wallet_type, wallet.wallet_address, updated_balance);
                    }
                }
            }
            if (wallet && wallet.wallet_type == 'USDT') {
                let decimal = 1e6; 
                tronWeb.setAddress(wallet.wallet_address);
                const instance = await tronWeb.contract().at(wallet.contract_address);
                const hex_balance = await instance.balanceOf(wallet.wallet_address).call();
                const usdt_balance = Number(hex_balance._hex);
                if (usdt_balance > 0) {

                    // console.log("USDT wallet: ", usdt_balance);
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
            updateUserDepositNext(wallet_list,index+1)
        }
    } catch(e){
        updateUserDepositNext(wallet_list,index+1)
        console.log("Error in controller.js > deposite.js > function updateUserDepositNext ", e)
    }
}
async function updateDepositWallet(wallet_list) {
    try{
        console.log("updateDepositWallet: ", 0);
        if (wallet_list) {
            await updateUserDepositNext(wallet_list, 0);
        }
    }catch(e){
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
            var walletList = await Wallets.find({ user: user_id});         
            if(walletList) {
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
    const DepositHistory = require('../models/deposite_history');
    try {
        // console.log(user_id, type, address, amount, (user_id && type && address && amount))
        // if (user_id && type && address && amount) {
            await DepositHistory.create({
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
    let sec = Math.floor(second/10);
    return user_id + '*' + symbol + '*' + amount + '*' + toaddress + '*' + year + '-' + month + '-' + date + ':' + hour + '-' + minute + '-' + sec;
}
async function canUpdate(user_id) {
    const DepositHistory = require('../models/deposite_history');
    try {
        let last_deposit = await DepositHistory.findOne({ user_id: user_id }).sort({ createdAt: -1 });
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
module.exports = {
    updateUserDeposit
}