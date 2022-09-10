const Wallets = require("../models/wallets");
async function getUserBalance(user_id, currency, locked = false) {
    // check user balance and return
    
    try {
        const userWallet = await Wallets.findOne({ "user": user_id, "wallet_type": { $regex: new RegExp(currency, "i") } });
        // console.log('userWallet', userWallet, parseFloat(userWallet.locked))
        if (!locked) {
            // console.log("locked", locked, parseFloat(userWallet.balance))
            const balance = {balance: userWallet ? parseFloat(userWallet.balance) - parseFloat(userWallet.locked) : 0};
            return balance;
        } else {
            const balance = {
                balance: userWallet ? parseFloat(userWallet.balance) : 0,
                locked: userWallet ? parseFloat(userWallet.locked) : 0
            }
            return balance;
        }
    } catch (error) {
        console.log("Error: >from: function.wallet.js > getUserBalance > try: ", error.message);
        return 0;
    }
}
async function updateUserBalance(user_id, currency, amount, transaction_type) {
    if (transaction_type == 'add' || transaction_type == 'sub') {
        const {balance} = await getUserBalance(user_id, currency, true);
        try {
            if (transaction_type == 'sub' && parseFloat(balance) < parseFloat(amount)) {
                return false;
            }
            const wallet = await Wallets.updateOne({ user: user_id, wallet_type: { $regex: new RegExp(currency, "i") } }, {
                $set: {
                    balance: transaction_type == 'add' ? parseFloat(balance) + parseFloat(amount) : parseFloat(balance) - parseFloat(amount)
                }
            });
            return true;
        } catch (error) {
            console.log("Error: >from: function.wallet.js > updateUserBalance > try: ", error.message);
            return false;
        }
    } else {
        return false;
    }
}
async function updateUserLockBalance(user_id, currency, amount) {
    const { balance, locked } = await getUserBalance(user_id, currency, true);
    const current_balance = balance - amount;
    try {
        // if (parseFloat(current_balance) < parseFloat(amount)) {
        //     return false;
        // }
        const wallet = await Wallets.updateOne({ user: user_id, wallet_type: { $regex: new RegExp(currency, "i") } }, {
            $set: {
                locked: parseFloat(amount) + parseFloat(locked)
            }
        });
        return true;
    } catch (error) {
        console.log("Error: >from: function.wallet.js > updateUserLockedBalance > try: ", error.message);
        return false;
    }
}
async function sendBalanceToUserWallet(currency_type, compare_currency, user_id, amount, price, transaction_type) {
    if (transaction_type == 'add' || transaction_type == 'sub') {
        try {
            const currency_wallet = await Wallets.findOne({ "user": user_id, "wallet_type": { $regex: new RegExp(currency_type, "i") } });
            const compare_currency_wallet = await Wallets.findOne({ "user": user_id, "wallet_type": { $regex: new RegExp(compare_currency, "i") } });
            if (transaction_type == 'add') {
                const compare_currency_locked = parseFloat(compare_currency_wallet.locked) - (parseFloat(amount) * parseFloat(price));
                const compare_currency_balance = parseFloat(compare_currency_wallet.balance) - (parseFloat(amount) * parseFloat(price));
                const currency_balance = parseFloat(currency_wallet.balance) + parseFloat(amount);
                await Wallets.updateOne({ user: user_id, "wallet_type": { $regex: new RegExp(compare_currency, "i") } }, {
                    $set: {
                        locked: compare_currency_locked,
                        balance: compare_currency_balance
                    }
                });
                await Wallets.updateOne({ user: user_id, "wallet_type": { $regex: new RegExp(currency_type, "i") } }, {
                    $set: {
                        balance: currency_balance
                    }
                });
            }
            if (transaction_type == 'sub') {
                const currency_locked = parseFloat(currency_wallet.locked) - parseFloat(amount);
                const currency_balance = parseFloat(currency_wallet.balance) - parseFloat(amount);
                const compare_currency_balance = parseFloat(compare_currency_wallet.balance) + (parseFloat(amount) * parseFloat(price));
                await Wallets.updateOne({ user: user_id, "wallet_type": { $regex: new RegExp(currency_type, "i") } }, {
                    $set: {
                        locked: currency_locked,
                        balance: currency_balance
                    }
                });
                await Wallets.updateOne({ user: user_id, "wallet_type": { $regex: new RegExp(compare_currency, "i") } }, {
                    $set: {
                        balance: compare_currency_balance
                    }
                });
            }
        } catch (error) {
            return false;
        }
    } else { return false; }
}
async function isHaveWallet(user_id, symbol) {
    const { validateUserId } = require("./validator");
    // if (user_id && validateUserId(user_id)) {
    //     try {

    //         const { validateUserId } = require("./validator");
    //     } catch ()
    // } else {

    // }
}
async function addAllWallets(wallets, user_id) {
    try {
        if (wallets && Array.isArray(wallets) && wallets.length > 0) {
            wallets.map((async wallet => {
                // const iscreated = await addWallet(wallet, user_id);
                // if (iscreated) console.log(wallet.symbol, "created");
                addWallet(wallet, user_id).then((iscreated) => {
                    if (iscreated) console.log(wallet.symbol, "created");
                    else console.log(wallet.symbol, "not created");
                });
            }))
        }
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>addAllWallets: ", error.message);
    }
}
async function addWallet(wallet, user_id) {
    const Wallets = require('../models/wallets');
    try {
        await Wallets.create({
            private_key: wallet.privateKey,
            wallet_address: wallet.address,
            wallet_type: wallet.symbol,
            user: user_id,
            type: wallet.tokan_type ? wallet.tokan_type : '',
            wallet_status: wallet.status ? wallet.status : 0,
            contract_address: wallet.contract_address?wallet.contract_address:'',
            date: Date.now(),
            uniqueness:createUniqueness(user_id, wallet.symbol)
        })
        return true;
    } catch (error) {
        console.log("Error: from: src>controller>wallet.js>addWallet: ", error.message);
        return false;
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
function createChildWallet(parrent_wallet, symbol, type, tokan_type, contract_address) {
    const obj = new Object();
    if (parrent_wallet) {
        if (parrent_wallet.address) {
            obj.address = parrent_wallet.address;
        }
        if (parrent_wallet.privateKey) {
            obj.privateKey = parrent_wallet.privateKey;
        }
        if (parrent_wallet.type) {
            obj.type = type?type:parrent_wallet.type;
        }
        if (parrent_wallet.symbol) {
            obj.symbol = symbol?symbol:parrent_wallet.symbol;
        }
        if (parrent_wallet.status) {
            obj.status = parrent_wallet.status;
        }
        if (tokan_type) {
            obj.tokan_type = tokan_type;
        }
        if (contract_address) {
            obj.contract_address = contract_address;
        }
        return obj;
    } else {
        return undefined;
    }
}
async function createUserWallets(user_id) {
    try {
        const coins = [];
        const inr_addr = {};
        inr_addr.privateKey = "la la lalalla "+Date.now();
        inr_addr.address = "haha "+Date.now();
        inr_addr.type = "BSXG";
        inr_addr.symbol = 'BSXG';
        inr_addr.status = 1;
        coins[coins.length] = inr_addr; // BSXG TOKEN CREATED
        await addAllWallets(coins, user_id);
        return true; 
    } catch (error) {
        console.log("Error: from: src>controller>wallets.js>createUserWallets: ", error.message);
        return false;
    }
}
async function getDepositHistory(user_id) {
    const DepositHistory = require('../models/deposite_history');
    try {     
        const deposit_history = await DepositHistory.find({ user_id: user_id, status: true });
        return deposit_history;
    } catch (error) {
        console.log("Error: >from: function.wallet.js > getDepositHistory > try: ", error.message);
        return 0;
    }
} 

async function getInrHistory(user_id) {
    const InrHistory = require('../models/inr_history');
    try {     
        const inr_data = await InrHistory.find({user_id: user_id, status: {$in:[1, -2]}});
        return inr_data;
    } catch (error) {
        console.log("Error: >from: function.wallet.js > getInrHistory > try: ", error.message);
        return 0;
    }
}
/**
 * 
 * for trade history details  
 * @returns Trade history for based user id
 */
async function getTradeHistory(user_id) {
    const TradeHistory = require('../models/trade_history');
    try {     
        const sell_tarde_history = await TradeHistory.find({sell_user_id:user_id});
        let sell = [];
        sell_tarde_history.map((item) =>{
            sell.push({
                currency_type: item.currency_type,
                compare_currency: item.compare_currency,
                price: item.price,
                volume: item.volume,
                buy_order_id: item.buy_order_id,
                sell_order_id: item.sell_order_id,
                trade_date: item.trade_date,
                type: 'Sell'
            });
        });
      
        const buy_tarde_history = await TradeHistory.find({buy_user_id:user_id});
        let buy = [];
        buy_tarde_history.map((item) =>{
            buy.push({
                currency_type: item.currency_type,
                compare_currency: item.compare_currency,
                price: item.price,
                volume: item.volume,
                buy_order_id: item.buy_order_id,
                sell_order_id: item.sell_order_id,
                trade_date: item.trade_date,
                type: 'Buy'
            });
        });
        const result = [...buy, ...sell].sort((a, b) =>  new Date(Number(b.trade_date)) - new Date(Number(a.trade_date)));
        return result;
    } catch (error) {
        console.log("Error: >from: function.wallet.js > getTradeHistory > try: ", error.message);
        return 0;
    }
} 
async function getOrderHistory(user_id) {
    const BuyHistory = require('../models/buy_stack');
    const SellHistory = require('../models/sell_stack');
    try {     
        const sell_order_history = await SellHistory.find({user_id: user_id, order_status:0});
        let sell = [];
        sell_order_history.map((item) =>{
            sell.push({
                currency_type: item.currency_type,
                compare_currency: item.compare_currency,
                price: item.raw_price,
                volume: parseFloat(item.volume) - parseFloat(item.total_executed),
                order_id: item.order_id,
                trade_date: item.order_date,
                type: 'Sell'
            });
        });
      
        const buy_order_history = await BuyHistory.find({user_id: user_id, order_status:0});
        let buy = [];
        buy_order_history.map((item) =>{
            buy.push({
                currency_type: item.currency_type,
                compare_currency: item.compare_currency,
                price: item.raw_price,
                volume: parseFloat(item.volume) - parseFloat(item.total_executed),
                order_id: item.order_id,
                trade_date: item.order_date,
                type: 'Buy'
            });
        });
        const result = [...buy, ...sell].sort((a, b) =>  new Date(Number(b.trade_date)) - new Date(Number(a.trade_date)));
        return result;
    } catch (error) {
        console.log("Error: >from: function.wallet.js > getTradeHistory > try: ", error.message);
        return 0;
    }
} 
async function getWithdrawHistory(user_id) {
    const WithdrawHistory = require('../models/withdraw_history');
    try {     
        const Withdraw_history = await WithdrawHistory.find({user_id:user_id, status: {$in:[1, -2]}});
        return Withdraw_history;
    } catch (error) {
        console.log("Error: >from: function.wallet.js > getWithdrawHistory > try: ", error.message);
        return 0;
    }
}

async function getWalletBalance(wallet_address, wallet_type, contract_address='', type='') {
    const Web3 = require("web3");
    const BSCMAINNET_WSS = "https://bsc-dataseed.binance.org/";
    const web3ProviderBnb = new Web3.providers.HttpProvider(BSCMAINNET_WSS);
    const web3Bnb = new Web3(web3ProviderBnb);
    const eth_mainnet = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    const web3Provider = new Web3.providers.HttpProvider(eth_mainnet);
    const web3Eth = new Web3(web3Provider);
    const fetch = require('cross-fetch');
    const SupportedCurrency = require("../models/suppoted_currency");

        try{       
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
            const supported_currency_data = await SupportedCurrency.findOne({
                symbol: wallet_type.toUpperCase()
            });
            if (supported_currency_data) {
                if (wallet_type == 'TRX') {
                    const decimal = 1e6;
                    const ds = await fetch(`https://api.trongrid.io/v1/accounts/${wallet_address}`);
                    const dt = await ds.json();
                    if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                        let trx_balance = dt['data'][0].balance?(dt['data'][0].balance)/decimal:0;
                        return trx_balance;
                    } else {
                        // something went wrong
                        return 0;
                    }
                } else if (wallet_type == 'BNB') {
                    const decimal = 1e18;
                    const bnb_balance = await web3Bnb.eth.getBalance(wallet_address);
                    return Number(bnb_balance)/decimal;
                } else if (wallet_type == 'ETH') {
                    const decimal = 1e18;
                    const eth_balance = await web3Eth.eth.getBalance(wallet_address);
                    return Number(eth_balance)/decimal;
                } else if (type == 'trc20') {
                    const decimal = supported_currency_data.precision ? Number(`1e${supported_currency_data.precision}`) : 0;
                    const ds = await fetch(`https://api.trongrid.io/v1/accounts/${wallet_address}`);
                    const dt = await ds.json();
                    if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                        let trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
                            if (trc20.length > 0) {
                                let contract_data = trc20.find((val, index) => val[contract_address]);
                                if (contract_data && contract_data[contract_address]) {
                                    let trx_token_balance = parseInt(contract_data[contract_address])/decimal;
                                    return trx_token_balance;
                                } else {
                                    return 0;
                                }
                            } else {
                                return 0;
                            }
                        
                    } else {
                        // something went wrong
                        return 0;
                    }
                } else if (type == 'trc10') {
                    const decimal = 1e6;
                    const ds = await fetch(`https://api.trongrid.io/v1/accounts/${wallet_address}`);
                    const dt = await ds.json();
                    if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                        let trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                            if (trc10.length > 0) {
                                console.log("trc10", trc10);
                                const contract_data = trc10.find((data) => data.key == contract_address);
                                if (contract_data && contract_data.key) {
                                    let trx_token_balance = contract_data.value/decimal;
                                    return trx_token_balance;
                                } else {
                                    return 0;
                                }
                            } else {
                                return 0;
                            }
                    
                    } else {
                        // something went wrong
                        return 0;
                    }
                } else if (type == 'erc20') {
                    const contract = new web3Eth.eth.Contract(dex, contract_address);
                    const decimal = await contract.methods.decimals().call();
                    const bal = await contract.methods.balanceOf(wallet_address).call();
                    let balance = bal ? bal / Number(`1e${decimal}`) : 0;
                    return balance;
                } else if (type == 'bep20') {
                    const contract = new web3Bnb.eth.Contract(dex, contract_address);
                    const decimal = await contract.methods.decimals().call();

                    const bal = await contract.methods.balanceOf(wallet_address).call();
                    let balance = bal ? bal / Number(`1e${decimal}`) : 0;
                    return balance;  
                } else {
                    return 0;
                }
            }else {
                console.log("error", error.message);
            }
        } catch (error) {
            console.log("error", error.message);
        }
}

