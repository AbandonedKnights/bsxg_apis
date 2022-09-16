async function getNextId() {
    const UserModel = require("../models/user");
    const user = await UserModel.findOne({}).sort({ createdAt: -1 });
    const old = user.member_id
    const n = parseInt(old.slice(5)) + Number((Math.floor(Math.random() * 100)).toString())
    const next_id = "BUSDT" + n
    return next_id;
}

async function getPromoter(sponsorID) {
    try {
        const UserModel = require("../models/user");
        console.log(sponsorID);
        const member = await UserModel.findOne({user_id: sponsorID, directs: {$lt: 5}});
        if(member) {
            console.log("member :: ", member);
            return member.user_id;
        } else {
            const member = await UserModel.findOne({promoter_id: sponsorID, directs: {$lt: 5}});
            return member.user_id;
            console.log("member :: ", member);

        }
        
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

module.exports = {
    getPromoter
}