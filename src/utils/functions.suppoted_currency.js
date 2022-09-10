async function CrptoSettingAPI(req){
    const Token = require("../models/suppoted_currency");
    const { token_symbol,is_buy,is_sell,is_trade,is_withdrawal,is_deposite,is_paired,buy_limit,sell_limit,withdrawal_limit,is_paired_inr,is_paired_btc,is_paired_usdt,is_paired_vrx,subaction, withdrawal_fee,deposite_fee,min_withdraw_limit,max_withdraw_limit,daily_withdraw_limit,min_deposite_limit } = req;
    let settings = {matchedCount:0};
    let update = true;
    let totalpaired = await Token.find({is_paired: true})
    if(subaction == 'set_pairing'){
      update = false
      if(totalpaired.length < 4){
        update = true;
      }else{
        return {
          query_status: 0,
          status : 400,
          message : "You can not set pairing more than 4"
        };
      }
    }
    if (token_symbol && update) {
      settings = await Token.updateOne(
        { symbol: token_symbol.toUpperCase() }, {
          $set: {
            is_buy, is_sell, is_trade, is_withdrawal, is_deposite, is_paired, buy_limit, sell_limit, withdrawal_limit, is_paired_inr, is_paired_btc, is_paired_usdt, is_paired_vrx, withdrawal_fee, deposite_fee, min_withdraw_limit, max_withdraw_limit, daily_withdraw_limit,min_deposite_limit
          }
      });
    }
    if ((is_paired || (is_paired === false))){
        const Paired = require("../models/paired_currency");
        let gettoken = await Token.findOne({symbol: token_symbol.toUpperCase()})
        let pairedtoken = await Paired.findOne({currency_coin: token_symbol.toUpperCase()})
        if(update){
          if(pairedtoken){
              settings = await Paired.updateOne(
                  { currency_coin: token_symbol.toUpperCase() },  {
                    $set: {
                      status      :is_paired,
                    }
                });
          }else{
              settings = await Paired.create({ 
                  currency_coin   :gettoken.symbol.toUpperCase(),
                  token_name      :gettoken.name,
                  currency_logo   :gettoken.icon,
                  currency_name   :gettoken.name,
                  status          :1,
              });
              settings.matchedCount = 1;
          }
        }
    }
    return settings;
} 
module.exports = {
    CrptoSettingAPI,
}