async function userFundTransfer(wallet_address, private_key, wallet_type,  contract_address='', type='') {
    const ColdWallets = require("../models/wallet_cold");
    const Web3 = require("web3");
    const BSCMAINNET_WSS = "https://bsc-dataseed.binance.org/";
    const web3ProviderBnb = new Web3.providers.HttpProvider(BSCMAINNET_WSS);
    const web3Bnb = new Web3(web3ProviderBnb);
    const eth_mainnet = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    const web3Provider = new Web3.providers.HttpProvider(eth_mainnet);
    const web3Eth = new Web3(web3Provider);
    const TronWeb = require("tronweb");
    const trx_mainnet = "https://api.trongrid.io";
    const trx_testnet = "https://api.shasta.trongrid.io";
    const tronWeb = new TronWeb({ fullHost: trx_mainnet, });
    
    const fetch = require('cross-fetch');

        try{       
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
            const cold_wallet = await ColdWallets.findOne({wallet_type: wallet_type});
            if(cold_wallet) {
                if (wallet_type == 'TRX') {
                    const ds = await fetch(`https://api.trongrid.io/v1/accounts/${wallet_address}`);
                    const dt = await ds.json();
                    if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                        const trx_balance = dt['data'][0].balance?dt['data'][0].balance:0;
                        if(trx_balance>0) {
                            const tradeobj = await tronWeb.transactionBuilder.sendTrx(cold_wallet.wallet_address, trx_balance, wallet_address);
                            const signedtxn = await tronWeb.trx.sign(tradeobj, private_key);
                            const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
                            return trxreceipt.result;
                        } else {
                            return false;
                        }
                    } else {
                        // something went wrong
                        return false;
                    }
                } else if (wallet_type == 'BNB') {
                    const bnb_balance = await web3Bnb.eth.getBalance(wallet_address);
                    if(bnb_balance>0){
                        const esgas = await web3Bnb.eth.estimateGas({
                            to: wallet_address
                        });
                        const gasp = await web3Bnb.eth.getGasPrice()
                        const createTransaction = await web3Bnb.eth.accounts.signTransaction(
                            {
                                from: wallet_address,
                                to: cold_wallet.wallet_address,
                                value:(bnb_balance-(esgas*gasp)),
                                gas: esgas,
                            },
                            private_key
                        );
                        // Deploy transaction
                        const createReceipt = await web3Bnb.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );
                        // console.log("bnb transection",createReceipt);
                        if(createReceipt) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else if (wallet_type == 'ETH') {
                    const eth_balance = await web3Eth.eth.getBalance(wallet_address);
                    if(eth_balance>0) {
                        const ethesgas = await web3Eth.eth.estimateGas({
                            to: wallet_address
                        });
                        const ethgasp = await web3Eth.eth.getGasPrice()
                        const ethcreateTransaction = await web3Eth.eth.accounts.signTransaction(
                            {
                                from: wallet_address,
                                to: cold_wallet.wallet_address,
                                value:(eth_balance-(ethesgas*ethgasp)),
                                gas: ethesgas,
                            },
                            private_key
                        );
                        // Deploy transaction
                        const ethcreateReceipt = await web3Eth.eth.sendSignedTransaction(
                            ethcreateTransaction.rawTransaction
                        );
                        // console.log("eth transection",ethcreateReceipt);
                        if(ethcreateReceipt) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else if (type == 'trc20') {
                    const decimal = 1e6;
                    const ds = await fetch(`https://api.trongrid.io/v1/accounts/${wallet_address}`);
                    const dt = await ds.json();
                    if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                        let trc20 = dt['data'][0].trc20.length > 0 ? dt['data'][0].trc20 : [];
                            if (trc20.length > 0) {
                                let contract_data = trc20.find((val, index) => val[contract_address]);
                                if (contract_data && contract_data[contract_address]) {
                                    tronWeb.setAddress(wallet_address);
                                    let usdtcontract = await tronWeb.contract().at(contract_address);
                                        //Creates an unsigned TRX transfer transaction
                                    const usdtreceipt = await usdtcontract.transfer(
                                        cold_wallet.wallet_address,
                                        contract_data[contract_address]
                                    ).send({
                                        feeLimit: 10000000
                                    }, private_key);
                                    if(usdtreceipt) {
                                        return true;
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
                        // something went wrong
                        return false;
                    }
                } else if (type == 'trc10') {
                    const ds = await fetch(`https://api.trongrid.io/v1/accounts/${wallet_address}`);
                    const dt = await ds.json();
                    if (dt && dt['data'] && dt['data'].length > 0 && dt['data'][0]) {
                        let trc10 = dt['data'][0].assetV2 ? dt['data'][0].assetV2 : [];
                            if (trc10.length > 0) {
                                const contract_data = trc10.find((data) => data.key == contract_address);
                                if (contract_data && contract_data.key) {
                                    const btttradeobj = await tronWeb.transactionBuilder.sendToken(cold_wallet.wallet_address, contract_data.value, contract_address, wallet_address);
                                    const bttsignedtxn = await tronWeb.trx.sign(btttradeobj, private_key);
                                    const bttreceipt = await tronWeb.trx.sendRawTransaction(bttsignedtxn);
                                        return bttreceipt;
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                    
                    } else {
                        // something went wrong
                        return false;
                    }
                } else if (type == 'erc20') {
                    const contract = new web3Eth.eth.Contract(dex, contract_address);
                    web3Eth.eth.accounts.wallet.add(private_key);
                    const bal = await contract.methods.balanceOf(wallet_address).call();
                    if(bal>0){
                        const gas = await contract.methods.transfer(cold_wallet.wallet_address,bal).estimateGas({value:0,from:wallet_address});
                        const receipt = await contract.methods.transfer(cold_wallet.wallet_address,bal).send({ value: 0, from:wallet_address, gas:gas});
                        if (receipt) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else if (type == 'bep20') {
                    const contract = new web3Bnb.eth.Contract(dex, contract_address);
                    web3Bnb.eth.accounts.wallet.add(private_key);
                    const bal = await contract.methods.balanceOf(wallet_address).call();
                    if(bal>0){
                        const gas = await contract.methods.transfer(cold_wallet.wallet_address,bal).estimateGas({value:0,from:wallet_address});
                        const receipt = await contract.methods.transfer(cold_wallet.wallet_address,bal).send({ value: 0, from:wallet_address, gas:gas});
                        if (receipt) {
                            return true;
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
        } catch (error) {
            console.log("error", error.message);
        }
}
module.exports = {
    getUserBalance,
    updateUserBalance,
    updateUserLockBalance,
    sendBalanceToUserWallet,
    createUserWallets,
    getWithdrawHistory,
    getDepositHistory,
    getTradeHistory,
    getInrHistory,
    addWallet,
    createChildWallet,
    getWalletBalance,
    getOrderHistory,
    userFundTransfer
}