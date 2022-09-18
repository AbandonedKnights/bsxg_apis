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

async function provideSpIncome(spID, amount) {
    try {
        const UserModel = require("../models/user");
        const IncomeModel = require("../mlm_models/income_history");
        await UserModel.updateOne({user_id:spID},{$inc: {income_wallet: amount}})
        await IncomeModel.insertMany({});
    } catch(error) {

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
module.exports = { initApp };