const { updateWebSettings } = require("../utils/function.settings");
const { storeOHLCCustom } = require("../utils/functions.chart");

async function webSettings(req, res) {
    try {
        const Settings = require("../models/website_data");
        const { website_name } = req.query;
        let wallet = '';
        if (website_name) {
            wallet = await Settings.findOne({ website_name: website_name});
        }else{
            wallet = await Settings.findOne();
        }
        return res.json(wallet)
    } catch (error) {
        console.log("Error: from: src>controller>settings.js>webSettings: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in webSettings, please try again!"
        })
    }
}
async function vaidateWebSettings(req, res) {
    try {
        let settings = '';
        const Settings = require("../models/website_data");
        settings = await updateWebSettings(req.body);
        let setting = await Settings.findOne(); 
        return res.json({
            status: 200,
            error: false,
            query_status: settings.matchedCount,
            message: "Updated Successfully",
            setting: setting,
        })
    } catch (error) {
        console.log("Error: from: src>controller>currency.js>vaidateWebSettings: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in vaidateWebSettings, please try again!"
        })
    }
}
async function getrefferellist(req, res) {
    try {
        const Settings = require("../models/referral_commission");
        const { user_id } = req.query;
        let wallet = '';
        if (user_id) {
            wallet = await Settings.findOne({ user_id: user_id});
        }else{
            wallet = await Settings.find();
        }
        return res.json(wallet)
    } catch (error) {
        console.log("Error: from: src>controller>settings.js>getrefferellist: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in getrefferellist, please try again!"
        })
    }
}
async function getairdroplist(req, res) {
    try {
        const Settings = require("../models/airdrop_commission");
        const { user_id } = req.query;
        let wallet = '';
        if (user_id) {
            wallet = await Settings.aggregate( [
                { "$match": { 
                    user_id:user_id 
                } }, 
                {
                    $lookup: {
                        from: "pending_kyc",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "pending_kyc",
                    }
                },
            ] );
        }else{
            wallet = await Settings.aggregate( [
                {
                    $lookup: {
                        from: "pending_kyc",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "pending_kyc",
                    }
                },
                {
                    $replaceRoot: { 
                        newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$pending_kyc", 0 ] }, "$$ROOT" ] } 
                    }
                 },
                { 
                    $project: { 
                        first_name:1,last_name:1,middle_name:1 ,email: 11, createdAt:1,user_id:1,status:1,wallet_type: 1,commission:1,raw_price:1,time_stamp:1
                    } 
                }
            ] ).sort({"createdAt":-1});
        }
        return res.json(wallet)
    } catch (error) {
        console.log("Error: from: src>controller>settings.js>getairdroplist: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in getairdroplist, please try again!"
        })
    }
}
async function getremotetrading(req, res) {
    try {
        const Settings = require("../models/remote_trading");
        totalsetting = await Settings.find();
        return res.json(totalsetting)
    } catch (error) {
        console.log("Error: from: src>controller>settings.js>getremotetrading: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in getremotetrading, please try again!"
        })
    }
}
async function updateremotetrading(req,res){
    try{
        const Remote = require("../models/remote_trading");
        const { action, currency_type,price,low,high,status,update_price, compare_currency, growth_rate} = req.body;
        let remotetrade = await Remote.findOne({currency_type, compare_currency})
        let settings  = {matchedCount:0};
        if(action == 'change_status' && currency_type && remotetrade){
            settings = await Remote.updateOne( { _id : remotetrade._id}, 
                { 
                    $set: {
                        status:status,
                        update_price:update_price,
                    }
            });
        } else if(remotetrade && status){
            settings = await Remote.updateOne(
            { _id : remotetrade._id}, {
                $set: {
                    price:price,
                    low:low,
                    high:high,
                    status:status,
                    update_price:true,
                    compare_currency  :compare_currency,
                    growth_rate
                }
            });
        }else if(currency_type && status && price && low && high){
            settings = await Remote.create({ 
                currency_type   :currency_type,
                price   :price,
                low     :low,
                high    :high,
                status  :true,
                update_price  :true,
                compare_currency  :compare_currency,
                growth_rate
            });
            if(settings){
                settings  = {matchedCount:1};
            }
        }else{
            return res.json({
                status: 400,
                error: true,
                query_status: settings.matchedCount,
                message: "Insufficient Data",
            })
        }
        return res.json({
            status: 200,
            error: false,
            query_status: settings.matchedCount,
            message: "Updated Successfully",
        })
    } catch (error) {
        console.log("Error: from: src>controller>settings.js>updateremotetrading: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong in updateremotetrading, please try again!"
        })
    }
} 
module.exports = {
    webSettings,
    vaidateWebSettings,
    getrefferellist,
    getairdroplist,
    getremotetrading,
    updateremotetrading
}