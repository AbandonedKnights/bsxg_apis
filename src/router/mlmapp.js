const packages = [
    { name: "Associate", amount: 50, profit: 2, duration: 1000, total_trades: 200, restake: 50 },
    { name: "Qualification", amount: 100, profit: 2, duration: 1500, total_trades: 300, restake: 50 },
    { name: "Business Promoter", amount: 200, profit: 3, duration: 1000, total_trades: 300, restake: 50 },
    { name: "Ambassador", amount: 500, profit: 4, duration: 750, total_trades: 300, restake: 50 },
    { name: "Silver Ambassador", amount: 500, profit: 4, duration: 750, total_trades: 300, restake: 50 },
    { name: "Platinum Ambassador", amount: 1000, profit: 4, duration: 750, total_trades: 300, restake: 50 },
    { name: "Gold Ambassador", amount: 2000, profit: 5, duration: 600, total_trades: 300, restake: 50 },
    { name: "Crown Ambassador", amount: 3000, profit: 5, duration: 600, total_trades: 300, restake: 50 },
    { name: "Vice Precident", amount: 5000, profit: 5, duration: 600, total_trades: 300, restake: 50 },
    { name: "Precident", amount: 10000, profit: 5, duration: 600, total_trades: 300, restake: 50 },
    { name: "Crown Director", amount: 15000, profit: 5, duration: 600, total_trades: 300, restake: 50 },
]

async function activateBooster(userID) {
    try {
        const UserModel = require("../models/user");
        const moment = require("moment");
        const user = await UserModel.findOne({ user_id: userID });
        const isBetween25D = moment().isBetween(moment(new Date(user.createdAt)), moment(new Date(user.createdAt)).add(25, 'd'));
        console.log(user.directs >= 5 && isBetween25D);
        if(user.directs >= 5 && isBetween25D) {
            await user.updateOne({user_id: userID},{$set: {is_booster_active: true}});
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function findparent(user_id) {
    const User = require("../models/user");
    try {
        const data = await User.aggregate([
            { $match: { user_id: user_id } },
            {
                $graphLookup: {
                    from: "user",
                    startWith: "$user_id",
                    connectFromField: "promoter_id",//promoter_id//parent_ref_code
                    connectToField: "user_id",
                    depthField: "level",
                    as: "referal",
                },
            },
            {
                $project: {
                    member_id: 1,
                    promoter_id: 1,
                    parent_ref_code: 1,
                    // level: 1,
                    "referal.user_id": 1,
                    "referal.level": 1,
                },
            },
        ]);

        if (data && data.length > 0) {
            // console.log(data)
            return data;
        } else {
            return [];
        }
    } catch (error) {
        //getDirectAndtotalmember
        console.log(
            "Error from functions >> function >> findparent: ",
            error.message
        );
    }
}

async function provideSpIncome(userID, spID, amount) {
    try {
        const UserModel = require("../models/user");
        const IncomeModel = require("../mlm_models/income_history");
        await UserModel.updateOne({ user_id: spID }, { $inc: { income_wallet: amount, shiba_balance: 10000 } })
        await IncomeModel.insertMany({ user_id: spID, income_from: userID, amount: amount, income_type: "referral" });
    } catch (error) {
        console.log(error.message);
    }
}

async function initApp() {
    try {
        const PackageModel = require("../mlm_models/packages");
        const rs = await PackageModel.insertMany(packages);
        console.log(rs)
    } catch (error) {
        console.log("init_app :: ", error.message)
    }
}
module.exports = { initApp, findparent, activateBooster };