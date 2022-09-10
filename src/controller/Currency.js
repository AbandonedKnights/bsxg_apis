
const Currency = require('../models/suppoted_currency')
const {CrptoSettingAPI} = require('../utils/functions.suppoted_currency');
const { createCustomTokenWallet } = require('../utils/functions.wallets');
const { validateUserId } = require('../utils/validator');

exports.suppoted_currency= async(req, res) => {
    const body = req.query;
    let symbols = body?body.symbols?body.symbols.split(','):[]:[];
    // console.log("symbols", symbols);
    try {
        // let currencyList = [];
        // let currencysymbol = symbols.map((v) => (v, v))
        //    console.log(currencysymbol)
        // currencyList = await Currency.find({'symbols': symbols}, 'symbols');
        if (symbols.length > 0) {
            currencyList = await Currency.find({ symbol: { $all: new RegExp(symbols.toString().replace(/,/g, '|'), 'gi')}});
        } else {
            currencyList = await Currency.find()
        }
        res.status(200).json({ currencyList });
      } catch (error) {
        retres.status(400).json({ message: `${error}` });
      }
}
exports.addToken= async(req, res) => {
  try {

    const Token = require("../models/suppoted_currency");
    let { blockchain,coin,contract_address,precision,supply,symbol,name,icon,contract_type,token_type,inr_price } = req.body;
    symbol = symbol.toUpperCase();
    if(blockchain && symbol && contract_address && precision && supply && name){
      wallet = await Token.create({ blockchain,symbol,contract_address,precision,supply,name,icon,contract_type,token_type,inr_price});
      createCustomTokenWallet(name, symbol, contract_type, contract_address);
      return res.json({
        query_status  : wallet ? 1 : 0, 
        status: 200
      })
    }else{
      return res.json({
        message  : "insufficient data", 
        query_status  : 0, 
        error: true,
        status: 400
      })
    }
  } catch (error) {
      console.log("Error: from: src>controller>currency.js>addToken: ", error.message);
      return res.json({
          status: 400,
          error: true,
          input: req.body,
          message: "Something went wrong in addToken, please try again!"
      })
  }
}
exports.updateCrptoSetting= async(req, res) => {
  try {

    const Token = require("../models/suppoted_currency");
    let settings = '';
    const { token_symbol } = req.body;
    exist_wallet = await Token.findOne({ symbol: token_symbol.toUpperCase()});
    if (exist_wallet) {
      settings = await CrptoSettingAPI(req.body);
    }else{
      return res.json({
          status: 400,
          error: false,
          query_status: 0,
          body: req.body,
          query: req.query,
          message: "Wallet Not found"
      })
    }
    let table = await Token.find().sort({ is_paired : -1 });
    if(settings.matchedCount){
      return res.json({
          status: 200,
          error: false,
          query_status: settings.matchedCount,
          message: "Updated Successfully",
          table: table,
      })
    }else{
      return res.json(settings)
    }
  } catch (error) {
      console.log("Error: from: src>controller>currency.js>updateCrptoSetting: ", error.message);
      return res.json({
          status: 400,
          error: true,
          message: "Something went wrong in updateCrptoSetting, please try again!"
      })
  }
}
exports.gettoken= async(req, res) => {
  try {
    const Token = require("../models/suppoted_currency");
    const { wallet_type, admin_user_id, token_type } = req.body;
    if(admin_user_id && validateUserId(admin_user_id)){
      if (wallet_type ) {
          wallet = await Token.findOne({ 
            symbol: wallet_type.toUpperCase()
          });
      }else if (token_type ) {
          wallet = await Token.find({ 
            token_type: token_type
          });
      }else{
          wallet = await Token.find().sort( { is_paired : -1 });
      }
      return res.json(wallet)
    }else{
      return res.json({
        status: 400,
        error: true,
        message: "Invalid Request"
    })
    }
  } catch (error) {
      console.log("Error: from: src>controller>currency.js>gettoken: ", error.message);
      return res.json({
          status: 400,
          error: true,
          message: "Something went wrong in gettoken, please try again!"
      })
  }
}
exports.updateToken= async(req, res) => {
  try {
    const Token = require("../models/suppoted_currency");
    let { _id,blockchain , admin_user_id, contract_address,precision,supply,symbol,name,icon,contract_type,token_type,inr_price } = req.body;
    
    if(_id){
      getCurrency = await Token.findOne({ 
        _id: _id
      });
      if(getCurrency){
        symbol = symbol.toUpperCase();
        contract_type = contract_type ? contract_type : getCurrency.contract_type;
        updateCurrency = await Token.updateOne({ _id: _id }, {
          $set : {
            blockchain,
            symbol,
            contract_address,
            precision,
            supply,
            name,
            icon,
            contract_type,
            token_type,
            inr_price
          }
        });
        if((getCurrency.symbol != symbol) || (getCurrency.contract_type != contract_type) || (getCurrency.contract_address != contract_address)){
          ChangeInUserWallet(getCurrency.symbol, symbol, contract_type, contract_address, admin_user_id);
        }
        return res.json({
          message  : "Success Updated", 
          query_status  : updateCurrency.matchedCount, 
          error: false,
          status: 200
        })
      }
      return res.json({
        message  : "Token not Found", 
        query_status  : 0, 
        error: true,
        status: 400
      })
    }else{
      return res.json({
        message  : "insufficient data", 
        query_status  : 0, 
        error: true,
        status: 400
      })
    }
  } catch (error) {
      console.log("Error: from: src>controller>currency.js>updateToken: ", error.message);
      return res.json({
          status: 400,
          error: true,
          input: req.body,
          message: "Something went wrong in addToken, please try again!"
      })
  }
}
async function ChangeInUserWallet(from_wallet_type,to_wallet_type,to_contract_type,to_contract_address, admin_user_id){
  // fetch all main currency in wallet
  // write code for trc20 and trx10 in in trx 
  // fetch fetch all toekn currency 
  // change wallet adddress and contract_addres and wallet_type and type amd private_key
  const Wallets = require('../models/wallets');
  const deletedData = require("../models/deleted_data");
  const getMainCurrency = await Wallets.find({ type : {$eq : ''}})
  let parentWallet = ((to_contract_type == 'trc20') || (to_contract_type == 'trc10')) ? "TRX"  : ((to_contract_type == 'erc20') || (to_contract_type == 'erc10'))  ?  'ETH' : (to_contract_type == 'bep20') ? 'BNB' : ''; 
  try {
    if(from_wallet_type && to_wallet_type && getMainCurrency){
      i = 0
      Wallets.find({ wallet_type: from_wallet_type}).then(async (all_wallets) => {
        all_wallets.map(async (wallet) => {
            let toWallet = getMainCurrency.find((w) => (w.wallet_type == parentWallet) && (w.user == wallet.user));
            i++
            if (toWallet && toWallet.wallet_address && toWallet.private_key) {
              Wallets.updateOne({ _id: wallet._id }, {
                  $set: {
                      wallet_address  : toWallet.wallet_address,
                      contract_address: to_contract_address,
                      private_key     : toWallet.private_key,
                      type            : to_contract_type,
                      wallet_type     : to_wallet_type
                  }
              }).then((res) => {
                if(res){
                  deletedData.create({ 
                      user_id  : wallet.user,
                      collection_name : "wallets",
                      field_1 : from_wallet_type,
                      field_2 : from_wallet_type +" to "+to_wallet_type,
                      field_3 : wallet.type + " to "+to_contract_type,
                      action_by: admin_user_id , 
                      action_message : "update wallets",
                      data : wallet
                  });
                }
              });
            }
          })
      }).catch((error) => {
        console.log("Error: from: src>controller>currency.js>ChangeInUserWallet: ", error.message);
      })
    }
  } catch (error) {
    console.log("Error: from: src>controller>currency.js>ChangeInUserWallet: ", error.message);
  }
}
exports.pairedCurrency= async(req, res) => {
  try {
    const Token = require("../models/paired_currency");
    const { status } = req.query;
    let Paired = await Token.find({status:status});
    return res.json(Paired)
  } catch (error) {
      console.log("Error: from: src>controller>currency.js>gettoken: ", error.message);
      return res.json({
          status: 400,
          error: true,
          message: "Something went wrong in gettoken, please try again!"
      })
  }
}
exports.getpairedCurrency= async(req, res) => {
  try {
    const PairedCurrency = require("../models/paired_currency");
    const user_id = req.body?req.body:undefined;
    if (user_id || true) {
      let paired = '';
      paired = await PairedCurrency.find({status:true});
      return res.json(paired)
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Something went wrong in getpairedCurrency, please try again!"
    })
    }
  } catch (error) {
      console.log("Error: from: src>controller>currency.js>getpairedCurrency: ", error.message);
      return res.json({
          status: 400,
          error: true,
          message: "Something went wrong in getpairedCurrency, please try again!"
      })
  }
}

