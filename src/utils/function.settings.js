async function updateWebSettings(req){
    const Settings = require("../models/website_data");
    console.log("req : ", req)
    const { referral_coin,referral_fee,airdrop_coin,airdrop_fee, trade_fees, taker_fees, maker_fees } = req;
    let settings = {matchedCount:0};
    settings = await Settings.updateOne(
    { id:4}, {
        $set: {
        referral_coin:referral_coin,referral_fee:referral_fee,airdrop_coin:airdrop_coin,airdrop_fee:airdrop_fee,trade_fees: trade_fees, taker_fees: taker_fees, maker_fees: maker_fees
        }
    });
    return settings;
} 
module.exports = {
    updateWebSettings,
}