exports.addCurrency = (req, res) => {
    try{
          Currency.findOne({ symbol: req.body.symbol })
          .exec((error, currency) => {
                if(currency) return res.status(200).json({ message: "Currency Already avilable" });
                const { symbol,
                        name,
                        icon,
                        dw,
                        is_paired_inr,
                        pairing_currency,
                        is_paired_usdt,
                        is_paired_btc,
                        is_paired_vrx,
                        inr_price,
                        usdt_price,
                        btc_price, 
                        vrx_price, 
                        is_paired,
                        is_buy, 
                        is_sell,
                        coin_status,  
                        contract_address,
                        contract_type,
                        trade_fee,
                        withdrawal_fee,
                        withdrawal_limit,
                        deposit_fee } = req.body


                        const _currency = new Currency({
                          symbol,
                          name,
                          icon,
                          dw,
                          is_paired_inr,
                          pairing_currency,
                          is_paired_usdt,
                          is_paired_btc,
                          is_paired_vrx,
                          inr_price,
                          usdt_price,
                          btc_price, 
                          vrx_price, 
                          is_paired,
                          is_buy, 
                          is_sell,
                          coin_status,  
                          contract_address,
                          contract_type,
                          trade_fee,
                          withdrawal_fee,
                          withdrawal_limit,
                          deposit_fee
                        })
                        _currency.save((error, currency) => {
                          console.log(_currency);
                          if (error) {
                              console.log(error)
                              return res.status(400).json({
                              message: "Somthing went wrong",
                              });
                          }
                          if (currency) {
                            return res.status(201).json({
                            message: "New currency Add",
                            })
                          }
                    })  
                    
              })
      } catch {
          return res.status(400).json({ error: error})
  }

}
exports.captureFundHistory= async(req, res) => {
  try {
    const walletCaptureSchema = require("../models/user_wallet_capture");
    const User = require("../models/user");
    const {admin_user_id,user_id} = req.body;
    if (admin_user_id && validateUserId(admin_user_id)) {
      let userAdmin = await User.findOne({user_id : admin_user_id , user_role: 2})
      if(userAdmin){
        let userCaptured = await walletCaptureSchema.aggregate([
            {
              $lookup: {
                from: "pending_kyc",
                localField: "user_id",
                foreignField: "user_id",
                as: "pending_kyc",
            } 
          },{ $unwind : "$pending_kyc" }
        ]);
        return res.json({
            status: 200,
            error: false,
            result : userCaptured,
            message: "Success"
        })
      }
      return res.json({
          status: 400,
          error: true,
          message: "Invalid Admin"
      })
    } else {
        return res.json({
          status: 400,
          error: true,
          message: "Invalid User"
      })
    }
  } catch (error) {
      console.log("Error: from: src>controller>currency.js>captureFundHistory: ", error.message);
      return res.json({
          status: 400,
          error: true,
          message: "Something went wrong in captureFundHistory, please try again!"
      })
  }
}