// const { createUserWallets } = require('../utils/function.wallets');
// const { createUniqueID, getUserIdFromReferalCode, updateReferalhistory } = require('../utils/function.settings');
const { createSocketClient } = require("../utils/functions.socket");
const { sendOTP } = require("../utils/mailer");
const { getUserFullNameFromUserId } = require("./user");
const socket = createSocketClient("kujgwvfq-z-ghosttown-z-1fhhup0p6");

function createSellOrderStack(req, res) {
    const { currency_type, compare_currency, raw_price, volume } = req.query;
    let obj = {
        currency_type,
        compare_currency,
        raw_price,
        volume,
    };
    socket.emit("update_sell_stack", obj);
    return res.json({
        status: 200,
        error: false,
        message: "Sell stack created!",
    });
}

function createBuyOrderStack(req, res) {
    const { currency_type, compare_currency, raw_price, volume } = req.query;
    let obj = {
        currency_type,
        compare_currency,
        raw_price,
        volume,
    };
    socket.emit("update_buy_stack", obj);
    return res.json({
        status: 200,
        error: false,
        message: "Buy stack created!",
    });
}
function createOrderHistory(req, res) {
    const { currency_type, compare_currency, raw_price, volume } = req.query;
    let obj = {
        currency_type,
        compare_currency,
        raw_price,
        volume,
    };
    socket.emit("update_order_history", obj);
    return res.json({
        status: 200,
        error: false,
        message: "Order history created!",
    });
}
async function fetchUserInchunks(req, res) {
    /**
     *
     */
    const limit = req.body.limit ? parseInt(req.body.limit) : 10;
    const skip = req.body.skip ? parseInt(req.body.skip) : 0;
    const User = require("../models/user");
    // console.log(limit)
    let _data = await User.find().skip(skip).limit(limit);
    return res.json({
        status: 200,
        error: false,
        message: "Success",
        data: _data,
    });
}
async function uploadImage(req, res) {
    const mime = require("mime");
    const fs = require("fs");
    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error("Invalid input string");
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], "base64");

        return response;
    }
    var decodedImg = decodeBase64Image(
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAGQAZAMBIgACEQEDEQH/xAAcAAABBAMBAAAAAAAAAAAAAAAAAQQGBwIFCAP/xAA+EAABAgQDBQUGAwUJAAAAAAABAgMABAURBhIhBxMxQWEiUXGBkRQVMqGx0QgjQhZScoTBJCZTYnODkqKy/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECBAMF/8QAIhEAAgICAgICAwAAAAAAAAAAAAECEQMxBCESQRMiMjOB/9oADAMBAAIRAxEAPwC7QDCgQsEIAgghpOTaZVOZxWUd5GkDdIErHUNZmpSMqrLMzssyr91x1KT8zGoreJpelUuoTDikpflpRyYaSVCzoSNMvfqQPOOSJuZfnZl2am3VPTDqitxxZuVKPEmGnegarZ2FiHEVKw5TfeFXnEsS5UEoIBUVqPAJA1JiFy+2zCTs+mWUKg00Tb2lxgbseNlFXyiqKjVvbdjkhKPvpXMS1bUlKVLuvJulHnyuq3pEEF76DU8hzgEdssvNvModZcS404kKQtJuFJOoIPdHpEcwuGaBhmkUqpzss1Ny8o2hxC3kghWXgLnxHlCSeOMNz1caoslVGZicdSSgM3UhRAuRnGl7a2vAOiSQhEAhYKAwIgjOCEMIIIIBCGGtQaS7LKCyEgEKKieFjDqMHVpbRmWbJ56Q3oFspTbbSpOWoYmyXHZlT6UDKsltsm5KjrlzEAiwF+BOgik2W966hsKSkrUE5lqypF+ZPIdYs/btiBdQrMrSpfIiRlG8+RPNxV9TboNPE98VaImK6HLZb1OwxhxnAFSpc/iTDYrD8yHmpludQsICbWTmtmItm0A5xVk+0zJT7jclOJmkNr7Ew2kpSu1tQDrx+kbrBdKotVmJtNeq6qe2wwXWwALvkcUgnQHpziNmBPugeiytmWEmcfVebqGIKsXlNrC5iXLh37/DUk8EcBpry00i76XgnDtKmkTNOp5YWhzeoSiYcyJXly5gjNlBtpe3COa9nVVdpOMqTMtOFtJmUNOkG121qCVA+RjrWGth3VmULCQsNkhBBBCGJCxhnGco1zWvGUF2AGPKZbU6wtCFBJULBRTmt5R6wQ9qg0ygdtOEfdUnKz0oh91verVMPq7RUtZHaWbackgDS3C3OonG1N2CrA66X1Fu8co7XWht5GVxCVp/dULiKC26uYelH2KPSZFhmoNvGZmlspCQnOkDKf8AMbJUfI84mKrocn5FR3gggiyT0aUUKCkmygbg9xjsXDFSFZw9Takkj+0y6HDbkSNR63jmfBOzms4xknZ2mvSbUu08WVF9agc1gdAAeShHRmBaM7h3C8jR5l9L70qkha0A5blROl+QvE+x+iQCFhOEY7xO8yDUgXPSBsEjKCEK0p4qA8TCQrQUc5HatiRxQUJhttW7yKs2Dfr0MOpXajiEJyrnM1xa5bTcRoW9mmLiL+6SPF5I/rHu3s2xcFW912679P3jHLFGumbIZX7SJlTNpFUJAcmAu/HOAYlUljdb7KEKypUnioc4rNjZ5i5rX3cg/wC+mNrLYNxc2U3p6bf66Yw5cOdfrkzbCfHmvukWdK4oYQ2tbxzJAKjY8O+OXK9VXq5WZ2qTOjk28p0pv8NzoPIWHlFj4xYr2HKIt6osIl9+dy2d8kkkjWw52EVRG7gLP4P5f4YOYsSkvjDSEELCAxvMZamxXFDlIRVZAr/LcyPISeR+FR/8+kTydxs6kFTThC+/uimtnVMn6vW3WKY2lx5MspSklYT2cye/yifP4DxQ5e0kgfzCY8fm4s0831bo9XhywrH912es9tBqYBT7Srjx0uI1x2o1yXD27fbWpwWCnEXKOojymNm+K18JFo/zCY1kzszxckEppgV0D6PvDw8enbbHlzR1FI1U/i6tzkwXX6nNLXa194R9IIYv4YxEy8ptyiT4Uk2NmSR6iCNfxwMnyzOomJGYQe1UH1/xJT9odCXc/wAZXoIRLpUDYcIyS6ru+cdUkjk2xUyywdXlkeUD27lmXH5mZDTLScy3FqACQOZPKIfj7aRI4N3ct7OqcqDyN4hgLCUpTe2ZStbcDYW1tFEYyxzWsWzBNQfLUoD2JNpRDSfEfqPU/KKUUS5NHptIxhMYvrqnibSEspSJJsgXCNLqJtxVYHpwiJxtJOh1Obb3rck8GbX3q0FKLeJhlOtIYmVtNupeSg23ieBPO3S8VGUW/FMTjJLya6PCMYUwCLIL6/DtTGvcVSqSchmHJncZgntISlINrkcDmB0i3AysfqJ8Yh2xttiW2b0ksFJ3ocWtQ5rLir38LW8omZWY5tKy02JkMIUacPnBvDGJcN9IXQ+zAt6wQb3oYIVIfZ5IKddE3HdDepVFil06bqE1oxKtKdc05AXtCtZ1pupKmyRcC4JHSNRjOhu4ioLtNamdxnWlagTYOhJvlJ5C9vSJsqjm+pTVSxbiJ+ccQXZybczZE6htN7AX5JSLC5jf0Kn/ALPzCZuosNqSpW6Lix2WT/QHTWLDkKc3h2XDCqSuTFyA43+YlfXMLnWw4xHMSyztRZ3cvLqzhV94oAIQM1wTzVp3A8YxZeQ5y8GqRtw4IwXnthjushGDkbkrQqacS00Qr4kgXUodOUVYqScTIJnFaNKd3SbjiQLn00iU1NqZxViKn0Ojp3pbRuwlJ7KVcVq1tYAAadIlW1vDMvhrBVClGviRMqT/ANNSe8k8Y0cXG8UFFLfbM/Jmsk270VVIJaVPS6ZkEsl1IcANrpuL6+EWZti2fUrClOp9RoheSy46WHUOrK7kgqSoHlwI9IrmjSap6syEiNFTMw00L6fEoAfWL/8AxBtgYFYt+mebt/xVGwymWwSoe24F9iVYGRm1tC/NKu39VGLHNwSRaw0tFX/h7lDL4PnJlZy+1Tiij+FKUj63iy1jIbldknhYRzkykKtVuOgjBZtqDc90Y5wTbeDwItf1huqbYXmyui6L3smJsqh0T1HpCQyUkqN0qKh35oIXkVQpYSpWfMoFs6AHQ3HOMGgGpXM3cFNjxJ1JN4II5plHu8yh9Bac1Qq4KbCxiD7TWv2XwnMVGjK3M2XW0B1SErKASAcuYG0EENRTkrFbUSF7AkGbxXValNLW7NIlrhazckrWMxPXT5mN7+I9ShSaGMxN3nSfHKn7wkEaPZx9ELpMs03tfo8uhOVtDsplA5WZQYs3b+f7itpOt59r6Kggg9iNjs7lEy2zqgsyrrjImGStak2JuolR4g8zEvDYKdVKuRxv5QQRzf5M6LQyqba2UNLQ858QuDax49IbOkhqWynKXXcizYG4se/wggjnJFjCRqDryXc6G/y3VIFgRoD4wQQRIz//2Q=="
    );
    var imageBuffer = decodedImg.data;
    var type = decodedImg.type;
    var extension = mime.getExtension(type);
    var fileName = Date.now() + "-image." + extension;
    try {
        fs.writeFileSync("./src/d/images/" + fileName, imageBuffer, "utf8");
    } catch (err) {
        console.error(err);
    }
}
async function getH(req, res) {
    try {
        const TradeHistory = require("../models/trade_history");
        const data = await TradeHistory.find({
            $or: [
                { buy_order_id: "order$17c9db51f81/b" },
                { sell_order_id: "order$17c9db51f81/b" },
            ],
        });
        return res.json({
            data: data,
        });
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error: ${error.message}`,
        });
    }
}
async function getName(req, res) {
    try {
        const name = await getUserFullNameFromUserId(req.body.user_id);
        return res.json({
            status: 200,
            name: name,
        });
    } catch (error) {
        return res.json({
            status: 400,
        });
    }
}
async function findWalletsFromContractAddress(req, res) {
    const Wallets = require("../models/wallets");
    try {
        const wallet = await Wallets.findOne({
            contract_address: "0xa29328B3D32605C1d9171fE151C77E2f9Ce96c6b",
        });
        return res.json({
            status: 200,
            data: wallet,
        });
    } catch (error) {
        return res.json({
            status: 400,
        });
    }
}
/**
 * user_id: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    mobile_number: { type: Number, default: '' },
    created_on: {type: String, default: Date.now()},
    self_ref_code: { type: String, default: '' },
    parent_ref_code: { type: String, default: '' },
    user_role: { type: Number, default: 0 },
    is_email_verified: { type: Number , default: false, required: true},
    is_kyc_verified: { type: Number, default: false, required: true },
    is_bank_verified: { type: Number, default: false, required: true },
    is_mobile_verified: { type: Number, default: false, required: true },
    loginToken: { type: String, default: '' },
    referral_income: { type: Number, default: 0.0 },
    ip_address: { type: String, default: '' },
    wallet_password: { type: String, default: ''},
    user_status: { type: Number, default: ''},
    authenticator:{ type: Number, default:0},
    secret_key:{ type: Object, default:false}
 */
async function fetchJsonData(req, res) {
    const Users = require("../models/user");
    try {
        const data = require("../json/user.json");
        let arr = [];
        const users_ = data[2].data.map((user) => {
            //create new user_id
            const new_user_id = createUniqueID("user");
            let obj = {
                user_id: new_user_id ? new_user_id : createUniqueID("user"),
                email: user.email ? user.email : Date.now(),
                hashedPassword: user.password ? user.password : "hashedPassword",
                mobile_number: user.mobile_number ? user.mobile_number : 0,
                created_on:
                    parseInt(user.created_on_time ? user.created_on_time : 0) * 1000,
                self_ref_code: user.self_ref_code ? user.self_ref_code : "",
                parent_ref_code: user.parent_ref_code ? user.parent_ref_code : "",
                user_role: user.user_role ? user.user_role : 0,
                is_email_verified: user.is_email_verified
                    ? user.is_email_verified
                    : false,
                is_kyc_verified: user.is_kyc_verified ? user.is_kyc_verified : false,
                is_bank_verified: user.is_bank_verified ? user.is_bank_verified : false,
                is_mobile_verified: user.is_mobile_verified
                    ? user.is_mobile_verified
                    : false,
                loginToken: user.user_id,
                referral_income: user.referral_income ? user.referral_income : 0,
                ip_address: user.ip_address ? user.ip_address : "",
                wallet_password: user.wallet_password ? user.wallet_password : "",
                user_status: user.user_status ? user.user_status : 0,
            };
            console.log(obj);
            if (user.user_id) arr.push(obj);
            return obj;
        });
        // Promise.all(users_).then( resp => {
        //     Users.insertMany(users_).then((responce) => {
        //         return res.json({
        //             status: 200,
        //             data: responce
        //         })
        //     }).catch(error => {
        //         return res.json({
        //             status: 400,
        //             data: error
        //         })
        //     });

        // })
        Users.insertMany(arr)
            .then((responce) => {
                return res.json({
                    status: 200,
                    data: responce,
                });
            })
            .catch((error) => {
                return res.json({
                    status: 400,
                    data: error,
                });
            });
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: error.message,
        });
    }
}

async function fetchJsonData1(req, res) {
    const Users = require("../models/user");
    const KYC = require("../models/pending_kyc");
    try {
        const user_data = require("../json/user.json");
        const data = require("../json/kyc_data.json");
        const data1 = require("../json/personal_info.json");
        // Users.find({}).then(data => {
        //     let arr = {};
        //     if (data && data.length > 0) {
        //         data.map((d) => {
        //             arr[d.loginToken] = d.user_id
        //         })
        //     }
        //     console.log(arr);
        //     return res.json({
        //         status: 200,
        //         data: arr
        //     })
        // }).catch(err => {
        //     return res.json({
        //         status: 400,
        //         data: err
        //     })
        // })
        const user_id_data = {
            98172: "17cc6a49934/u",
            442129502: "17cc6a4e76e/u",
            589804825: "17cc6a4fbf5/u",
            759630179: "17cc6a4de3a/u",
            "8561oB755": "17cc6a49938/u",
            "351o2O948": "17cc6a4993c/u",
            "702tjo183": "17cc6a4993f/u",
            "7339WT593": "17cc6a49942/u",
            "8720Rt156": "17cc6a49945/u",
            "7549Tw354": "17cc6a49948/u",
            "9673tz500": "17cc6a4994c/u",
            "497nJz186": "17cc6a4994f/u",
            "359ta5503": "17cc6a49952/u",
            "655LsB583": "17cc6a49955/u",
            "760ro7482": "17cc6a49958/u",
            "486Jpd150": "17cc6a4995b/u",
            "35424m220": "17cc6a4995e/u",
            "651DF8679": "17cc6a49961/u",
            "766E5K627": "17cc6a49965/u",
            "446r0Z150": "17cc6a49968/u",
            "6153vz444": "17cc6a4996b/u",
            "9006UF400": "17cc6a4996e/u",
            "664i65622": "17cc6a49971/u",
            "330DCo841": "17cc6a49975/u",
            "205GIT733": "17cc6a49978/u",
            "822mdM482": "17cc6a4997b/u",
            "345C07654": "17cc6a4997e/u",
            "610uO5245": "17cc6a49981/u",
            "793Aha413": "17cc6a49984/u",
            "231r3U208": "17cc6a49987/u",
            "8398HB586": "17cc6a4998a/u",
            "904yjk649": "17cc6a4998d/u",
            "314PGq531": "17cc6a49990/u",
            "5778Zj373": "17cc6a49993/u",
            "517gpe603": "17cc6a49996/u",
            "820QG4123": "17cc6a49999/u",
            "503WpH946": "17cc6a4999b/u",
            "556bfL875": "17cc6a4999e/u",
            "384N8f660": "17cc6a499a2/u",
            "278qRH441": "17cc6a499a5/u",
            "802juZ390": "17cc6a499a8/u",
            "178YEc234": "17cc6a499ab/u",
            "462yim831": "17cc6a499ad/u",
            "152nRC995": "17cc6a499b1/u",
            "239uXV594": "17cc6a499b4/u",
            "749RvO147": "17cc6a499b7/u",
            "548VRb973": "17cc6a499ba/u",
            "257lVf342": "17cc6a499bd/u",
            "407hzq761": "17cc6a499c0/u",
            "564MH8223": "17cc6a499c4/u",
            "179xwa925": "17cc6a499c6/u",
            "234nb8142": "17cc6a499c9/u",
            "457b8c553": "17cc6a499cc/u",
            "7467Nw283": "17cc6a499cf/u",
            "135bPF142": "17cc6a499d2/u",
            "9931dH863": "17cc6a499d5/u",
            "512Bnq748": "17cc6a499d8/u",
            "2165I9111": "17cc6a499db/u",
            "237kY4353": "17cc6a499de/u",
            "632Nes762": "17cc6a499e1/u",
            "484hYC691": "17cc6a499e4/u",
            "750XW6348": "17cc6a499e7/u",
            "500nbl596": "17cc6a499ea/u",
            "142q3U787": "17cc6a499ec/u",
            "806q8l850": "17cc6a499ef/u",
            "92708y917": "17cc6a499f2/u",
            "869RCj523": "17cc6a499f5/u",
            "974Taj559": "17cc6a499f8/u",
            "665TjH155": "17cc6a499fb/u",
            "4077tX326": "17cc6a499fe/u",
            "551tp3151": "17cc6a49a01/u",
            "335xbP721": "17cc6a49a05/u",
            "312a2N920": "17cc6a49a08/u",
            "956IwD667": "17cc6a49a0b/u",
            "788xN6937": "17cc6a49a0e/u",
            "448OA3271": "17cc6a49a11/u",
            "673w4m342": "17cc6a49a14/u",
            "890icb542": "17cc6a49a17/u",
            "434xHD179": "17cc6a49a1a/u",
            "915Fr1690": "17cc6a49a1d/u",
            "251Aiv264": "17cc6a49a1f/u",
            "142Hq6994": "17cc6a49a23/u",
            "214aGY270": "17cc6a49a26/u",
            "632lGj812": "17cc6a49a29/u",
            "503V4q897": "17cc6a49a2c/u",
            "917rKx824": "17cc6a49a2f/u",
            "668j0k132": "17cc6a49a32/u",
            "1669Ko420": "17cc6a49a35/u",
            "343HkP676": "17cc6a49a38/u",
            "384pDs639": "17cc6a49a3b/u",
            "509AbD936": "17cc6a49a3e/u",
            "923QEj615": "17cc6a49a41/u",
            "899Q5u335": "17cc6a49a44/u",
            "256QCD655": "17cc6a49a47/u",
            "196qCI850": "17cc6a49a4a/u",
            "936DAE143": "17cc6a49a4d/u",
            "903Tzh334": "17cc6a49a50/u",
            "748TOi149": "17cc6a49a53/u",
            "586aEi421": "17cc6a49a56/u",
            "314wqo773": "17cc6a49a59/u",
            "620tDd645": "17cc6a49a5d/u",
            "689Ugk801": "17cc6a49a60/u",
            "5432xy248": "17cc6a49a63/u",
            "1921hF993": "17cc6a49a66/u",
            "384ri5265": "17cc6a49a69/u",
            "695HUN169": "17cc6a49a6c/u",
            "4245Uf774": "17cc6a49a6f/u",
            "114K4w618": "17cc6a49a72/u",
            "589bLw690": "17cc6a49a75/u",
            "112pFL427": "17cc6a49a78/u",
            "140tj7204": "17cc6a49a7b/u",
            "450jNp270": "17cc6a49a7f/u",
            "179pem630": "17cc6a49a81/u",
            "858DqY272": "17cc6a49a84/u",
            "262HGU298": "17cc6a49a87/u",
            "918rU7968": "17cc6a49a8a/u",
            "808aU1495": "17cc6a49a8d/u",
            "2712kX379": "17cc6a49a90/u",
            "148dDO674": "17cc6a49a92/u",
            "8184Ap429": "17cc6a49a95/u",
            "511QlU825": "17cc6a49a98/u",
            "905ubR291": "17cc6a49a9b/u",
            "640NCx457": "17cc6a49a9e/u",
            "707xpD504": "17cc6a49aa0/u",
            "549Fzh607": "17cc6a49aa3/u",
            "7479PA675": "17cc6a49aa6/u",
            "570cgZ247": "17cc6a49aaa/u",
            "668wR7769": "17cc6a49aac/u",
            "5395kV530": "17cc6a49aaf/u",
            "310G3r388": "17cc6a49ab2/u",
            "8966qw705": "17cc6a49ab5/u",
            "863fEB358": "17cc6a49ab8/u",
            "154nAj291": "17cc6a49abb/u",
            "980xjJ739": "17cc6a49abe/u",
            "8540XR425": "17cc6a49ac1/u",
            "675DC5318": "17cc6a49ac4/u",
            "1350z1452": "17cc6a49ac7/u",
            "121pcu219": "17cc6a49aca/u",
            "388tPk577": "17cc6a49acd/u",
            "470iH2157": "17cc6a49ad1/u",
            "381qZf238": "17cc6a49ad4/u",
            "949nYe375": "17cc6a49ad7/u",
            "525QgW884": "17cc6a49ada/u",
            "864duH758": "17cc6a49add/u",
            "125cAv518": "17cc6a49ae0/u",
            "792J1I160": "17cc6a49ae4/u",
            "959vpg366": "17cc6a49ae6/u",
            "256CBZ385": "17cc6a49ae9/u",
            "9994Nj297": "17cc6a49aec/u",
            "724LXz866": "17cc6a49aef/u",
            "363FeZ243": "17cc6a49af2/u",
            "478vHm668": "17cc6a49af5/u",
            "270VKP768": "17cc6a49af8/u",
            "489ChP367": "17cc6a49afb/u",
            "757Kbx817": "17cc6a49afe/u",
            "635xpq359": "17cc6a49b01/u",
            "699cHi935": "17cc6a49b04/u",
            "3126Gs245": "17cc6a49b07/u",
            "970aJ0281": "17cc6a49b0a/u",
            "538Sed764": "17cc6a49b0d/u",
            "275ucJ572": "17cc6a49b10/u",
            "589YJ1141": "17cc6a49b13/u",
            "1820d9190": "17cc6a49b16/u",
            "3704Am583": "17cc6a49b19/u",
            "499qjI646": "17cc6a49b1b/u",
            "584vVu367": "17cc6a49b1e/u",
            "925oMm266": "17cc6a49b21/u",
            "367gIq722": "17cc6a49b24/u",
            "276ilF398": "17cc6a49b27/u",
            "218mGs149": "17cc6a49b2a/u",
            "171yQ2321": "17cc6a49b2d/u",
            "898Jnw944": "17cc6a49b30/u",
            "867zMP864": "17cc6a49b33/u",
            "366voT950": "17cc6a49b36/u",
            "7753Xw683": "17cc6a49b3a/u",
            "231dWZ985": "17cc6a49b3d/u",
            "190cjZ559": "17cc6a49b40/u",
            "277IMu352": "17cc6a49b43/u",
            "484kSh772": "17cc6a49b47/u",
            "784EOh806": "17cc6a49b4a/u",
            "733lHE247": "17cc6a49b4d/u",
            "888rlR508": "17cc6a49b50/u",
            "542HE4238": "17cc6a49b53/u",
            "471z1U293": "17cc6a49b56/u",
            "958cJW806": "17cc6a49b59/u",
            "254aU4366": "17cc6a49b5d/u",
            "633mAO398": "17cc6a49b60/u",
            "325QzD183": "17cc6a49b63/u",
            "233sy1634": "17cc6a49b66/u",
            "947mNl835": "17cc6a49b69/u",
            "257fiu164": "17cc6a49b6c/u",
            "8600wH613": "17cc6a49b6f/u",
            "458c31934": "17cc6a49b72/u",
            "976HKr124": "17cc6a49b75/u",
            "993XG8237": "17cc6a49b78/u",
            "637ucJ440": "17cc6a49b7a/u",
            "418x7J376": "17cc6a49b7d/u",
            "3215YG337": "17cc6a49b80/u",
            "899dRD515": "17cc6a49b83/u",
            "872UBF736": "17cc6a49b85/u",
            "620Zok635": "17cc6a49b88/u",
            "169ZIJ958": "17cc6a49b8a/u",
            "232kBH356": "17cc6a49b8c/u",
            "7976wh458": "17cc6a49b8f/u",
            "191FsB416": "17cc6a49b93/u",
            "9037aw665": "17cc6a49b96/u",
            "644FO2615": "17cc6a49b98/u",
            "6108bz930": "17cc6a49b9a/u",
            "151kZY728": "17cc6a49b9c/u",
            "986VD4993": "17cc6a49b9e/u",
            "355h8u431": "17cc6a49ba0/u",
            "473pT4482": "17cc6a49ba3/u",
            "641y5d883": "17cc6a49ba5/u",
            "496QiD848": "17cc6a49ba7/u",
            "5103Bb971": "17cc6a49ba9/u",
            "542uyl786": "17cc6a49bab/u",
            "9472Bf529": "17cc6a49bad/u",
            "692lvX729": "17cc6a49bb0/u",
            "768mHR165": "17cc6a49bb2/u",
            "850rl0164": "17cc6a49bb4/u",
            "543dZA149": "17cc6a49bb7/u",
            "782n9p290": "17cc6a49bba/u",
            "290cVj895": "17cc6a49bbd/u",
            "8271Uk863": "17cc6a49bc0/u",
            "275je7608": "17cc6a49bc3/u",
            "394Gxp585": "17cc6a49bc6/u",
            "332Yh3422": "17cc6a49bc9/u",
            "891tNE464": "17cc6a49bcc/u",
            "394w1k405": "17cc6a49bcf/u",
            "470QqG952": "17cc6a49bd2/u",
            "182Hom309": "17cc6a49bd5/u",
            "458hHF877": "17cc6a49bd8/u",
            "621pJL212": "17cc6a49bdb/u",
            "651Vyk180": "17cc6a49bde/u",
            "144D1H238": "17cc6a49be0/u",
            "8325OS885": "17cc6a49be3/u",
            "795qHK815": "17cc6a49be6/u",
            "977EJF661": "17cc6a49be9/u",
            "216zZb923": "17cc6a49beb/u",
            "728EdK861": "17cc6a49bee/u",
            "936XKn286": "17cc6a49bf0/u",
            "135Edy831": "17cc6a49bf2/u",
            "959Dv0576": "17cc6a49bf4/u",
            "235KIp358": "17cc6a49bf6/u",
            "986fvD249": "17cc6a49bf9/u",
            "292KZC287": "17cc6a49bfb/u",
            "416M2T886": "17cc6a49bfd/u",
            "39490u434": "17cc6a49bff/u",
            "222Zax420": "17cc6a49c01/u",
            "534FgJ126": "17cc6a49c03/u",
            "964yWU962": "17cc6a49c05/u",
            "402Dml113": "17cc6a49c08/u",
            "471EJ8329": "17cc6a49c0a/u",
            "79916H914": "17cc6a49c0c/u",
            "791APF905": "17cc6a49c0e/u",
            "6071A2438": "17cc6a49c10/u",
            "5869Me471": "17cc6a49c12/u",
            "299Tdg878": "17cc6a49c14/u",
            "719lni318": "17cc6a49c16/u",
            "50975a322": "17cc6a49c19/u",
            "932ZfK557": "17cc6a49c1b/u",
            "442YwE909": "17cc6a49c1e/u",
            "900APa651": "17cc6a49c20/u",
            "687slt946": "17cc6a49c22/u",
            "8128nR924": "17cc6a49c24/u",
            "693ubf609": "17cc6a49c26/u",
            "954G9C512": "17cc6a49c29/u",
            "153ZLs324": "17cc6a49c2c/u",
            "245u3I124": "17cc6a49c2f/u",
            "549Yg5937": "17cc6a49c32/u",
            "948vG7379": "17cc6a49c35/u",
            "759vIc788": "17cc6a49c37/u",
            "511uX2188": "17cc6a49c3b/u",
            "511BxW254": "17cc6a49c3d/u",
            "968ZNe890": "17cc6a49c3f/u",
            "582VGI392": "17cc6a49c41/u",
            "787SDJ694": "17cc6a49c43/u",
            "815RGX642": "17cc6a49c45/u",
            "995PWO873": "17cc6a49c47/u",
            "924IE6489": "17cc6a49c49/u",
            "136OsM241": "17cc6a49c4c/u",
            "235U16856": "17cc6a49c4e/u",
            "8580ed500": "17cc6a49c50/u",
            "492hYU552": "17cc6a49c52/u",
            "219nO9251": "17cc6a49c54/u",
            "457pZ8115": "17cc6a49c56/u",
            "9466dY665": "17cc6a49c58/u",
            "392wR3813": "17cc6a49c5a/u",
            "433L31636": "17cc6a49c5c/u",
            "396xD6881": "17cc6a49c5e/u",
            "6737Sw217": "17cc6a49c60/u",
            "804G2f710": "17cc6a49c62/u",
            "283WBI572": "17cc6a49c64/u",
            "547Crv192": "17cc6a49c66/u",
            "635cOx210": "17cc6a49c68/u",
            "239DCY534": "17cc6a49c6a/u",
            "440GXC834": "17cc6a49c6d/u",
            "600QKX297": "17cc6a49c6f/u",
            "399b1D269": "17cc6a49c71/u",
            "560F3T966": "17cc6a49c73/u",
            "283CKQ313": "17cc6a49c75/u",
            "896bwq513": "17cc6a49c77/u",
            "755kcW533": "17cc6a49c79/u",
            "62026n849": "17cc6a49c7b/u",
            "141AsF578": "17cc6a49c80/u",
            "914GNn355": "17cc6a49c82/u",
            "535zF5662": "17cc6a49c84/u",
            "719Dmg505": "17cc6a49c86/u",
            "659kTz847": "17cc6a49c88/u",
            "407t8l916": "17cc6a49c8a/u",
            "306Jqz973": "17cc6a49c8c/u",
            "470EUi923": "17cc6a49c8f/u",
            "154IPv698": "17cc6a49c91/u",
            "792DEr161": "17cc6a49c93/u",
            "940gGi896": "17cc6a49c95/u",
            "436XDi695": "17cc6a49c97/u",
            "891BTF756": "17cc6a49c98/u",
            "5610BO988": "17cc6a49c9a/u",
            "598MJ8635": "17cc6a49c9e/u",
            "4865wP400": "17cc6a49ca0/u",
            "199Tb1636": "17cc6a49ca2/u",
            "878AEK931": "17cc6a49ca4/u",
            "659DKe537": "17cc6a49ca6/u",
            "527Omp313": "17cc6a49ca8/u",
            "774OgZ925": "17cc6a49caa/u",
            "475qm0203": "17cc6a49cac/u",
            "355UbQ531": "17cc6a49caf/u",
            "501cNy551": "17cc6a49cb1/u",
            "667ESD234": "17cc6a49cb9/u",
            "934QNf567": "17cc6a49cbc/u",
            "639JT2959": "17cc6a49cbe/u",
            "961WDK140": "17cc6a49cc1/u",
            "907T9B321": "17cc6a49cc3/u",
            "650K7k178": "17cc6a49cc5/u",
            "465f8c123": "17cc6a49cc7/u",
            "592eag122": "17cc6a49cc9/u",
            "712msD897": "17cc6a49ccb/u",
            "458tc7505": "17cc6a49ccd/u",
            "162r5U736": "17cc6a49cd0/u",
            "518Eyx282": "17cc6a49cd2/u",
            "871rWh937": "17cc6a49cd4/u",
            "794QAT169": "17cc6a49cd6/u",
            "3153es712": "17cc6a49cd8/u",
            "50550G341": "17cc6a49cda/u",
            "548nQ4505": "17cc6a49cdd/u",
            "833bNk893": "17cc6a49cdf/u",
            "517ajQ731": "17cc6a49ce2/u",
            "8617vy461": "17cc6a49ce4/u",
            "251Tgv230": "17cc6a49ce6/u",
            "5145nX411": "17cc6a49ce8/u",
            "5581Cd164": "17cc6a49cea/u",
            "440WhB537": "17cc6a49cec/u",
            "239l3G455": "17cc6a4acd8/u",
            "430ThM447": "17cc6a4acdb/u",
            "919fc7993": "17cc6a4acdf/u",
            "6018iw335": "17cc6a4ace2/u",
            "856Lkf513": "17cc6a4ace6/u",
            "7637lE796": "17cc6a4ace9/u",
            "904lr3440": "17cc6a4acec/u",
            "243emi191": "17cc6a4acef/u",
            "5690Jq899": "17cc6a4acf3/u",
            "277S9G323": "17cc6a4acf6/u",
            "180L9d736": "17cc6a4acf9/u",
            "243Nbg757": "17cc6a4acfd/u",
            "80454p409": "17cc6a4acff/u",
            "902bVu702": "17cc6a4ad02/u",
            "115YCm396": "17cc6a4ad06/u",
            "1259mr370": "17cc6a4ad08/u",
            "317iIC448": "17cc6a4ad0b/u",
            "812ZrG341": "17cc6a4ad0e/u",
            "836BGX206": "17cc6a4ad11/u",
            "174kgB757": "17cc6a4ad14/u",
            "8998Bv241": "17cc6a4ad17/u",
            "129pqT798": "17cc6a4ad1a/u",
            "267Tjt177": "17cc6a4ad1d/u",
            "673Rlm988": "17cc6a4ad20/u",
            "414JdN688": "17cc6a4ad22/u",
            "683RPe604": "17cc6a4ad25/u",
            "159Kcx330": "17cc6a4ad28/u",
            "195bwC759": "17cc6a4ad2a/u",
            "810btF116": "17cc6a4ad2c/u",
            "119iuh331": "17cc6a4ad2e/u",
            "658FyR623": "17cc6a4ad30/u",
            "656zjX944": "17cc6a4ad32/u",
            "732t1v952": "17cc6a4ad35/u",
            "496ZYf188": "17cc6a4ad38/u",
            "123FIm700": "17cc6a4ad3a/u",
            "794mDj799": "17cc6a4ad3c/u",
            "30718f383": "17cc6a4ad3e/u",
            "853YWf785": "17cc6a4ad40/u",
            "628gXM492": "17cc6a4ad43/u",
            "574VPr672": "17cc6a4ad45/u",
            "264WsY735": "17cc6a4ad47/u",
            "597i8p492": "17cc6a4ad4a/u",
            "9112UA844": "17cc6a4ad4c/u",
            "281DLf519": "17cc6a4ad4f/u",
            "581zGJ670": "17cc6a4ad51/u",
            "286yE8375": "17cc6a4ad53/u",
            "380ScK159": "17cc6a4ad59/u",
            "599FqI247": "17cc6a4ad5c/u",
            "966Yol446": "17cc6a4ad5f/u",
            "2515hg722": "17cc6a4ad62/u",
            "8549AP144": "17cc6a4ad66/u",
            "359VmT151": "17cc6a4ad69/u",
            "595kMa847": "17cc6a4ad6c/u",
            "995kJ9655": "17cc6a4ad70/u",
            "815VTL976": "17cc6a4ad72/u",
            "8369yG988": "17cc6a4ad75/u",
            "771Om6241": "17cc6a4ad7b/u",
            "632vUd804": "17cc6a4ad7e/u",
            "865nl4308": "17cc6a4ad82/u",
            "994e29811": "17cc6a4ad87/u",
            "7540t1773": "17cc6a4ad8b/u",
            "365zl2967": "17cc6a4ad8e/u",
            "441IbR654": "17cc6a4ad91/u",
            "813AdS947": "17cc6a4ad94/u",
            "996jA0195": "17cc6a4ad98/u",
            "304Cet146": "17cc6a4ad9d/u",
            "398AWk642": "17cc6a4ada0/u",
            "155otH362": "17cc6a4ada3/u",
            "3896ZO805": "17cc6a4ada6/u",
            "9990QV725": "17cc6a4ada9/u",
            "180rhS380": "17cc6a4adad/u",
            "2970cQ792": "17cc6a4adb0/u",
            "1726TM344": "17cc6a4adb3/u",
            "136tr3671": "17cc6a4adb6/u",
            "251ocI300": "17cc6a4adb8/u",
            "616Ofs331": "17cc6a4adbb/u",
            "2208D1502": "17cc6a4adbf/u",
            "8008PB638": "17cc6a4adc2/u",
            "119uak811": "17cc6a4adc4/u",
            "1140KM951": "17cc6a4adc7/u",
            "988DJs955": "17cc6a4adca/u",
            "770p06743": "17cc6a4adce/u",
            "358nfA607": "17cc6a4add2/u",
            "762p9N731": "17cc6a4add5/u",
            "868Yod154": "17cc6a4add9/u",
            "999IHp952": "17cc6a4addd/u",
            "164evX190": "17cc6a4ade0/u",
            "677eVE635": "17cc6a4ade4/u",
            "583bDd761": "17cc6a4ade7/u",
            "9483rF130": "17cc6a4adec/u",
            "230PWS487": "17cc6a4adf0/u",
            "617Ajy840": "17cc6a4adf3/u",
            "645BsM324": "17cc6a4adf6/u",
            "918O9z781": "17cc6a4adf9/u",
            "874YvW293": "17cc6a4adfc/u",
            "352UTI291": "17cc6a4adff/u",
            "923XqD475": "17cc6a4ae02/u",
            "667aFc224": "17cc6a4ae05/u",
            "6981B3333": "17cc6a4ae08/u",
            "590pr8268": "17cc6a4ae0c/u",
            "512P4D802": "17cc6a4ae0f/u",
            "134LbK422": "17cc6a4ae13/u",
            "583J3e522": "17cc6a4ae16/u",
            "527OkR302": "17cc6a4ae1a/u",
            "667CpH735": "17cc6a4ae1d/u",
            "661h1W581": "17cc6a4ae21/u",
            "714nPM353": "17cc6a4ae24/u",
            "3583MR353": "17cc6a4ae27/u",
            "254xLk847": "17cc6a4ae2a/u",
            "528cAj643": "17cc6a4ae2d/u",
            "800Hbf527": "17cc6a4ae30/u",
            "281wgC332": "17cc6a4ae33/u",
            "741hEI901": "17cc6a4ae36/u",
            "882rK2423": "17cc6a4ae39/u",
            "423xVQ828": "17cc6a4ae3c/u",
            "830Ysg846": "17cc6a4ae3f/u",
            "691sUy350": "17cc6a4ae42/u",
            "211FlE194": "17cc6a4ae45/u",
            "456US8400": "17cc6a4ae49/u",
            "862vrY361": "17cc6a4ae4b/u",
            "6871gc351": "17cc6a4ae4e/u",
            "538li7720": "17cc6a4ae51/u",
            "927LSi683": "17cc6a4ae57/u",
            "228Gs7238": "17cc6a4ae5a/u",
            "702I3M743": "17cc6a4ae5d/u",
            "909C5W570": "17cc6a4ae60/u",
            "729JAc820": "17cc6a4ae64/u",
            "443dZV947": "17cc6a4ae67/u",
            "7737xv644": "17cc6a4ae6b/u",
            "377vwx373": "17cc6a4ae6e/u",
            "5954UM392": "17cc6a4ae70/u",
            "390H09740": "17cc6a4ae73/u",
            "576ChW129": "17cc6a4ae77/u",
            "871fbl292": "17cc6a4ae7a/u",
            "450dzn146": "17cc6a4ae7d/u",
            "451ogh342": "17cc6a4ae80/u",
            "116nUf636": "17cc6a4ae83/u",
            "178d8Q274": "17cc6a4ae86/u",
            "173QqO423": "17cc6a4ae89/u",
            "913Vru221": "17cc6a4ae8c/u",
            "355Pvx525": "17cc6a4ae8f/u",
            "717Bgk473": "17cc6a4ae92/u",
            "801voc531": "17cc6a4ae95/u",
            "257DoK557": "17cc6a4ae98/u",
            "606ZAb889": "17cc6a4ae9c/u",
            "873QtV354": "17cc6a4ae9f/u",
            "785b1K554": "17cc6a4aea2/u",
            "145Ilp377": "17cc6a4aea5/u",
            "308QD1227": "17cc6a4aea8/u",
            "949AUt303": "17cc6a4aead/u",
            "696AMi786": "17cc6a4aeb0/u",
            "463RZu466": "17cc6a4aeb3/u",
            "264H1F892": "17cc6a4aeb7/u",
            "86280Q148": "17cc6a4aeba/u",
            "447XEo520": "17cc6a4aebd/u",
            "862iE2947": "17cc6a4aec0/u",
            "118ziG123": "17cc6a4aec3/u",
            "8528QV495": "17cc6a4aec6/u",
            "397tGF910": "17cc6a4aec9/u",
            "763QmX941": "17cc6a4aecd/u",
            "815yFq210": "17cc6a4aed0/u",
            "298l6E599": "17cc6a4aed2/u",
            "3792tx987": "17cc6a4aed6/u",
            "793ZbM689": "17cc6a4aed9/u",
            "892njA294": "17cc6a4aedc/u",
            "492hI9187": "17cc6a4aedf/u",
            "951czH123": "17cc6a4aee2/u",
            "9050d3194": "17cc6a4aee5/u",
            "5642mB989": "17cc6a4aee9/u",
            "326H3o700": "17cc6a4aeec/u",
            "324p1j992": "17cc6a4aeef/u",
            "176ywE385": "17cc6a4aef2/u",
            "276Gmb433": "17cc6a4aef5/u",
            "896ANn499": "17cc6a4aef8/u",
            "759bUT628": "17cc6a4aefb/u",
            "185X1K999": "17cc6a4aefe/u",
            "122gYU781": "17cc6a4af01/u",
            "190wae777": "17cc6a4af04/u",
            "657XSq984": "17cc6a4af07/u",
            "996o42978": "17cc6a4af0a/u",
            "148NwU172": "17cc6a4af0d/u",
            "195Ic2184": "17cc6a4af10/u",
            "1810s9530": "17cc6a4af13/u",
            "458SQ6852": "17cc6a4af17/u",
            "593sN2269": "17cc6a4af1a/u",
            "969h8w687": "17cc6a4af1d/u",
            "797RdB550": "17cc6a4af20/u",
            "183epm502": "17cc6a4af23/u",
            "444iKc806": "17cc6a4af26/u",
            "989xWc298": "17cc6a4af29/u",
            "188x9N652": "17cc6a4af2d/u",
            "445rvd497": "17cc6a4af30/u",
            "464YaI637": "17cc6a4af33/u",
            "885x4a311": "17cc6a4af35/u",
            "400bh0892": "17cc6a4af38/u",
            "656A5h508": "17cc6a4af3b/u",
            "457oxp685": "17cc6a4af3f/u",
            "164ZjS478": "17cc6a4af41/u",
            "524zUN666": "17cc6a4af44/u",
            "259Yrm452": "17cc6a4af47/u",
            "980tfx320": "17cc6a4af4a/u",
            "8165XR200": "17cc6a4af4d/u",
            "889aIi491": "17cc6a4af50/u",
            "710GuD837": "17cc6a4af53/u",
            "5395q4730": "17cc6a4af56/u",
            "293g68340": "17cc6a4af59/u",
            "908A29682": "17cc6a4af5c/u",
            "306M8u500": "17cc6a4af5f/u",
            "635lqN658": "17cc6a4af62/u",
            "149QVg919": "17cc6a4af65/u",
            "514ysY968": "17cc6a4af68/u",
            "339DKc529": "17cc6a4af6b/u",
            "356jVu846": "17cc6a4af6e/u",
            "362L5c118": "17cc6a4af72/u",
            "192fsQ420": "17cc6a4af75/u",
            "131Fe2940": "17cc6a4af78/u",
            "454g7K877": "17cc6a4af7b/u",
            "315nUl483": "17cc6a4af7f/u",
            "447kzO417": "17cc6a4af82/u",
            "269icJ615": "17cc6a4af85/u",
            "408b6s967": "17cc6a4af88/u",
            "309zAC270": "17cc6a4af8a/u",
            "738b85123": "17cc6a4af8d/u",
            "342tcj750": "17cc6a4af90/u",
            "2556z4810": "17cc6a4af93/u",
            "193QTc623": "17cc6a4af96/u",
            "954vZK833": "17cc6a4af9b/u",
            "434KYB170": "17cc6a4af9e/u",
            "873ANu735": "17cc6a4afa1/u",
            "181DUp508": "17cc6a4afa4/u",
            "363iEL232": "17cc6a4afa7/u",
            "631DYH677": "17cc6a4afaa/u",
            "332JRT910": "17cc6a4afad/u",
            "656ltU762": "17cc6a4afb0/u",
            "825ktE634": "17cc6a4afb4/u",
            "506dtB422": "17cc6a4afb7/u",
            "527qXL457": "17cc6a4afb9/u",
            "7102wV699": "17cc6a4afbb/u",
            "578Beb425": "17cc6a4afbe/u",
            "781b75346": "17cc6a4afc1/u",
            "712SVN269": "17cc6a4afc4/u",
            "918Upw291": "17cc6a4afc7/u",
            "562QCR232": "17cc6a4afc9/u",
            "9714H8394": "17cc6a4afcc/u",
            "618chw784": "17cc6a4afce/u",
            "8756eu396": "17cc6a4afd0/u",
            "268WP9323": "17cc6a4afd3/u",
            "627Jyg901": "17cc6a4afd5/u",
            "593cRm807": "17cc6a4afd7/u",
            "5264gF959": "17cc6a4afda/u",
            "747gWL513": "17cc6a4afdc/u",
            "195UGx898": "17cc6a4afdf/u",
            "805ZKN599": "17cc6a4afe1/u",
            "3141Xp568": "17cc6a4afe4/u",
            "137yIS440": "17cc6a4afe6/u",
            "293ohf501": "17cc6a4afe9/u",
            "448GoE488": "17cc6a4afeb/u",
            "301Gtq710": "17cc6a4afed/u",
            "1365hC657": "17cc6a4afef/u",
            "455gvC608": "17cc6a4aff1/u",
            "245mXF849": "17cc6a4aff4/u",
            "9238Wa849": "17cc6a4aff7/u",
            "306RuG182": "17cc6a4affa/u",
            "570Q3Y513": "17cc6a4affd/u",
            "525MnR524": "17cc6a4b000/u",
            "283NX2498": "17cc6a4b003/u",
            "637NnY527": "17cc6a4b007/u",
            "113AWg276": "17cc6a4b00a/u",
            "668G8U990": "17cc6a4b00c/u",
            "323xJl244": "17cc6a4b00f/u",
            "158usC240": "17cc6a4b011/u",
            "499wu7294": "17cc6a4b014/u",
            "668z4b402": "17cc6a4b017/u",
            "573sui558": "17cc6a4b01a/u",
            "272QH4759": "17cc6a4b01c/u",
            "221Fj9890": "17cc6a4b01e/u",
            "2550l9515": "17cc6a4b021/u",
            "233NA4644": "17cc6a4b023/u",
            "381iWE888": "17cc6a4b026/u",
            "431ITD920": "17cc6a4b028/u",
            "61069x780": "17cc6a4b02a/u",
            "4152lC504": "17cc6a4b02c/u",
            "121Ko5656": "17cc6a4b02e/u",
            "774F0s648": "17cc6a4b030/u",
            "483aF2367": "17cc6a4b032/u",
            "894b6v813": "17cc6a4b034/u",
            "581Uon858": "17cc6a4b037/u",
            "362nCi689": "17cc6a4b03a/u",
            "525Y9k891": "17cc6a4b03c/u",
            "995P40149": "17cc6a4b03e/u",
            "322aiD975": "17cc6a4b040/u",
            "739BeA983": "17cc6a4b042/u",
            "7014mG872": "17cc6a4b044/u",
            "652R7c793": "17cc6a4b046/u",
            "723Qf3991": "17cc6a4b049/u",
            "6224Vq112": "17cc6a4b04b/u",
            "5547ER930": "17cc6a4b04d/u",
            "964ocN620": "17cc6a4b04f/u",
            "677yh2752": "17cc6a4b051/u",
            "965LYO572": "17cc6a4b053/u",
            "368sSi382": "17cc6a4b055/u",
            "819cMY461": "17cc6a4b058/u",
            "525cBe359": "17cc6a4b05a/u",
            "984sel126": "17cc6a4b05d/u",
            "636AOl380": "17cc6a4b05f/u",
            "179ygK489": "17cc6a4b061/u",
            "165T8t561": "17cc6a4b063/u",
            "232D5t929": "17cc6a4b065/u",
            "778uBG682": "17cc6a4b067/u",
            "162Jnh626": "17cc6a4b06a/u",
            "197Z8A545": "17cc6a4b06c/u",
            "160lFw347": "17cc6a4b06e/u",
            "564UhZ523": "17cc6a4b071/u",
            "335O5E583": "17cc6a4b073/u",
            "723E5X314": "17cc6a4b075/u",
            "692L05199": "17cc6a4b077/u",
            "38023c619": "17cc6a4b07a/u",
            "287yfY310": "17cc6a4b07c/u",
            "933wYK972": "17cc6a4b07e/u",
            "6650Tg911": "17cc6a4b081/u",
            "3077k6200": "17cc6a4b083/u",
            "958XVj186": "17cc6a4b085/u",
            "5476Qb159": "17cc6a4b087/u",
            "559WS4286": "17cc6a4b08b/u",
            "1704fe350": "17cc6a4b08e/u",
            "761gVS427": "17cc6a4b091/u",
            "243nCY286": "17cc6a4b094/u",
            "6234lJ252": "17cc6a4b097/u",
            "184VKp884": "17cc6a4b099/u",
            "405wqK594": "17cc6a4b09c/u",
            "866OG9158": "17cc6a4b09e/u",
            "801jY4484": "17cc6a4b0a0/u",
            "498mwF655": "17cc6a4b0a2/u",
            "371o0L335": "17cc6a4b0a4/u",
            "987zXK654": "17cc6a4b0a6/u",
            "793lHZ628": "17cc6a4b0a8/u",
            "863sXm629": "17cc6a4b0aa/u",
            "230qJC507": "17cc6a4b0ad/u",
            "196xXG582": "17cc6a4b0af/u",
            "519SxR920": "17cc6a4b0b1/u",
            "3690N9377": "17cc6a4b0b3/u",
            "508nl3494": "17cc6a4b0b5/u",
            "611cS8485": "17cc6a4b0b7/u",
            "164mQy696": "17cc6a4b0b9/u",
            "17942G780": "17cc6a4b0bb/u",
            "116ECk485": "17cc6a4b0bd/u",
            "364XwP847": "17cc6a4b0c0/u",
            "950mvR896": "17cc6a4b0c2/u",
            "606x1b496": "17cc6a4b0c4/u",
            "283pO3222": "17cc6a4b0c6/u",
            "605ebQ874": "17cc6a4b0c8/u",
            "970JvC195": "17cc6a4b0cb/u",
            "891mhK139": "17cc6a4b0ce/u",
            "481efC940": "17cc6a4b0d0/u",
            "900Umv151": "17cc6a4b0d2/u",
            "774Yom200": "17cc6a4b0d4/u",
            "585ORB269": "17cc6a4b0d6/u",
            "930ipo843": "17cc6a4b0d8/u",
            "170Sjx806": "17cc6a4b0da/u",
            "304EsZ350": "17cc6a4b0dd/u",
            "174slx189": "17cc6a4b0df/u",
            "35776Z569": "17cc6a4b0e1/u",
            "959KZr923": "17cc6a4b0e3/u",
            "159suV590": "17cc6a4b0e5/u",
            "545Bng230": "17cc6a4b0e7/u",
            "697Z1F189": "17cc6a4b0e9/u",
            "334HNv203": "17cc6a4b0eb/u",
            "144hpV342": "17cc6a4b0ee/u",
            "166v23621": "17cc6a4b0f0/u",
            "552mBX342": "17cc6a4b0f2/u",
            "174ehR802": "17cc6a4b0f4/u",
            "306Od9131": "17cc6a4b0f6/u",
            "79012L187": "17cc6a4b0f8/u",
            "805T3o421": "17cc6a4b0fa/u",
            "898DFk480": "17cc6a4b0fc/u",
            "529i3N696": "17cc6a4b0ff/u",
            "930pRY311": "17cc6a4b101/u",
            "615gAk359": "17cc6a4b103/u",
            "171s83195": "17cc6a4b105/u",
            "204l6t325": "17cc6a4b107/u",
            "404RD8907": "17cc6a4b109/u",
            "990yC4411": "17cc6a4b10b/u",
            "918UGV747": "17cc6a4b10d/u",
            "553yJE664": "17cc6a4b110/u",
            "435KOa599": "17cc6a4b112/u",
            "968fvr327": "17cc6a4b114/u",
            "852V4N770": "17cc6a4b116/u",
            "655HWX940": "17cc6a4b118/u",
            "703n5i771": "17cc6a4b11a/u",
            "393B9N869": "17cc6a4b11c/u",
            "447OUa695": "17cc6a4b11e/u",
            "880tUL863": "17cc6a4b121/u",
            "700CpV664": "17cc6a4b123/u",
            "140P2p477": "17cc6a4b125/u",
            "130UhH336": "17cc6a4b127/u",
            "217AsK538": "17cc6a4b129/u",
            "877DoZ943": "17cc6a4b12b/u",
            "845e0W563": "17cc6a4b12d/u",
            "9211Lz585": "17cc6a4b12f/u",
            "898CMV456": "17cc6a4b132/u",
            "367MyC153": "17cc6a4b134/u",
            "282pSx303": "17cc6a4b136/u",
            "239bo3668": "17cc6a4b138/u",
            "877Qxb420": "17cc6a4c82a/u",
            "574Qc8148": "17cc6a4c82e/u",
            "656yQf799": "17cc6a4c831/u",
            "938YhP487": "17cc6a4c835/u",
            "597Lvg601": "17cc6a4c838/u",
            "6686mN838": "17cc6a4c83b/u",
            "570GIy476": "17cc6a4c83e/u",
            "858uxc394": "17cc6a4c841/u",
            "181aIr269": "17cc6a4c844/u",
            "148iTh197": "17cc6a4c847/u",
            "383kJh977": "17cc6a4c84a/u",
            "169BgP450": "17cc6a4c84d/u",
            "879AVH792": "17cc6a4c851/u",
            "909jWC387": "17cc6a4c853/u",
            "325F54225": "17cc6a4c856/u",
            "234dy6160": "17cc6a4c858/u",
            "329Gq8922": "17cc6a4c85a/u",
            "431TmF870": "17cc6a4c85c/u",
            "8505Bu196": "17cc6a4c85f/u",
            "197kAd254": "17cc6a4c862/u",
            "862Jdj759": "17cc6a4c864/u",
            "792GdY116": "17cc6a4c866/u",
            "598IkW219": "17cc6a4c868/u",
            "631B4j713": "17cc6a4c86b/u",
            "176UR6596": "17cc6a4c86d/u",
            "280dcg620": "17cc6a4c870/u",
            "205z5p898": "17cc6a4c872/u",
            "292fOo325": "17cc6a4c874/u",
            "773lHO376": "17cc6a4c876/u",
            "857b8o942": "17cc6a4c878/u",
            "925L3X958": "17cc6a4c87a/u",
            "652d46421": "17cc6a4c87c/u",
            "7445de678": "17cc6a4c880/u",
            "833emC741": "17cc6a4c882/u",
            "114GkO627": "17cc6a4c885/u",
            "640Qlp538": "17cc6a4c887/u",
            "570g4A737": "17cc6a4c88a/u",
            "456TjS822": "17cc6a4c88d/u",
            "7599fh172": "17cc6a4c891/u",
            "405wfv229": "17cc6a4c894/u",
            "627yg5195": "17cc6a4c897/u",
            "262YL8145": "17cc6a4c89a/u",
            "628Idf694": "17cc6a4c89d/u",
            "618Wm0315": "17cc6a4c8a1/u",
            "550MS7482": "17cc6a4c8a4/u",
            "523hTG299": "17cc6a4c8a7/u",
            "550Il9740": "17cc6a4c8aa/u",
            "846MfQ809": "17cc6a4c8ad/u",
            "924G32490": "17cc6a4c8b0/u",
            "880Svq488": "17cc6a4c8b3/u",
            "451pu9343": "17cc6a4c8b6/u",
            "692V2A796": "17cc6a4c8b9/u",
            "171thX724": "17cc6a4c8bc/u",
            "263Qqt922": "17cc6a4c8bf/u",
            "132qlK791": "17cc6a4c8c2/u",
            "409aJY929": "17cc6a4c8c5/u",
            "4900wt653": "17cc6a4c8c8/u",
            "430duU609": "17cc6a4c8cb/u",
            "286Pj0476": "17cc6a4c8ce/u",
            "115RfP661": "17cc6a4c8d1/u",
            "927cRd114": "17cc6a4c8d4/u",
            "918oiX684": "17cc6a4c8d7/u",
            "6394Zw625": "17cc6a4c8d9/u",
            "189Owu222": "17cc6a4c8dc/u",
            "367IMj840": "17cc6a4c8df/u",
            "254OfK226": "17cc6a4c8e2/u",
            "945e5k167": "17cc6a4c8e5/u",
            "903yZp577": "17cc6a4c8e8/u",
            "520IR9598": "17cc6a4c8ea/u",
            "172iW7267": "17cc6a4c8ed/u",
            "3027vX116": "17cc6a4c8f0/u",
            "534Nma905": "17cc6a4c8f3/u",
            "227kah563": "17cc6a4c8f6/u",
            "450GPB163": "17cc6a4c8f9/u",
            "159avp224": "17cc6a4c8fc/u",
            "191jYq739": "17cc6a4c8ff/u",
            "590vLQ523": "17cc6a4c902/u",
            "158g2l521": "17cc6a4c905/u",
            "180eED919": "17cc6a4c908/u",
            "321wDx753": "17cc6a4c90b/u",
            "793BvR620": "17cc6a4c90e/u",
            "4046xY771": "17cc6a4c911/u",
            "394mhK922": "17cc6a4c914/u",
            "2827Pa926": "17cc6a4c917/u",
            "804lwj636": "17cc6a4c91a/u",
            "816wd8651": "17cc6a4c91d/u",
            "7211bz426": "17cc6a4c920/u",
            "516DAn921": "17cc6a4c923/u",
            "802j1Y254": "17cc6a4c927/u",
            "986JF3535": "17cc6a4c92a/u",
            "590xyg974": "17cc6a4c92d/u",
            "7365S8425": "17cc6a4c930/u",
            "906Q7d646": "17cc6a4c933/u",
            "715qMT206": "17cc6a4c936/u",
            "810nRu158": "17cc6a4c93a/u",
            "260pmC422": "17cc6a4c93d/u",
            "896ozs785": "17cc6a4c93f/u",
            "903g8j852": "17cc6a4c942/u",
            "951gT9982": "17cc6a4c945/u",
            "435leO606": "17cc6a4c949/u",
            "547KBz867": "17cc6a4c94c/u",
            "487zV3563": "17cc6a4c94e/u",
            "427ZqU246": "17cc6a4c951/u",
            "598s4e947": "17cc6a4c954/u",
            "459DLd364": "17cc6a4c957/u",
            "950oOs703": "17cc6a4c95a/u",
            "7471Lq244": "17cc6a4c95d/u",
            "351ZFh397": "17cc6a4c960/u",
            "43808w235": "17cc6a4c963/u",
            "684KeN845": "17cc6a4c966/u",
            "134x8j333": "17cc6a4c969/u",
            "915Vj4900": "17cc6a4c96c/u",
            "389LI6786": "17cc6a4c96f/u",
            "379gY4955": "17cc6a4c972/u",
            "165aDP290": "17cc6a4c974/u",
            "5397uD842": "17cc6a4c977/u",
            "549Ay6297": "17cc6a4c97b/u",
            "874uTS968": "17cc6a4c97d/u",
            "170lTe796": "17cc6a4c980/u",
            "533ztT221": "17cc6a4c983/u",
            "930JLT474": "17cc6a4c986/u",
            "317Q8r321": "17cc6a4c989/u",
            "368J9U505": "17cc6a4c98c/u",
            "645PDq975": "17cc6a4c98f/u",
            "543ckr260": "17cc6a4c992/u",
            "8821TS245": "17cc6a4c994/u",
            "252DCJ324": "17cc6a4c997/u",
            "404gsL199": "17cc6a4c99a/u",
            "334cDs673": "17cc6a4c99e/u",
            "685RWx538": "17cc6a4c9a1/u",
            "289WQ4956": "17cc6a4c9a3/u",
            "737ge8827": "17cc6a4c9a6/u",
            "542pdo944": "17cc6a4c9a9/u",
            "330S2s615": "17cc6a4c9ac/u",
            "673y0i886": "17cc6a4c9af/u",
            "698oMF376": "17cc6a4c9b3/u",
            "468I07303": "17cc6a4c9b6/u",
            "871rfg351": "17cc6a4c9b9/u",
            "960wOf388": "17cc6a4c9bc/u",
            "391IBN818": "17cc6a4c9bf/u",
            "428KVT905": "17cc6a4c9c2/u",
            "8681Wz499": "17cc6a4c9c6/u",
            "2350Zp505": "17cc6a4c9c9/u",
            "999faH316": "17cc6a4c9cc/u",
            "358JLQ921": "17cc6a4c9cf/u",
            "933PGn767": "17cc6a4c9d2/u",
            "911DuT962": "17cc6a4c9d5/u",
            "778NHB855": "17cc6a4c9d8/u",
            "359krp979": "17cc6a4c9db/u",
            "714j4C885": "17cc6a4c9df/u",
            "243GcA332": "17cc6a4c9e2/u",
            "858v15312": "17cc6a4c9e4/u",
            "695IGo272": "17cc6a4c9e7/u",
            "145UDq912": "17cc6a4c9ea/u",
            "426WhL887": "17cc6a4c9ed/u",
            "339oR3764": "17cc6a4c9f0/u",
            "443EDq915": "17cc6a4c9f3/u",
            "32931E620": "17cc6a4c9f5/u",
            "695K9r408": "17cc6a4c9f8/u",
            "364KFV809": "17cc6a4c9fb/u",
            "740OgR503": "17cc6a4c9fe/u",
            "589cTD472": "17cc6a4ca01/u",
            "839vag290": "17cc6a4ca04/u",
            "919Otq783": "17cc6a4ca06/u",
            "300dh2334": "17cc6a4ca09/u",
            "472Wlq950": "17cc6a4ca0c/u",
            "827ZON665": "17cc6a4ca0f/u",
            "926Le0597": "17cc6a4ca12/u",
            "218bGX583": "17cc6a4ca15/u",
            "8071Jp803": "17cc6a4ca18/u",
            "691Jxj893": "17cc6a4ca1a/u",
            "919sLY319": "17cc6a4ca1d/u",
            "244Aky503": "17cc6a4ca20/u",
            "903tPD372": "17cc6a4ca23/u",
            "614gsP650": "17cc6a4ca25/u",
            "179CDX749": "17cc6a4ca27/u",
            "154Wvx601": "17cc6a4ca29/u",
            "744xEi437": "17cc6a4ca2b/u",
            "6915Aq320": "17cc6a4ca2e/u",
            "967yp4668": "17cc6a4ca31/u",
            "7666XG572": "17cc6a4ca33/u",
            "9013mx481": "17cc6a4ca36/u",
            "789DvK204": "17cc6a4ca39/u",
            "655YBO485": "17cc6a4ca3b/u",
            "200zwi793": "17cc6a4ca3e/u",
            "7304Yd906": "17cc6a4ca41/u",
            "898vC4859": "17cc6a4ca44/u",
            "783cJI322": "17cc6a4ca47/u",
            "424yxh753": "17cc6a4ca4a/u",
            "909FP2916": "17cc6a4ca4d/u",
            "949FXh323": "17cc6a4ca4f/u",
            "677InM824": "17cc6a4ca53/u",
            "767nWL111": "17cc6a4ca55/u",
            "203tHT354": "17cc6a4ca58/u",
            "173qHT585": "17cc6a4ca5b/u",
            "9765J2335": "17cc6a4ca5e/u",
            "416PSZ133": "17cc6a4ca61/u",
            "227bOR945": "17cc6a4ca64/u",
            "686sp9213": "17cc6a4ca67/u",
            "381PmN660": "17cc6a4ca69/u",
            "745zcQ376": "17cc6a4ca6b/u",
            "290jxt415": "17cc6a4ca6d/u",
            "2370qb113": "17cc6a4ca6f/u",
            "298SCD892": "17cc6a4ca72/u",
            "403c8k434": "17cc6a4ca74/u",
            "631WLi820": "17cc6a4ca77/u",
            "737f14295": "17cc6a4ca79/u",
            "503pnA817": "17cc6a4ca7b/u",
            "689aXO627": "17cc6a4ca7e/u",
            "116Icm564": "17cc6a4ca80/u",
            "359ycV327": "17cc6a4ca82/u",
            "985XPa292": "17cc6a4ca85/u",
            "394GjK885": "17cc6a4ca87/u",
            "412kIY703": "17cc6a4ca89/u",
            "645skS520": "17cc6a4ca8b/u",
            "859raI161": "17cc6a4ca8d/u",
            "602ITn233": "17cc6a4ca90/u",
            "178hPr860": "17cc6a4ca92/u",
            "9354o6538": "17cc6a4ca94/u",
            "640Xg7492": "17cc6a4ca97/u",
            "958p4u598": "17cc6a4ca99/u",
            "417gCK503": "17cc6a4ca9b/u",
            "143cTi827": "17cc6a4ca9d/u",
            "785QnB699": "17cc6a4caa0/u",
            "498jhX573": "17cc6a4caa2/u",
            "357M5B373": "17cc6a4caa4/u",
            "790TzR170": "17cc6a4caa6/u",
            "116OJK160": "17cc6a4caa9/u",
            "663pIz605": "17cc6a4caab/u",
            "768gpR184": "17cc6a4caad/u",
            "987PDe918": "17cc6a4caaf/u",
            "171KrH847": "17cc6a4cab1/u",
            "521N9G825": "17cc6a4cab3/u",
            "741swG762": "17cc6a4cab6/u",
            "399CM8342": "17cc6a4cab8/u",
            "168RGz775": "17cc6a4caba/u",
            "523ZHY762": "17cc6a4cabc/u",
            "199sMJ546": "17cc6a4cabe/u",
            "592yoL545": "17cc6a4cac0/u",
            "634pEb618": "17cc6a4cac3/u",
            "469lOH854": "17cc6a4cac5/u",
            "429MhI330": "17cc6a4cac8/u",
            "933MpQ531": "17cc6a4caca/u",
            "477iuQ832": "17cc6a4cacc/u",
            "603cCS692": "17cc6a4cace/u",
            "770zdG787": "17cc6a4cad1/u",
            "428xVG123": "17cc6a4cad3/u",
            "904Qyb892": "17cc6a4cad5/u",
            "406pB6555": "17cc6a4cad8/u",
            "20424G580": "17cc6a4cadb/u",
            "641esU873": "17cc6a4cade/u",
            "120ZyN472": "17cc6a4cae0/u",
            "665MQL948": "17cc6a4cae3/u",
            "143x3X283": "17cc6a4cae5/u",
            "597ZAf234": "17cc6a4cae7/u",
            "567W84878": "17cc6a4cae9/u",
            "2328kM770": "17cc6a4caec/u",
            "264TGw275": "17cc6a4caee/u",
            "242CzQ145": "17cc6a4caef/u",
            "647wKB579": "17cc6a4caf1/u",
            "224czN948": "17cc6a4caf3/u",
            "303U6k852": "17cc6a4caf5/u",
            "420oz8209": "17cc6a4caf7/u",
            "499I2T428": "17cc6a4cafa/u",
            "591lIB959": "17cc6a4cafc/u",
            "289XAU564": "17cc6a4cafe/u",
            "638WTd692": "17cc6a4cb00/u",
            "338kYs890": "17cc6a4cb02/u",
            "351Kt0164": "17cc6a4cb04/u",
            "5174cl509": "17cc6a4cb06/u",
            "253Vpq991": "17cc6a4cb08/u",
            "671zIf864": "17cc6a4cb0a/u",
            "998khD617": "17cc6a4cb0d/u",
            "284Did730": "17cc6a4cb0f/u",
            "757vH6993": "17cc6a4cb11/u",
            "707xa6533": "17cc6a4cb13/u",
            "135v6N407": "17cc6a4cb15/u",
            "570ZoD779": "17cc6a4cb17/u",
            "9849iP604": "17cc6a4cb1a/u",
            "540O5t991": "17cc6a4cb1d/u",
            "8627Fn442": "17cc6a4cb1f/u",
            "421vhI287": "17cc6a4cb21/u",
            "670mQR811": "17cc6a4cb23/u",
            "169S1z555": "17cc6a4cb25/u",
            "220vTB235": "17cc6a4cb27/u",
            "822QiL537": "17cc6a4cb2a/u",
            "150uIL555": "17cc6a4cb2c/u",
            "579Pph829": "17cc6a4cb2f/u",
            "432b1D634": "17cc6a4cb31/u",
            "771n2l935": "17cc6a4cb33/u",
            "9857Ny148": "17cc6a4cb35/u",
            "324zvf309": "17cc6a4cb37/u",
            "842d9m402": "17cc6a4cb3a/u",
            "894oRz358": "17cc6a4cb3c/u",
            "94734p476": "17cc6a4cb3e/u",
            "98315E333": "17cc6a4cb40/u",
            "366rL1737": "17cc6a4cb42/u",
            "412Xdw374": "17cc6a4cb44/u",
            "230blW936": "17cc6a4cb46/u",
            "984JPk522": "17cc6a4cb48/u",
            "825gQE935": "17cc6a4cb4a/u",
            "890mUC533": "17cc6a4cb4d/u",
            "938WOZ716": "17cc6a4cb4f/u",
            "588viR330": "17cc6a4cb51/u",
            "8199Qc282": "17cc6a4cb53/u",
            "5558Fm280": "17cc6a4cb55/u",
            "534iDx353": "17cc6a4cb57/u",
            "4994WI841": "17cc6a4cb59/u",
            "344YDc224": "17cc6a4cb5b/u",
            "399yBc813": "17cc6a4cb5d/u",
            "6808Jh483": "17cc6a4cb5f/u",
            "191Fs8174": "17cc6a4cb61/u",
            "249WG8507": "17cc6a4cb64/u",
            "474l2z581": "17cc6a4cb66/u",
            "4473K0251": "17cc6a4cb68/u",
            "493buU257": "17cc6a4cb6a/u",
            "278jIp752": "17cc6a4cb6c/u",
            "77865i314": "17cc6a4cb6e/u",
            "941GOd222": "17cc6a4cb70/u",
            "129FUz339": "17cc6a4cb72/u",
            "238zNV975": "17cc6a4cb74/u",
            "217ErJ877": "17cc6a4cb76/u",
            "915Pdt771": "17cc6a4cb79/u",
            "642X89910": "17cc6a4cb7b/u",
            "396vZl969": "17cc6a4cb7d/u",
            "371pu4600": "17cc6a4cb80/u",
            "2181fK364": "17cc6a4cb82/u",
            "838hkt724": "17cc6a4cb84/u",
            "2629Vd664": "17cc6a4cb86/u",
            "735XLu892": "17cc6a4dbb5/u",
            "209NLR283": "17cc6a4dbb8/u",
            "364hd6112": "17cc6a4dbbc/u",
            "169DBn804": "17cc6a4dbbf/u",
            "623Uxc849": "17cc6a4dbc2/u",
            "792IbD721": "17cc6a4dbc5/u",
            "2765S2982": "17cc6a4dbc9/u",
            "413jbM370": "17cc6a4dbcc/u",
            "411HbU347": "17cc6a4dbcf/u",
            "855O8K183": "17cc6a4dbd2/u",
            "355h61584": "17cc6a4dbd5/u",
            "484a0z880": "17cc6a4dbd8/u",
            "294X7G377": "17cc6a4dbdb/u",
            "825u2o787": "17cc6a4dbdd/u",
            "243Cov162": "17cc6a4dbe0/u",
            "144a9N183": "17cc6a4dbe2/u",
            "346RJi670": "17cc6a4dbe5/u",
            "444Hmw794": "17cc6a4dbe8/u",
            "190hvV960": "17cc6a4dbeb/u",
            "935TYS767": "17cc6a4dbed/u",
            "179du2929": "17cc6a4dbef/u",
            "772cK3519": "17cc6a4dbf2/u",
            "769XeQ424": "17cc6a4dbf4/u",
            "449NCv610": "17cc6a4dbf6/u",
            "164mfz718": "17cc6a4dbf9/u",
            "280YmB999": "17cc6a4dbfb/u",
            "229XPw858": "17cc6a4dbfd/u",
            "5237qu577": "17cc6a4dbff/u",
            "646xjZ160": "17cc6a4dc01/u",
            "830qI6947": "17cc6a4dc03/u",
            "252yqQ758": "17cc6a4dc05/u",
            "914ziJ686": "17cc6a4dc08/u",
            "848Aw6891": "17cc6a4dc0b/u",
            "122x2F987": "17cc6a4dc0e/u",
            "358xP1801": "17cc6a4dc11/u",
            "405rLB112": "17cc6a4dc14/u",
            "129BRp192": "17cc6a4dc16/u",
            "675Dah580": "17cc6a4dc1a/u",
            "479THG752": "17cc6a4dc1c/u",
            "177t2F297": "17cc6a4dc1f/u",
            "310CuK969": "17cc6a4dc22/u",
            "1426Ma328": "17cc6a4dc25/u",
            "838WNC449": "17cc6a4dc28/u",
            "815FYE539": "17cc6a4dc2b/u",
            "650kDA680": "17cc6a4dc2e/u",
            "573zBO195": "17cc6a4dc31/u",
            "553Du2452": "17cc6a4dc33/u",
            "942EQn671": "17cc6a4dc36/u",
            "961YeD534": "17cc6a4dc39/u",
            "911kut289": "17cc6a4dc3c/u",
            "730VuK791": "17cc6a4dc3e/u",
            "925wQ6869": "17cc6a4dc40/u",
            "348UC7453": "17cc6a4dc43/u",
            "727fdw667": "17cc6a4dc45/u",
            "499wZj677": "17cc6a4dc47/u",
            "924IeG951": "17cc6a4dc4a/u",
            "285S7N692": "17cc6a4dc4d/u",
            "560SnT831": "17cc6a4dc4f/u",
            "552kyE644": "17cc6a4dc51/u",
            "4835nF138": "17cc6a4dc53/u",
            "937Ghu910": "17cc6a4dc55/u",
            "609v7d339": "17cc6a4dc58/u",
            "531qzW761": "17cc6a4dc5a/u",
            "587OLg346": "17cc6a4dc5d/u",
            "674q6n697": "17cc6a4dc5f/u",
            "3509Ad483": "17cc6a4dc61/u",
            "939LmR339": "17cc6a4dc63/u",
            "151LMj337": "17cc6a4dc66/u",
            "436FyW300": "17cc6a4dc69/u",
            "1137aU823": "17cc6a4dc6c/u",
            "708Z9i638": "17cc6a4dc6f/u",
            "997x28229": "17cc6a4dc73/u",
            "5363cC893": "17cc6a4dc76/u",
            "734vyV392": "17cc6a4dc79/u",
            "741e1J509": "17cc6a4dc7c/u",
            "277a2P207": "17cc6a4dc7f/u",
            "302kOR339": "17cc6a4dc83/u",
            "886pCM724": "17cc6a4dc86/u",
            "176Ou4968": "17cc6a4dc89/u",
            "845IQc900": "17cc6a4dc8c/u",
            "288pWs402": "17cc6a4dc8f/u",
            "863KFY434": "17cc6a4dc92/u",
            "615sTL413": "17cc6a4dc95/u",
            "5187fz337": "17cc6a4dc98/u",
            "851q7s853": "17cc6a4dc9b/u",
            "529FLU850": "17cc6a4dc9e/u",
            "890VLm628": "17cc6a4dca1/u",
            "570irJ546": "17cc6a4dca4/u",
            "305Y5q797": "17cc6a4dca7/u",
            "114uQm750": "17cc6a4dcaa/u",
            "775atA703": "17cc6a4dcad/u",
            "179Y8h945": "17cc6a4dcb0/u",
            "743RbW876": "17cc6a4dcb3/u",
            "793SWF142": "17cc6a4dcb6/u",
            "28261T407": "17cc6a4dcb8/u",
            "359JpA293": "17cc6a4dcbb/u",
            "119B8S974": "17cc6a4dcbe/u",
            "9839o5437": "17cc6a4dcc1/u",
            "773pgw654": "17cc6a4dcc4/u",
            "6637YD185": "17cc6a4dcc7/u",
            "353VTN596": "17cc6a4dcca/u",
            "793voF578": "17cc6a4dccd/u",
            "601NV9322": "17cc6a4dcd0/u",
            "6549Zs766": "17cc6a4dcd3/u",
            "6773ZO672": "17cc6a4dcd7/u",
            "746PvO626": "17cc6a4dcda/u",
            "362y8Q757": "17cc6a4dcdd/u",
            "200qAx226": "17cc6a4dce0/u",
            "240Ao7374": "17cc6a4dce3/u",
            "707Zlp428": "17cc6a4dce6/u",
            "3212LX206": "17cc6a4dce9/u",
            "122Aay714": "17cc6a4dcec/u",
            "284tZW155": "17cc6a4dcef/u",
            "829XqO360": "17cc6a4dcf2/u",
            "936L9Z272": "17cc6a4dcf5/u",
            "977esK307": "17cc6a4dcf8/u",
            "718G4y743": "17cc6a4dcfb/u",
            "440MqE937": "17cc6a4dcfe/u",
            "147tqC245": "17cc6a4dd01/u",
            "927bcD531": "17cc6a4dd04/u",
            "563RQN224": "17cc6a4dd07/u",
            "951uVC705": "17cc6a4dd0a/u",
            "893wV9766": "17cc6a4dd0d/u",
            "485EAc755": "17cc6a4dd10/u",
            "9731ZN391": "17cc6a4dd13/u",
            "522ln0546": "17cc6a4dd16/u",
            "350tXk591": "17cc6a4dd19/u",
            "443XBx111": "17cc6a4dd1c/u",
            "378KMv860": "17cc6a4dd1f/u",
            "978byK910": "17cc6a4dd22/u",
            "970cIO433": "17cc6a4dd25/u",
            "977jxy757": "17cc6a4dd28/u",
            "685Klm521": "17cc6a4dd2b/u",
            "346ULH391": "17cc6a4dd2e/u",
            "139ia6287": "17cc6a4dd31/u",
            "207NGI229": "17cc6a4dd34/u",
            "5579tg144": "17cc6a4dd37/u",
            "309qiW792": "17cc6a4dd3a/u",
            "5281qH466": "17cc6a4dd3d/u",
            "486Wri645": "17cc6a4dd40/u",
            "553Edu211": "17cc6a4dd43/u",
            "714v2Q645": "17cc6a4dd46/u",
            "5411hw147": "17cc6a4dd49/u",
            "924Gbs508": "17cc6a4dd4b/u",
            "422yYQ596": "17cc6a4dd4e/u",
            "696pdt413": "17cc6a4dd51/u",
            "609piA992": "17cc6a4dd55/u",
            "345dFV696": "17cc6a4dd58/u",
            "722PDp462": "17cc6a4dd5b/u",
            "850pzN269": "17cc6a4dd5e/u",
            "155VI5278": "17cc6a4dd61/u",
            "861pPF245": "17cc6a4dd64/u",
            "651Cmw243": "17cc6a4dd67/u",
            "151qyO609": "17cc6a4dd6a/u",
            "195ueX308": "17cc6a4dd6d/u",
            "307JpQ615": "17cc6a4dd70/u",
            "890nRo870": "17cc6a4dd72/u",
            "904ODN832": "17cc6a4dd75/u",
            "476nMW588": "17cc6a4dd78/u",
            "517yV4878": "17cc6a4dd7b/u",
            "150OdV576": "17cc6a4dd7e/u",
            "462Npl970": "17cc6a4dd81/u",
            "622mjs199": "17cc6a4dd84/u",
            "566TuZ496": "17cc6a4dd87/u",
            "610N3g440": "17cc6a4dd8a/u",
            "265qBt366": "17cc6a4dd8d/u",
            "5828M7790": "17cc6a4dd90/u",
            "220wDC754": "17cc6a4dd93/u",
            "631MF6519": "17cc6a4dd97/u",
            "3330W9346": "17cc6a4dd9a/u",
            "3259AG768": "17cc6a4dd9d/u",
            "375udz348": "17cc6a4dda0/u",
            "168nFZ472": "17cc6a4dda3/u",
            "614Per883": "17cc6a4dda9/u",
            "872Xc7197": "17cc6a4ddac/u",
            "861Lj0312": "17cc6a4ddaf/u",
            "610dWY817": "17cc6a4ddb2/u",
            "314daR204": "17cc6a4ddb5/u",
            "6023Jk433": "17cc6a4ddb8/u",
            "139Gbk210": "17cc6a4ddbc/u",
            "729wHk907": "17cc6a4ddbf/u",
            "161qEV912": "17cc6a4ddc2/u",
            "5045hl153": "17cc6a4ddc5/u",
            "319yb2929": "17cc6a4ddc8/u",
            "243AVs465": "17cc6a4ddcc/u",
            "736H37803": "17cc6a4ddce/u",
            "8268wl439": "17cc6a4ddd1/u",
            "582tax458": "17cc6a4ddd4/u",
            "381QC3841": "17cc6a4ddd7/u",
            "254wBD556": "17cc6a4ddda/u",
            "930GQu939": "17cc6a4dddd/u",
            "729e7R471": "17cc6a4dde0/u",
            "684hKa747": "17cc6a4dde3/u",
            "305qbc699": "17cc6a4dde6/u",
            "907LmO150": "17cc6a4dde9/u",
            "990lus730": "17cc6a4ddec/u",
            "314But696": "17cc6a4ddef/u",
            "379M82932": "17cc6a4ddf2/u",
            "6059VZ595": "17cc6a4ddf4/u",
            "512eSu482": "17cc6a4ddf7/u",
            "876av2931": "17cc6a4ddfa/u",
            "691OWE920": "17cc6a4ddfd/u",
            "3222zn895": "17cc6a4de00/u",
            "6258Hc915": "17cc6a4de03/u",
            "98851h899": "17cc6a4de06/u",
            "145ldL501": "17cc6a4de09/u",
            "521xyZ791": "17cc6a4de0c/u",
            "482kxH756": "17cc6a4de0f/u",
            "148EyW923": "17cc6a4de12/u",
            "153c9f928": "17cc6a4de15/u",
            "213Pwt671": "17cc6a4de18/u",
            "6286zD447": "17cc6a4de1b/u",
            "571tpg192": "17cc6a4de1e/u",
            "53289e206": "17cc6a4de21/u",
            "387VFE800": "17cc6a4de24/u",
            "521FRs201": "17cc6a4de27/u",
            "756l7i711": "17cc6a4de2b/u",
            "9695gI753": "17cc6a4de2e/u",
            "676JPk438": "17cc6a4de31/u",
            "337xHw763": "17cc6a4de34/u",
            "40769L418": "17cc6a4de37/u",
            "779kOp141": "17cc6a4de3d/u",
            "309mov753": "17cc6a4de40/u",
            "540fnV303": "17cc6a4de43/u",
            "819Ydh734": "17cc6a4de46/u",
            "997IyF944": "17cc6a4de48/u",
            "415OoX384": "17cc6a4de4b/u",
            "796zi5971": "17cc6a4de4e/u",
            "946Qgh131": "17cc6a4de52/u",
            "410VD0576": "17cc6a4de55/u",
            "563QkW967": "17cc6a4de57/u",
            "311z85960": "17cc6a4de5a/u",
            "5000ZU377": "17cc6a4de5d/u",
            "964mtH293": "17cc6a4de60/u",
            "647fW9757": "17cc6a4de63/u",
            "195c3I190": "17cc6a4de66/u",
            "218XWh203": "17cc6a4de69/u",
            "604TR1190": "17cc6a4de6b/u",
            "835I2O194": "17cc6a4de6e/u",
            "523ZRH587": "17cc6a4de71/u",
            "572bfA175": "17cc6a4de74/u",
            "675mO5247": "17cc6a4de77/u",
            "559VRl328": "17cc6a4de7a/u",
            "1878fR221": "17cc6a4de7d/u",
            "540AyV659": "17cc6a4de7f/u",
            "903ICr297": "17cc6a4de82/u",
            "7570VN216": "17cc6a4de84/u",
            "712Qdf908": "17cc6a4de86/u",
            "554Xn9460": "17cc6a4de88/u",
            "582xRv873": "17cc6a4de8a/u",
            "761xLv342": "17cc6a4de8d/u",
            "880UTI952": "17cc6a4de90/u",
            "1113rq172": "17cc6a4de93/u",
            "642UHs545": "17cc6a4de96/u",
            "458qlj304": "17cc6a4de98/u",
            "388D0C774": "17cc6a4de9a/u",
            "4496Eg543": "17cc6a4de9d/u",
            "442OLQ559": "17cc6a4de9f/u",
            "156Rah824": "17cc6a4dea1/u",
            "875MiX179": "17cc6a4dea4/u",
            "485M5z885": "17cc6a4dea6/u",
            "766pDY639": "17cc6a4dea9/u",
            "198rQw334": "17cc6a4deac/u",
            "928YM6589": "17cc6a4deaf/u",
            "2799XI806": "17cc6a4deb1/u",
            "620O42534": "17cc6a4deb5/u",
            "2724Lo785": "17cc6a4deb7/u",
            "807Cuq406": "17cc6a4deb9/u",
            "341wZp756": "17cc6a4debb/u",
            "225orv990": "17cc6a4debd/u",
            "112Ebd315": "17cc6a4dec0/u",
            "6367Ps822": "17cc6a4dec2/u",
            "555P4G479": "17cc6a4dec4/u",
            "5004HV327": "17cc6a4dec6/u",
            "683tIP598": "17cc6a4dec8/u",
            "4344a6520": "17cc6a4decb/u",
            "782lDN699": "17cc6a4decd/u",
            "199fV7911": "17cc6a4decf/u",
            "625Njd119": "17cc6a4ded1/u",
            "355zpb984": "17cc6a4ded3/u",
            "334SIT757": "17cc6a4ded6/u",
            "212B1l657": "17cc6a4ded8/u",
            "504CpS505": "17cc6a4deda/u",
            "908xdN199": "17cc6a4dedc/u",
            "3860fw278": "17cc6a4dede/u",
            "727Vs4775": "17cc6a4dee0/u",
            "118ofU847": "17cc6a4dee2/u",
            "502lHc414": "17cc6a4dee5/u",
            "877Pxc133": "17cc6a4dee7/u",
            "2069ey524": "17cc6a4dee9/u",
            "862t9D791": "17cc6a4deeb/u",
            "251vyD137": "17cc6a4deed/u",
            "396gXb952": "17cc6a4deef/u",
            "899DSj547": "17cc6a4def2/u",
            "467mDe164": "17cc6a4def5/u",
            "3026ZF602": "17cc6a4def8/u",
            "377QgG672": "17cc6a4defb/u",
            "230Cnb152": "17cc6a4defe/u",
            "935Ncr625": "17cc6a4df01/u",
            "562NMr128": "17cc6a4df04/u",
            "68073J301": "17cc6a4df06/u",
            "399Yit843": "17cc6a4df09/u",
            "820pUK115": "17cc6a4df0c/u",
            "60431T845": "17cc6a4df0f/u",
            "315URx594": "17cc6a4df12/u",
            "803KRj148": "17cc6a4df15/u",
            "654sg9584": "17cc6a4df18/u",
            "506yAb367": "17cc6a4df1a/u",
            "796Usb755": "17cc6a4df1d/u",
            "2051Zh680": "17cc6a4df20/u",
            "263lvt387": "17cc6a4df22/u",
            "957KN2867": "17cc6a4df24/u",
            "6203XG583": "17cc6a4df27/u",
            "364d0q276": "17cc6a4df2a/u",
            "261Vdb749": "17cc6a4df2c/u",
            "64481P385": "17cc6a4df2e/u",
            "681SxI175": "17cc6a4df31/u",
            "6001wD777": "17cc6a4df33/u",
            "986BqC698": "17cc6a4df35/u",
            "491cLF770": "17cc6a4df37/u",
            "9022av660": "17cc6a4df3a/u",
            "445o89373": "17cc6a4df3c/u",
            "469Nhr752": "17cc6a4df3e/u",
            "619jCv173": "17cc6a4df40/u",
            "644sFT306": "17cc6a4df42/u",
            "771TIe145": "17cc6a4df45/u",
            "418q9W571": "17cc6a4df48/u",
            "725Qb5287": "17cc6a4df4b/u",
            "623nbK648": "17cc6a4df4e/u",
            "776Wkd156": "17cc6a4df50/u",
            "150JZx401": "17cc6a4df53/u",
            "7557Ws879": "17cc6a4df55/u",
            "870QOl639": "17cc6a4df57/u",
            "193Hqa287": "17cc6a4df59/u",
            "207hSA499": "17cc6a4df5b/u",
            "642cmI977": "17cc6a4df5d/u",
            "503MWS930": "17cc6a4df5f/u",
            "853NSA715": "17cc6a4df61/u",
            "8985H3543": "17cc6a4df63/u",
            "260sC8901": "17cc6a4df65/u",
            "248ILf931": "17cc6a4df67/u",
            "650CW2578": "17cc6a4df69/u",
            "471p9F236": "17cc6a4df6b/u",
            "8484nK935": "17cc6a4df6e/u",
            "750KVU211": "17cc6a4df70/u",
            "589iNH208": "17cc6a4df72/u",
            "826hu5376": "17cc6a4df74/u",
            "287i2I313": "17cc6a4df75/u",
            "166Gqg129": "17cc6a4df78/u",
            "1969Z8837": "17cc6a4df7a/u",
            "816idP816": "17cc6a4df7c/u",
            "156M35595": "17cc6a4df7f/u",
            "173Znz691": "17cc6a4df81/u",
            "376TND570": "17cc6a4df83/u",
            "383ksK174": "17cc6a4df85/u",
            "938l0C130": "17cc6a4df87/u",
            "463T0o359": "17cc6a4df89/u",
            "459qUw897": "17cc6a4df8b/u",
            "957l9y673": "17cc6a4df8e/u",
            "2536rE366": "17cc6a4df90/u",
            "161tv2141": "17cc6a4df92/u",
            "2413rP546": "17cc6a4df94/u",
            "547BmO340": "17cc6a4df96/u",
            "4190b4133": "17cc6a4df98/u",
            "570olg967": "17cc6a4df9a/u",
            "907EzA364": "17cc6a4df9c/u",
            "733CTX347": "17cc6a4df9e/u",
            "9452yK889": "17cc6a4dfa1/u",
            "384FuE444": "17cc6a4dfa3/u",
            "592jUI719": "17cc6a4dfa5/u",
            "4625eG811": "17cc6a4dfa7/u",
            "399A30409": "17cc6a4dfa9/u",
            "738kRx885": "17cc6a4dfab/u",
            "138qmw864": "17cc6a4dfae/u",
            "9830uW767": "17cc6a4dfb0/u",
            "357TNz339": "17cc6a4dfb2/u",
            "554TDx723": "17cc6a4dfb4/u",
            "648NZ7189": "17cc6a4dfb6/u",
            "177Qns712": "17cc6a4dfb8/u",
            "333kn9258": "17cc6a4dfba/u",
            "557Yg0246": "17cc6a4dfbc/u",
            "2056m1218": "17cc6a4dfbf/u",
            "976jQe732": "17cc6a4dfc1/u",
            "5659fE273": "17cc6a4dfc3/u",
            "798pHL682": "17cc6a4dfc5/u",
            "8934Fc514": "17cc6a4dfc7/u",
            "179poL118": "17cc6a4dfc9/u",
            "960Ofj937": "17cc6a4dfcb/u",
            "378vWk478": "17cc6a4dfce/u",
            "174npa860": "17cc6a4dfd1/u",
            "594i7e298": "17cc6a4dfd3/u",
            "739KtZ327": "17cc6a4dfd5/u",
            "781UND278": "17cc6a4dfd8/u",
            "433tz1720": "17cc6a4dfda/u",
            "174P1O256": "17cc6a4dfdd/u",
            "169yh7663": "17cc6a4dfdf/u",
            "688gmj675": "17cc6a4dfe2/u",
            "4007JZ180": "17cc6a4dfe4/u",
            "659UML940": "17cc6a4dfe6/u",
            "396syN591": "17cc6a4dfe9/u",
            "132tJX281": "17cc6a4dfeb/u",
            "854AwX317": "17cc6a4e76b/u",
            "533xWX825": "17cc6a4e772/u",
            "5761zS628": "17cc6a4e775/u",
            "273rif881": "17cc6a4e778/u",
            "445q4C822": "17cc6a4e77b/u",
            "779gUZ742": "17cc6a4e77e/u",
            "7583Vg799": "17cc6a4e782/u",
            "697TQ1674": "17cc6a4e785/u",
            "796DSE686": "17cc6a4e788/u",
            "2225Sq473": "17cc6a4e78a/u",
            "233CEO610": "17cc6a4e78d/u",
            "686CSK503": "17cc6a4e791/u",
            "296c3d690": "17cc6a4e793/u",
            "1614Qo777": "17cc6a4e796/u",
            "143KoT336": "17cc6a4e799/u",
            "946qgX442": "17cc6a4e79c/u",
            "8834Zk715": "17cc6a4e7a0/u",
            "271cn0797": "17cc6a4e7a2/u",
            "560Ll2569": "17cc6a4e7a5/u",
            "3661Y7312": "17cc6a4e7a8/u",
            "9801Tj558": "17cc6a4e7ab/u",
            "2781kQ358": "17cc6a4e7ae/u",
            "461I3l818": "17cc6a4e7b1/u",
            "6628BP713": "17cc6a4e7b3/u",
            "443NXF918": "17cc6a4e7b5/u",
            "389dh0917": "17cc6a4e7b8/u",
            "8520LO945": "17cc6a4e7bb/u",
            "274HNj212": "17cc6a4e7be/u",
            "995NTC495": "17cc6a4e7c1/u",
            "944xwa884": "17cc6a4e7c4/u",
            "414XGz620": "17cc6a4e7c6/u",
            "779QOC366": "17cc6a4e7c9/u",
            "596loi159": "17cc6a4e7cc/u",
            "930Ggc867": "17cc6a4e7ce/u",
            "563rpX588": "17cc6a4e7d0/u",
            "322Hwm559": "17cc6a4e7d3/u",
            "399x2Q962": "17cc6a4e7d6/u",
            "278hLB418": "17cc6a4e7d9/u",
            "345rIc252": "17cc6a4e7dc/u",
            "699HfM988": "17cc6a4e7de/u",
            "27962x700": "17cc6a4e7e1/u",
            "2466nM158": "17cc6a4e7e5/u",
            "4490Dy592": "17cc6a4e7e8/u",
            "247kCR253": "17cc6a4e7ea/u",
            "955MNh871": "17cc6a4e7ee/u",
            "986dnx831": "17cc6a4e7f1/u",
            "919QUF177": "17cc6a4e7f4/u",
            "777flY245": "17cc6a4e7f7/u",
            "389Wjd887": "17cc6a4e7fa/u",
            "5584r0444": "17cc6a4e7fc/u",
            "926Uo0699": "17cc6a4e7ff/u",
            "930iVS980": "17cc6a4e803/u",
            "288SyJ323": "17cc6a4e806/u",
            "682qE8751": "17cc6a4e808/u",
            "582QkR184": "17cc6a4e80b/u",
            "993IGn670": "17cc6a4e80e/u",
            "809sYG449": "17cc6a4e811/u",
            "587fZo499": "17cc6a4e814/u",
            "1843wY484": "17cc6a4e817/u",
            "2316FI397": "17cc6a4e81a/u",
            "386Gfm414": "17cc6a4e81d/u",
            "9653Ss812": "17cc6a4e81f/u",
            "963njd291": "17cc6a4e823/u",
            "291o7u683": "17cc6a4e826/u",
            "643Bd8892": "17cc6a4e829/u",
            "866CN5929": "17cc6a4e82b/u",
            "361q1P545": "17cc6a4e82e/u",
            "998Aae633": "17cc6a4e831/u",
            "413Jjg754": "17cc6a4e835/u",
            "266zhC965": "17cc6a4e838/u",
            "364AMW552": "17cc6a4e83b/u",
            "776BHE702": "17cc6a4e83e/u",
            "620uUI875": "17cc6a4e841/u",
            "706CVu239": "17cc6a4e844/u",
            "935QRh599": "17cc6a4e848/u",
            "990tyo531": "17cc6a4e84b/u",
            "396oah644": "17cc6a4e84d/u",
            "492wNE301": "17cc6a4e850/u",
            "724F3Y111": "17cc6a4e853/u",
            "289bYE509": "17cc6a4e855/u",
            "678cXz443": "17cc6a4e859/u",
            "83891M561": "17cc6a4e85c/u",
            "753xVc337": "17cc6a4e85f/u",
            "213J2K282": "17cc6a4e862/u",
            "423Apk573": "17cc6a4e865/u",
            "409g06764": "17cc6a4e868/u",
            "197qZc752": "17cc6a4e86b/u",
            "151cZY861": "17cc6a4e86e/u",
            "432gWL589": "17cc6a4e871/u",
            "2009XY617": "17cc6a4e873/u",
            "228Bhp594": "17cc6a4e877/u",
            "204OhT346": "17cc6a4e87a/u",
            "7080ut462": "17cc6a4e87d/u",
            "270v6G991": "17cc6a4e880/u",
            "230Y0l883": "17cc6a4e883/u",
            "794DqL651": "17cc6a4e885/u",
            "9129xK908": "17cc6a4e889/u",
            "726lrh509": "17cc6a4e88c/u",
            "11289A816": "17cc6a4e88e/u",
            "558uDn292": "17cc6a4e892/u",
            "650yIj248": "17cc6a4e894/u",
            "735Ut8895": "17cc6a4e898/u",
            "303eI7911": "17cc6a4e89b/u",
            "2375mW778": "17cc6a4e89e/u",
            "432pnk748": "17cc6a4e8a1/u",
            "887ch6918": "17cc6a4e8a4/u",
            "583K6J132": "17cc6a4e8a7/u",
            "217CBo228": "17cc6a4e8aa/u",
            "887shZ679": "17cc6a4e8ad/u",
            "766tRH785": "17cc6a4e8b0/u",
            "154T3j312": "17cc6a4e8b3/u",
            "986Tx4666": "17cc6a4e8b6/u",
            "272XVW278": "17cc6a4e8b9/u",
            "234xCL816": "17cc6a4e8bc/u",
            "697LEp245": "17cc6a4e8bf/u",
            "174luz409": "17cc6a4e8c2/u",
            "428J6c833": "17cc6a4e8c5/u",
            "576vgR222": "17cc6a4e8c8/u",
            "781O5I892": "17cc6a4e8cb/u",
            "994zGB805": "17cc6a4e8ce/u",
            "275CWB789": "17cc6a4e8d1/u",
            "707L3Q750": "17cc6a4e8d4/u",
            "393nUN333": "17cc6a4e8d7/u",
            "824tdw550": "17cc6a4e8da/u",
            "415k8h801": "17cc6a4e8dd/u",
            "950hdT137": "17cc6a4e8e0/u",
            "267voW708": "17cc6a4e8e3/u",
            "980fce275": "17cc6a4e8e5/u",
            "636PE3485": "17cc6a4e8e8/u",
            "303hEg285": "17cc6a4e8eb/u",
            "270aER716": "17cc6a4e8ee/u",
            "762zfB246": "17cc6a4e8f1/u",
            "429l5g872": "17cc6a4e8f4/u",
            "775HeC123": "17cc6a4e8f6/u",
            "9744uR516": "17cc6a4e8f9/u",
            "300aS9822": "17cc6a4e8fc/u",
            "115hwY525": "17cc6a4e900/u",
            "555Ang667": "17cc6a4e903/u",
            "308ing633": "17cc6a4e906/u",
            "563ykN743": "17cc6a4e909/u",
            "764VBM970": "17cc6a4e90c/u",
            "521wNd201": "17cc6a4e90f/u",
            "867t6X646": "17cc6a4e911/u",
            "580fZX431": "17cc6a4e914/u",
            "185r6C286": "17cc6a4e917/u",
            "188aMU519": "17cc6a4e91a/u",
            "391Eel747": "17cc6a4e91d/u",
            "868v5u894": "17cc6a4e920/u",
            "81641Q529": "17cc6a4e923/u",
            "318kOn614": "17cc6a4e926/u",
            "974Z5Q695": "17cc6a4e929/u",
            "956Vol932": "17cc6a4e92c/u",
            "926MI8435": "17cc6a4e92f/u",
            "208fON546": "17cc6a4e932/u",
            "3223VS791": "17cc6a4e935/u",
            "1532ku704": "17cc6a4e938/u",
            "6063xZ296": "17cc6a4e93a/u",
            "453hx3224": "17cc6a4e93d/u",
            "645Gh0218": "17cc6a4e940/u",
            "9593T6897": "17cc6a4e944/u",
            "521o9N404": "17cc6a4e947/u",
            "569Tv1714": "17cc6a4e94a/u",
            "603JQL757": "17cc6a4e94d/u",
            "538vN0692": "17cc6a4e951/u",
            "439zcx904": "17cc6a4e955/u",
            "395CFV276": "17cc6a4e958/u",
            "829uUw798": "17cc6a4e95b/u",
            "996BEJ491": "17cc6a4e95e/u",
            "633lTr344": "17cc6a4e961/u",
            "291s8D281": "17cc6a4e964/u",
            "448Aad927": "17cc6a4e967/u",
            "583hp7969": "17cc6a4e96a/u",
            "649X2I266": "17cc6a4e96d/u",
            "556uV8542": "17cc6a4e970/u",
            "360Ak8327": "17cc6a4e973/u",
            "9908Pq752": "17cc6a4e976/u",
            "606VOE221": "17cc6a4e979/u",
            "277YRM593": "17cc6a4e97c/u",
            "502GVi708": "17cc6a4e97f/u",
            "569fPt261": "17cc6a4e982/u",
            "181l2b634": "17cc6a4e985/u",
            "485E68582": "17cc6a4e988/u",
            "758Wmv598": "17cc6a4e98b/u",
            "856l4D344": "17cc6a4e98e/u",
            "330NxO282": "17cc6a4e991/u",
            "428FzK394": "17cc6a4e995/u",
            "549gQb981": "17cc6a4e998/u",
            "985jx4593": "17cc6a4e99a/u",
            "395BSI408": "17cc6a4e99d/u",
            "443oTD456": "17cc6a4e9a0/u",
            "301p3h692": "17cc6a4e9a4/u",
            "847s23571": "17cc6a4e9a7/u",
            "281XUe284": "17cc6a4e9a9/u",
            "8724FP150": "17cc6a4e9ac/u",
            "341pJX712": "17cc6a4e9af/u",
            "977PcU212": "17cc6a4e9b2/u",
            "495eWq301": "17cc6a4e9b5/u",
            "291R8z886": "17cc6a4e9b8/u",
            "643eMu440": "17cc6a4e9bb/u",
            "690vCN171": "17cc6a4e9be/u",
            "627FWg417": "17cc6a4e9c0/u",
            "342im8644": "17cc6a4e9c3/u",
            "956nmM767": "17cc6a4e9c7/u",
            "94209P747": "17cc6a4e9ca/u",
            "896E4D668": "17cc6a4e9cd/u",
            "806m48256": "17cc6a4e9d0/u",
            "139C7h700": "17cc6a4e9d3/u",
            "863r9b514": "17cc6a4e9d6/u",
            "6992FK842": "17cc6a4e9d9/u",
            "93890j644": "17cc6a4e9dc/u",
            "173DFy169": "17cc6a4e9df/u",
            "617Jmb176": "17cc6a4e9e2/u",
            "1387dX922": "17cc6a4e9e5/u",
            "757QP5634": "17cc6a4e9e8/u",
            "685cGu125": "17cc6a4e9eb/u",
            "231lht202": "17cc6a4e9ee/u",
            "797RWn236": "17cc6a4e9f0/u",
            "282p18921": "17cc6a4e9f3/u",
            "526x6B948": "17cc6a4e9f7/u",
            "473Lfq540": "17cc6a4e9fa/u",
            "717ed2536": "17cc6a4e9fc/u",
            "439NHW878": "17cc6a4e9ff/u",
            "224hOE401": "17cc6a4ea02/u",
            "713o7L721": "17cc6a4ea05/u",
            "685jIm289": "17cc6a4ea08/u",
            "398dmp756": "17cc6a4ea0b/u",
            "685vAQ805": "17cc6a4ea0e/u",
            "784lXf789": "17cc6a4ea10/u",
            "989pBi681": "17cc6a4ea13/u",
            "861wxy946": "17cc6a4ea16/u",
            "395us7256": "17cc6a4ea19/u",
            "873en5983": "17cc6a4ea1c/u",
            "5542uH819": "17cc6a4ea1e/u",
            "913HMh793": "17cc6a4ea20/u",
            "268pYF527": "17cc6a4ea22/u",
            "530JNc782": "17cc6a4ea24/u",
            "927Kw0268": "17cc6a4ea26/u",
            "745JlH191": "17cc6a4ea29/u",
            "8516EC214": "17cc6a4ea2b/u",
            "848ASC327": "17cc6a4ea2d/u",
            "6280mU960": "17cc6a4ea2f/u",
            "736foE114": "17cc6a4ea31/u",
            "968AOU189": "17cc6a4ea33/u",
            "710gFc414": "17cc6a4ea36/u",
            "967l9x420": "17cc6a4ea38/u",
            "614wHu830": "17cc6a4ea3a/u",
            "402qyT321": "17cc6a4ea3d/u",
            "707knS560": "17cc6a4ea3f/u",
            "99643Y354": "17cc6a4ea41/u",
            "6818ea689": "17cc6a4ea43/u",
            "8368Zj199": "17cc6a4ea45/u",
            "515of0648": "17cc6a4ea47/u",
            "6698Ng330": "17cc6a4ea49/u",
            "534fAO919": "17cc6a4ea4c/u",
            "4409te716": "17cc6a4ea4e/u",
            "433guH839": "17cc6a4ea50/u",
            "606ADO151": "17cc6a4ea53/u",
            "354D5F958": "17cc6a4ea55/u",
            "657Bdo703": "17cc6a4ea57/u",
            "470byV938": "17cc6a4ea59/u",
            "9293MC502": "17cc6a4ea5c/u",
            "9529kN292": "17cc6a4ea5e/u",
            "441svo747": "17cc6a4ea60/u",
            "36870G163": "17cc6a4ea62/u",
            "6346cD412": "17cc6a4ea64/u",
            "636Xgr237": "17cc6a4ea66/u",
            "4442PX639": "17cc6a4ea68/u",
            "38914w268": "17cc6a4ea6a/u",
            "897qes316": "17cc6a4ea6d/u",
            "4067Hx274": "17cc6a4ea6f/u",
            "336Ce0813": "17cc6a4ea71/u",
            "596KUa511": "17cc6a4ea73/u",
            "181hE8667": "17cc6a4ea75/u",
            "399wId235": "17cc6a4ea78/u",
            "414nk4910": "17cc6a4ea7a/u",
            "556sTW150": "17cc6a4ea7c/u",
            "697hbN656": "17cc6a4ea7f/u",
            "5901Ji591": "17cc6a4ea81/u",
            "7995E1816": "17cc6a4ea83/u",
            "438uC8657": "17cc6a4ea85/u",
            "302Kz9650": "17cc6a4ea87/u",
            "402Lzh697": "17cc6a4ea89/u",
            "366TIt176": "17cc6a4ea8c/u",
            "9274Y3229": "17cc6a4ea8f/u",
            "418auL648": "17cc6a4ea91/u",
            "799m9L483": "17cc6a4ea93/u",
            "688T7M259": "17cc6a4ea95/u",
            "7174J1164": "17cc6a4ea97/u",
            "742iP5994": "17cc6a4ea9a/u",
            "4556d3574": "17cc6a4ea9d/u",
            "3925dR345": "17cc6a4eaa0/u",
            "738dbt803": "17cc6a4eaa3/u",
            "235lBf849": "17cc6a4eaa6/u",
            "538mW7716": "17cc6a4eaa8/u",
            "9825xg202": "17cc6a4eaaa/u",
            "196Psm454": "17cc6a4eaac/u",
            "586mTc690": "17cc6a4eaaf/u",
            "774NIt710": "17cc6a4eab1/u",
            "170RSB715": "17cc6a4eab3/u",
            "715UJb747": "17cc6a4eab5/u",
            "346ahG226": "17cc6a4eab7/u",
            "216IWi893": "17cc6a4eab9/u",
            "958bJ9123": "17cc6a4eabb/u",
            "664EXy814": "17cc6a4eabd/u",
            "939tBd610": "17cc6a4eabf/u",
            "614uUA846": "17cc6a4eac1/u",
            "919efa923": "17cc6a4eac3/u",
            "134gAQ351": "17cc6a4eac5/u",
            "948Fc4969": "17cc6a4eac8/u",
            "897PJz477": "17cc6a4eaca/u",
            "168kUq915": "17cc6a4eacc/u",
            "824RoT308": "17cc6a4eace/u",
            "219GR0718": "17cc6a4ead0/u",
            "3928iM929": "17cc6a4ead2/u",
            "352sj6692": "17cc6a4ead4/u",
            "9792vb368": "17cc6a4ead6/u",
            "5968IL357": "17cc6a4ead8/u",
            "389olN491": "17cc6a4eada/u",
            "123eFS787": "17cc6a4eadc/u",
            "331QFz792": "17cc6a4eade/u",
            "697XY1634": "17cc6a4eae0/u",
            "718qdQ141": "17cc6a4eae2/u",
            "367rQ3510": "17cc6a4eae4/u",
            "201imu826": "17cc6a4eae6/u",
            "291N2c461": "17cc6a4eae8/u",
            "785Rmg404": "17cc6a4eaea/u",
            "538b68653": "17cc6a4eaec/u",
            "817WkQ199": "17cc6a4eaee/u",
            "913XUv696": "17cc6a4eaf1/u",
            "6342Qa120": "17cc6a4eaf3/u",
            "710BhC225": "17cc6a4eaf5/u",
            "781WLn883": "17cc6a4eaf7/u",
            "547uZY995": "17cc6a4eaf9/u",
            "816gfX692": "17cc6a4eafb/u",
            "446imz777": "17cc6a4eafd/u",
            "381GNU767": "17cc6a4eaff/u",
            "818olU682": "17cc6a4eb01/u",
            "272xLh279": "17cc6a4eb04/u",
            "381aeL943": "17cc6a4eb06/u",
            "347De8184": "17cc6a4eb08/u",
            "710kY1959": "17cc6a4eb09/u",
            "792OxA231": "17cc6a4eb0b/u",
            "403BJP822": "17cc6a4eb0d/u",
            "341fQa140": "17cc6a4eb0f/u",
            "835VDi873": "17cc6a4eb12/u",
            "278YIt689": "17cc6a4eb14/u",
            "605OTU659": "17cc6a4eb16/u",
            "550dv7549": "17cc6a4eb18/u",
            "266jwS230": "17cc6a4eb1a/u",
            "307DIP348": "17cc6a4eb1c/u",
            "4455Zm734": "17cc6a4eb1e/u",
            "177Ygd978": "17cc6a4eb20/u",
            "731t19686": "17cc6a4eb23/u",
            "876laE328": "17cc6a4eb25/u",
            "368CX3662": "17cc6a4eb27/u",
            "220dZP357": "17cc6a4eb29/u",
            "767vuQ828": "17cc6a4eb2b/u",
            "229aPX699": "17cc6a4eb2d/u",
            "619Pja567": "17cc6a4eb2f/u",
            "177HqF999": "17cc6a4eb32/u",
            "768i76887": "17cc6a4eb34/u",
            "163xSb686": "17cc6a4eb36/u",
            "1334gV694": "17cc6a4eb39/u",
            "6621Wl883": "17cc6a4eb3b/u",
            "792kZR458": "17cc6a4eb3e/u",
            "423QFE777": "17cc6a4eb40/u",
            "670i2q316": "17cc6a4eb42/u",
            "120WSC954": "17cc6a4eb45/u",
            "37346m745": "17cc6a4eb47/u",
            "469FnG570": "17cc6a4eb49/u",
            "534edD541": "17cc6a4eb4b/u",
            "272r4M674": "17cc6a4eb4d/u",
            "248MoE653": "17cc6a4eb4f/u",
            "815WJ6480": "17cc6a4eb51/u",
            "247oSc388": "17cc6a4eb54/u",
            "873Dsm326": "17cc6a4eb56/u",
            "112eO9932": "17cc6a4eb58/u",
            "424tN1868": "17cc6a4eb5b/u",
            "731nv9840": "17cc6a4eb5d/u",
            "554cLk928": "17cc6a4fafd/u",
            "27079K443": "17cc6a4fb00/u",
            "980p4P208": "17cc6a4fb03/u",
            "156jpD635": "17cc6a4fb06/u",
            "782yn5376": "17cc6a4fb09/u",
            "161UTB186": "17cc6a4fb0c/u",
            "734vzd385": "17cc6a4fb0f/u",
            "642Q0f950": "17cc6a4fb12/u",
            "395Odc214": "17cc6a4fb15/u",
            "122mxU380": "17cc6a4fb18/u",
            "650Ljc624": "17cc6a4fb1b/u",
            "292s8H485": "17cc6a4fb1e/u",
            "4937PU129": "17cc6a4fb21/u",
            "2715Ry218": "17cc6a4fb24/u",
            "130Uwd904": "17cc6a4fb27/u",
            "249IeM742": "17cc6a4fb2b/u",
            "776KaC731": "17cc6a4fb2d/u",
            "732rHg517": "17cc6a4fb30/u",
            "941VDN551": "17cc6a4fb33/u",
            "3125Hw985": "17cc6a4fb36/u",
            "117rpH227": "17cc6a4fb39/u",
            "636OQg545": "17cc6a4fb3c/u",
            "781ZGV336": "17cc6a4fb3f/u",
            "897t8W881": "17cc6a4fb42/u",
            "4376z8198": "17cc6a4fb44/u",
            "161pra286": "17cc6a4fb47/u",
            "244E2K863": "17cc6a4fb4a/u",
            "1187o8646": "17cc6a4fb4d/u",
            "6162qZ814": "17cc6a4fb50/u",
            "426DI0696": "17cc6a4fb53/u",
            "778Mca648": "17cc6a4fb55/u",
            "224fKO408": "17cc6a4fb58/u",
            "2078Dg259": "17cc6a4fb5b/u",
            "612epY302": "17cc6a4fb5e/u",
            "691m1T572": "17cc6a4fb61/u",
            "4746jk900": "17cc6a4fb63/u",
            "278fOl333": "17cc6a4fb66/u",
            "962Yk2229": "17cc6a4fb69/u",
            "383dFB732": "17cc6a4fb6c/u",
            "233xGi342": "17cc6a4fb6f/u",
            "555Sdb137": "17cc6a4fb72/u",
            "1905Du259": "17cc6a4fb74/u",
            "840fRe181": "17cc6a4fb77/u",
            "938S3U314": "17cc6a4fb7a/u",
            "866vEW677": "17cc6a4fb7d/u",
            "95602s829": "17cc6a4fb80/u",
            "295ogl924": "17cc6a4fb83/u",
            "440ptk855": "17cc6a4fb86/u",
            "6622LR117": "17cc6a4fb89/u",
            "336jg2407": "17cc6a4fb8c/u",
            "88320J297": "17cc6a4fb8f/u",
            "699a7p543": "17cc6a4fb91/u",
            "364Jki523": "17cc6a4fb94/u",
            "6810nv574": "17cc6a4fb97/u",
            "1178bk989": "17cc6a4fb9a/u",
            "426Rmo396": "17cc6a4fb9d/u",
            "4462li969": "17cc6a4fba0/u",
            "212MVw190": "17cc6a4fba3/u",
            "752oCS479": "17cc6a4fba5/u",
            "778GRN344": "17cc6a4fba8/u",
            "254MGR744": "17cc6a4fbab/u",
            "128R8K500": "17cc6a4fbaf/u",
            "668IXZ628": "17cc6a4fbb1/u",
            "127Yyw488": "17cc6a4fbb4/u",
            "777gLs341": "17cc6a4fbb7/u",
            "28429A872": "17cc6a4fbba/u",
            "6517x3187": "17cc6a4fbbd/u",
            "820Gyt603": "17cc6a4fbc0/u",
            "163VUB402": "17cc6a4fbc3/u",
            "892GlE466": "17cc6a4fbc6/u",
            "158pGO149": "17cc6a4fbca/u",
            "8352wY313": "17cc6a4fbcc/u",
            "140A0a683": "17cc6a4fbd0/u",
            "564vzV366": "17cc6a4fbd3/u",
            "153qom710": "17cc6a4fbd6/u",
            "184mIn793": "17cc6a4fbd9/u",
            "899yim453": "17cc6a4fbdc/u",
            "5280ok423": "17cc6a4fbdf/u",
            "72870H139": "17cc6a4fbe2/u",
            "142Oy3412": "17cc6a4fbe5/u",
            "814mpL171": "17cc6a4fbe8/u",
            "123M4w699": "17cc6a4fbeb/u",
            "511R4Y433": "17cc6a4fbef/u",
            "175DwZ435": "17cc6a4fbf2/u",
            "542HWy435": "17cc6a4fbf7/u",
            "545dul503": "17cc6a4fbfa/u",
            "276F8w922": "17cc6a4fbfd/u",
            "337tpc690": "17cc6a4fc00/u",
            "887sLg222": "17cc6a4fc03/u",
            "236BOQ414": "17cc6a4fc06/u",
            "2611lz635": "17cc6a4fc09/u",
            "2500Xh957": "17cc6a4fc0d/u",
            "665lbh327": "17cc6a4fc10/u",
            "118Yv8112": "17cc6a4fc13/u",
            "911Kvq333": "17cc6a4fc17/u",
            "5283NE460": "17cc6a4fc1a/u",
            "119qMJ792": "17cc6a4fc1d/u",
            "507iNu625": "17cc6a4fc20/u",
            "697HI1581": "17cc6a4fc23/u",
            "282SkM629": "17cc6a4fc26/u",
            "723fTU767": "17cc6a4fc29/u",
            "212FoK667": "17cc6a4fc2c/u",
            "6950IU597": "17cc6a4fc2f/u",
            "426sjZ485": "17cc6a4fc32/u",
            "744usy715": "17cc6a4fc35/u",
            "6782Wx283": "17cc6a4fc38/u",
            "933dEU727": "17cc6a4fc3b/u",
            "5290JX575": "17cc6a4fc3e/u",
            "852bwg872": "17cc6a4fc41/u",
            "426J2x296": "17cc6a4fc44/u",
            "5042K1213": "17cc6a4fc48/u",
            "363HxL570": "17cc6a4fc4a/u",
            "460NR3549": "17cc6a4fc4d/u",
            "973PqN356": "17cc6a4fc50/u",
            "647UyV156": "17cc6a4fc53/u",
            "626nbw311": "17cc6a4fc56/u",
            "251Yxr373": "17cc6a4fc59/u",
            "2148NP628": "17cc6a4fc5c/u",
            "262ocK206": "17cc6a4fc5f/u",
            "839ftq605": "17cc6a4fc62/u",
            "337t2f928": "17cc6a4fc65/u",
            "211HiR416": "17cc6a4fc68/u",
            "8764aV407": "17cc6a4fc6b/u",
            "542HPK384": "17cc6a4fc6d/u",
            "823Le0260": "17cc6a4fc70/u",
            "133Egm536": "17cc6a4fc74/u",
            "767Xt8570": "17cc6a4fc77/u",
            "667TUd808": "17cc6a4fc7a/u",
            "733wiH853": "17cc6a4fc7c/u",
            "4759YP450": "17cc6a4fc7f/u",
            "909mqP880": "17cc6a4fc82/u",
            "193SdH758": "17cc6a4fc85/u",
            "5153oE882": "17cc6a4fc88/u",
            "474xZO928": "17cc6a4fc8b/u",
            "631EPD432": "17cc6a4fc8e/u",
            "232YOB863": "17cc6a4fc90/u",
            "188ZSi493": "17cc6a4fc93/u",
            "547Xbm589": "17cc6a4fc97/u",
            "279I1d797": "17cc6a4fc9a/u",
            "707u1M400": "17cc6a4fc9d/u",
            "8398ZF987": "17cc6a4fca0/u",
            "159G7b930": "17cc6a4fca3/u",
            "306wIR816": "17cc6a4fca6/u",
            "499UP2511": "17cc6a4fca9/u",
            "728lzT702": "17cc6a4fcac/u",
            "791rqn455": "17cc6a4fcaf/u",
            "305GPC537": "17cc6a4fcb2/u",
            "869Cn2879": "17cc6a4fcb5/u",
            "447hXA296": "17cc6a4fcb8/u",
            "152RJ6379": "17cc6a4fcbb/u",
            "7387lc924": "17cc6a4fcbe/u",
            "219TlO450": "17cc6a4fcc1/u",
            "723Dcl213": "17cc6a4fcc4/u",
            "595rmi709": "17cc6a4fcc7/u",
            "135ehY351": "17cc6a4fcca/u",
            "6529xW387": "17cc6a4fccd/u",
            "654c2f461": "17cc6a4fcd0/u",
            "2196Fj216": "17cc6a4fcd3/u",
            "660fk4365": "17cc6a4fcd6/u",
            "569aBj980": "17cc6a4fcd9/u",
            "928hLt617": "17cc6a4fcdc/u",
            "794TDd390": "17cc6a4fcdf/u",
            "3122nx465": "17cc6a4fce2/u",
            "688CvT395": "17cc6a4fce5/u",
            "185YTz333": "17cc6a4fce9/u",
            "432lqp577": "17cc6a4fcec/u",
            "812h94966": "17cc6a4fcef/u",
            "5517iR400": "17cc6a4fcf1/u",
            "254IBl925": "17cc6a4fcf4/u",
            "5000yl514": "17cc6a4fcf7/u",
            "213ixc683": "17cc6a4fcfa/u",
            "137EnL391": "17cc6a4fcfd/u",
            "6245EV849": "17cc6a4fd00/u",
            "510taE646": "17cc6a4fd03/u",
            "863A2u391": "17cc6a4fd06/u",
            "372jtV650": "17cc6a4fd08/u",
            "792HJS687": "17cc6a4fd0c/u",
            "396Lyp347": "17cc6a4fd0e/u",
        };
        // // user_id_data
        let arr = {};
        data1.map((user) => {
            //create new user_id
            // const new_user_id = createUniqueID('user');
            let old_user_id = user.user_id;
            let new_user_id = user_id_data[old_user_id];
            if (new_user_id != undefined) {
                console.log(new_user_id);
                const kd = data.find((k) => user_id_data[k.user_id] == new_user_id);
                let obj = {
                    user_id: new_user_id,
                    first_name: user.fname ? user.fname : "",
                    middle_name: user.mname ? user.mname : "",
                    last_name: user.lname ? user.lname : "",
                    date_of_birth: user.dob ? new Date(user.dob).getTime() : "",
                    address: user.address ? user.address : "",
                    state: user.state ? user.state : "",
                    city: user.city ? user.city : "",
                    country: user.country ? user.country : "",
                    zip_code: user.pin_zip ? user.pin_zip : "",
                    added_on: kd
                        ? kd.added_on
                            ? new Date(kd.added_on).getTime()
                            : Date.now()
                        : Date.now(),
                    kyc_type: kd ? (kd.kyc_type ? kd.kyc_type : "individual") : "",
                    doc_1_type: kd
                        ? kd.doc_1_type
                            ? kd.doc_1_type.toLowerCase()
                            : ""
                        : "",
                    doc_1_no: kd ? (kd.doc_1_no ? kd.doc_1_no : "") : "",
                    doc_2_type: kd
                        ? kd.doc_2_type
                            ? kd.doc_2_type.toLowerCase()
                            : ""
                        : "",
                    doc_2_no: kd ? (kd.doc_2_no ? kd.doc_2_no : "") : "",
                    status: kd ? (kd.status && kd.status == 1 ? kd.status : 2) : 2,
                    auditing_date: kd
                        ? kd.auditing_date
                            ? new Date(kd.auditing_date)
                            : Date.now()
                        : Date.now(),
                    auditor_msg: kd ? (kd.auditor_msg ? kd.auditor_msg : "") : "",
                    doc_1_s: "",
                    doc_1_f: "",
                    doc_1_b: "",
                    doc_2_f: "",
                };
                if (
                    user.user_id && kd
                        ? kd.status == 1
                        : false && new_user_id && new_user_id != null
                )
                    arr[new_user_id] = obj;
            }

            // console.log(kd ? kd.doc_1_type : '', kd);
        });
        KYC.insertMany(Object.values(arr))
            .then((responce) => {
                return res.json({
                    status: 200,
                    data: responce,
                });
            })
            .catch((error) => {
                return res.json({
                    status: 400,
                    data: error,
                });
            });
        // return res.json({
        //     data: Object.values(arr),
        // })
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: error.message,
        });
    }
}

async function updateAllWallet(req, res) {
    const Users = require("../models/user");
    const KYC = require("../models/pending_kyc");
    const Wallets = require("../models/wallets");
    const all_user = Users.find({}).then((data) => {
        data.map(async (user) => {
            /**
             * check if wallets are created or not
             */
            // let wallets = Wallets.findOne({ user: user.user_id });
            // if (wallets) {

            // } else {

            // }
            /**
             * check if kyc is varified or not
             */
            if (user.user_id) {
                let kyc_data = await KYC.findOne({ user_id: user.user_id });
                if (kyc_data && kyc_data.status == 1) {
                    /**
                     * first cteate wallet for the user after that update balance in btex
                     */

                    Wallets.updateOne(
                        { user: user.user_id, wallet_type: "BTEX" },
                        {
                            balance: 100,
                        }
                    )
                        .then(() => {
                            Users.updateOne(
                                { user_id: user.user_id },
                                {
                                    $set: {
                                        is_kyc_verified: 1,
                                    },
                                }
                            )
                                .then(() => {
                                    console.log("Updated: ");
                                })
                                .catch();
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } else {
                    /**
                     * create wallet only
                     */
                    // createUserWallets(user.user_id).then().catch();
                }
            }
        });
    });
}

async function sendTestingMail(req, res) {
    try {
        sendOTP("ankursingh0313@byom.de", 123456);
        return res.json({
            status: 200,
        });
    } catch (error) {
        return res.json({
            status: 400,
        });
    }
}

async function distributeAllUserReferal(req, res) {
    /**
     * fetch all users with kyc varified, and distribute their referal
     */
    const {
        getUserIdFromReferalCode,
        updateReferalhistory,
    } = require("../utils/functions");
    const Users = require("../models/user");
    const KYC = require("../models/pending_kyc");
    const Wallets = require("../models/wallets");
    const ref_income = 800;
    Users.find({})
        .then((data) => {
            if (data && Array.isArray(data) && data.length > 0) {
                data.map(async (user) => {
                    if (user) {
                        // Users.findOne({ user_id: kyc_data.user_id }).then(async (user) => {
                        // Users.updateOne({ user_id: kyc_data.user_id }, { referral_income: 0 }).then(()=>{console.log("updated")}).catch();
                        // //get parent referal
                        if (user && user.parent_ref_code) {
                            const parent_user_id = await getUserIdFromReferalCode(
                                user.parent_ref_code
                            );
                            if (parent_user_id) {
                                //get user wallet from user_id
                                Wallets.findOne({
                                    user: parent_user_id,
                                    wallet_type: "BTEX",
                                }).then((wallets) => {
                                    if (wallets) {
                                        // deposit riward btex balance
                                        Wallets.updateOne(
                                            { user: parent_user_id, wallet_type: "BTEX" },
                                            {
                                                $set: {
                                                    balance: wallets.balance
                                                        ? parseFloat(wallets.balance) +
                                                        parseFloat(ref_income)
                                                        : parseFloat(ref_income),
                                                },
                                            }
                                        ).then(() => {
                                            /**
                                             * find parent user id user_data
                                             */
                                            Users.findOne({ user_id: parent_user_id }).then(
                                                (user_data) => {
                                                    if (user_data) {
                                                        /**
                                                         * update user_data
                                                         */
                                                        Users.updateOne(
                                                            { user_id: parent_user_id },
                                                            {
                                                                $set: {
                                                                    referral_income: user_data.referral_income
                                                                        ? parseFloat(user_data.referral_income) +
                                                                        parseFloat(ref_income)
                                                                        : parseFloat(ref_income),
                                                                },
                                                            }
                                                        ).then(async (data) => {
                                                            let history_obj = {
                                                                user_id: parent_user_id,
                                                                _from: user.user_id,
                                                                commission: parseFloat(ref_income),
                                                                time_stamp: Date.now(),
                                                                wallet_type: "BTEX",
                                                            };
                                                            await updateReferalhistory(history_obj);
                                                            console.log(
                                                                "updated: user> ",
                                                                parent_user_id,
                                                                user.user_id
                                                            );
                                                        });
                                                    }
                                                }
                                            );
                                        });
                                    } else {
                                        return false;
                                    }
                                });
                            }
                        }
                        // });
                    }
                });
            }
        })
        .catch((error) => { });
}
async function removeAllusersBalance(req, res) {
    const Users = require("../models/user");
    const Wallets = require("../models/wallets");
    let count = 0;
    try {
        Users.find({}).then((users) => {
            users.map((user) => {
                Wallets.findOne({ user: user.user_id, wallet_type: "BTEX" }).then(
                    (wallet) => {
                        if (wallet) {
                            Wallets.updateOne(
                                { user: user.user_id, wallet_type: "BTEX" },
                                {
                                    $set: {
                                        balance: 0,
                                    },
                                }
                            ).then(() => {
                                console.log("Updated", ++count);
                            });
                        }
                    }
                );
            });
        });
    } catch (error) {
        return res.json({ error: error.message });
    }
}
async function updateGraphData(req, res) {
    const { injectInGraph } = require("../utils/functions");
    try {
        let ohlcvt = await injectInGraph("usdt", "inr", 5, 1);
        return res.json({
            status: 200,
            data: ohlcvt,
        });
    } catch (error) {
        return res.json({
            status: 400,
            error: error.message,
        });
    }
}
async function getSocketData(req, res) {
    try {
        const SellStack = require("../models/sell_stack");
        const BuyStack = require("../models/buy_stack");
        const TradeHistory = require("../models/trade_history");
        let limit = 100;
        let sstk = await SellStack.aggregate([
            {
                $match: { order_status: { $in: [0] }, order_type: "exc" },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: limit,
            },
            {
                $group: {
                    _id: "$currency_type",
                    orders: {
                        $push: {
                            currency_type: "$currency_type",
                            compare_currency: "$compare_currency",
                            volume: "$volume",
                            total_sell: "$total_sell",
                            raw_price: "$raw_price",
                            total_executed: "$total_executed",
                        },
                    },
                },
            },
        ]);
        let bstk = await BuyStack.aggregate([
            {
                $match: { order_status: { $in: [0] }, order_type: "exc" },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: limit,
            },
            {
                $group: {
                    _id: "$currency_type",
                    orders: {
                        $push: {
                            currency_type: "$currency_type",
                            compare_currency: "$compare_currency",
                            volume: "$volume",
                            total_buy: "$total_buy",
                            raw_price: "$raw_price",
                            total_executed: "$total_executed",
                        },
                    },
                },
            },
        ]);
        let thst = await TradeHistory.aggregate([
            {
                $match: { trade_type: "exc" },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: limit,
            },
            {
                $group: {
                    _id: "$currency_type",
                    orders: {
                        $push: {
                            currency_type: "$currency_type",
                            compare_currency: "$compare_currency",
                            volume: "$volume",
                            trade_date: "$trade_date",
                            price: "$price",
                        },
                    },
                },
            },
        ]);

        let sstkarr = await getFilteredArray(sstk);
        let os = createArr(sstkarr);
        let sbstkarr = await getFilteredArray(bstk);
        let ob = createArr(sbstkarr);
        let sthstarr = await getFilteredArray(thst, true);
        // let th = createArr(sthstarr);
        return res.json({
            status: 200,
            data: { os, ob, sthstarr },
        });
    } catch (error) {
        console.log("error: ", error);
        return res.json({
            status: 400,
        });
    }
}
function reduceData(arr) {
    const resu = Object.values(
        arr.reduce(
            (acc, { raw_price, volume }) => (
                ((acc[raw_price] = acc[raw_price] || { raw_price, volume: 0 }).volume +=
                    parseFloat(volume)),
                acc
            ),
            {}
        )
    );
    return resu;
}
function createArr(obj) {
    let newObj = {};
    Object.keys(obj).map((key) => {
        let dt = reduceData(obj[key]);
        if (obj[key].length > 0)
            newObj[key] = add_currency_property(dt, obj[key][0]);
    });
    return newObj;
}
function add_currency_property(arr, node) {
    let ar = [];
    arr.map((a) => {
        let obj = {
            raw_price: a.raw_price,
            volume: a.volume,
            currency_type: node.currency_type,
            compare_currency: node.compare_currency,
        };
        ar.push(obj);
    });
    return ar;
}
async function getFilteredArray(array, history = false) {
    let arob = {};
    let a1 = array.map(async (d) => {
        let a2 = d.orders.map(async (d1) => {
            let key = d1.currency_type + d1.compare_currency;
            if (!arob[key]) {
                arob[key] = [];
            }
            if (history) {
                let d2 = {
                    currency_type: d1.currency_type,
                    compare_currency: d1.compare_currency,
                    raw_price: d1.price,
                    volume: d1.volume,
                    timestamp: d1.trade_date,
                };
                arob[key].push(d2);
            } else {
                arob[key].push(d1);
            }
        });
        await Promise.all(a2);
    });
    await Promise.all(a1);
    return arob;
}


// async function getTradeHistory(user_id, start_time, end_time) {
//   const TradeHistory = require("../models/trade_history");
//   try {
//     if (user_id) {
//       let trade_history = TradeHistory.find({
//         user_id: user_id,
//         createdAt: { $gt: ISODate(new Date(start_time).toISOString()) },
//         createdAt: { $lt: ISODate(new Date(end_time).toISOString()) },
//       });
//       return trade_history ? trade_history : [];
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.log("Error in getTradeHistory: ", error.message);
//     return [];
//   }
// }

async function getCurrentSell(user_id, start_time, end_time) {
    const SellStack = require("../models/sell_stack");
    const TradeHistory = require("../models/trade_history");
    try {
        if (user_id) {
            let sell_stacks = await SellStack.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time).toISOString()) },
                createdAt: { $lt: (new Date(end_time).toISOString()) },
            });
            if (sell_stacks && sell_stacks.length > 0) {
                let trade_h = [];
                let a = sell_stacks.map(async (d) => {
                    if (d) {
                        let trades = await TradeHistory.find({
                            sell_order_id: d.order_id,
                        });
                        let obj = {
                            symbol: d.currency_type,
                            compare_currency: d.compare_currency,
                            createdAt: d.createdAt,
                            type: "Sell",
                            info: d,
                            trades: trades
                        }
                        trade_h.push(obj);
                    }
                })
                await Promise.all(a);
                return trade_h;
            } else {
                return [];
            }
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getCurrentSell: ", error.message);
        return [];
    }
}

async function getCurrentBuy(user_id, start_time, end_time) {
    const BuyStack = require("../models/buy_stack");
    const TradeHistory = require("../models/trade_history");
    try {
        if (user_id) {
            let buy_stacks = await BuyStack.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time)) },
                createdAt: { $lt: (new Date(end_time)) },
            });
            if (buy_stacks && buy_stacks.length > 0) {
                let trade_h = [];
                let a = buy_stacks.map(async (d) => {
                    if (d) {
                        let trades = await TradeHistory.find({
                            buy_order_id: d.order_id,
                        });
                        let obj = {
                            symbol: d.currency_type,
                            compare_currency: d.compare_currency,
                            createdAt: d.createdAt,
                            type: "Buy",
                            info: d,
                            trades: trades
                        }
                        trade_h.push(obj);
                    }
                })
                await Promise.all(a);
                return trade_h;
            } else {
                return [];
            }
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getCurrentBuy: ", error.message);
    }
}

async function getDeposithistory(user_id, start_time, end_time) {
    const DepositHistory = require("../models/deposite_history");
    try {
        if (user_id) {
            let deposit_history = await DepositHistory.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time).toISOString()) },
                createdAt: { $lt: (new Date(end_time).toISOString()) },
            });
            return deposit_history ? deposit_history : [];
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getDeposithistory: ", error.message);
    }
}

async function getWithdrawHistory(user_id, start_time, end_time) {
    const WithdrawHistory = require("../models/withdraw_history");
    try {
        if (user_id) {
            let withdraw_history = await WithdrawHistory.find({
                user_id: user_id,
                createdAt: { $gt: (new Date(start_time).toISOString()) },
                createdAt: { $lt: (new Date(end_time).toISOString()) },
            });
            return withdraw_history ? withdraw_history : [];
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error in getWithdrawHistory: ", error.message);
    }
}

async function getUserActivity(req, res) {
    console.log("Hi")
    try {
        const user_id = req.body && req.body.user_id ? req.body.user_id : undefined;
        if (user_id) {
            let currencttime = new Date();
            let thisyear = currencttime.getFullYear();
            let thismonth = currencttime.getMonth();
            let thisdate = currencttime.getDate();

            let starttime = new Date(
                `${thismonth}-${thisdate}-${thisyear}`
            ).getTime();
            let endtime = new Date().getTime();
            const start_time =
                req.body && req.body.start_time ? req.body.start_time : starttime;
            const end_time = req.body && req.end_time ? req.body.end_time : endtime;
            if (start_time < end_time) {
                let sell_stack = await getCurrentSell(user_id, start_time, end_time);
                let buy_stack = await getCurrentBuy(user_id, start_time, end_time);
                let deposit_history = await getDeposithistory(user_id, start_time, end_time);
                let withdraw_history = await getWithdrawHistory(user_id, start_time, end_time);
                let merged_array = [...sell_stack, ...buy_stack, ...deposit_history, ...withdraw_history];
                let sorted_array = merged_array.sort(function (b, a) {
                    return (a.createdAt < b.createdAt) ? -1 : ((a.createdAt > b.createdAt) ? 1 : 0);
                });
                return res.json({
                    status: 200,
                    data: sorted_array,
                })
            } else {
                return res.json({
                    status: 400,
                    message: "Start time must be before than end time",
                });
            }
        } else {
            return res.json({
                status: 400,
                message: "Invalid request!",
            });
        }
    } catch (error) {
        console.log("Error in getUseractivity: ", error.message);
        return res.json({
            status: 400,
            message: "something went wrong, please try again!",
        });
    }
}


async function updateBulkLocked(req, res) {
    const SellStack = require("../models/sell_stack");
    const BuyStack = require("../models/buy_stack");
    const Wallets = require("../models/wallets");
    try {
        await SellStack.deleteMany({});
        await BuyStack.deleteMany({});
        await Wallets.updateMany({ locked: { $ne: 0 } }, {
            $set: {
                locked: 0
            }
        })
        return res.json({
            status: 200
        })
    } catch (error) {
        console.log("Error: ", error);
        return res.json({
            status: 400,
            message: error.message
        })
    }
}
async function deleteWallet(req, res) {
    const Wallets = require("../models/wallets");
    try {
        let symbol = "ATOM";
        await Wallets.deleteMany({ wallet_type: symbol })
        let w = await Wallets.find({ wallet_type: symbol });
        return res.json({
            w
        })
    } catch (error) {
        console.log("Error from delete wallet", error);
        return res.json({
            status: 400,
            error
        })
    }
}
async function getcmcohva(req, res) {
    try {
        let ohva = await getCMCOHVA('btex', 'inr');
        if (ohva) {
            return res.json({
                status: 200,
                message: {
                    ohva
                }
            })
        } else {
            return res.json({
                status: 400,
                error: true,
                message: 'Not found'
            })
        }
    } catch (error) {
        console.log("Error from getcmcohva: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: error.message
        })
    }
}

/**
 * ~get cmc ohva
 */
async function getCMCOHVA(currency_type, compare_currency) {
    try {
        let now = new Date();
        let today = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        let yesterday = new Date(today.getTime() - 86400000);
        let daybeforeyesterday = new Date(yesterday.getTime() - 86400000);

        /**
         * ?get yesterday's highest price
         */
        let yesterdays_h = await getHighest(currency_type, compare_currency, yesterday, today);
        /**
         * ?get yesterday's lowest price
         */
        let yesterdays_l = await getLowest(currency_type, compare_currency, yesterday, today);
        /**
         * ?get yesterday's total volume
         */
        let yesterdays_v = await getTotalVolume(currency_type, compare_currency, yesterday, today);
        /**
         * ?get yesterday's closing price
         */
        let yesterdays_c = await getClosingPrice(currency_type, compare_currency, yesterday, today);
        /**
         * *get today's highest price
         */
        let todays_h = await getHighest(currency_type, compare_currency, today, new Date());
        /**
         * *get today's lowest price
         */
        let todays_l = await getLowest(currency_type, compare_currency, today, new Date());
        /**
         * *get today's total volume
         */
        let todays_v = await getTotalVolume(currency_type, compare_currency, today, new Date());
        /**
         * *get today's closing price
         */
        let todays_c = await getClosingPrice(currency_type, compare_currency, today, new Date());

        /**
         * ^ today's average change in percentage
         */
        let todays_dif = todays_c - yesterdays_c;
        let todays_pc = yesterdays_c != 0 ? parseFloat(((todays_dif / yesterdays_c) * 100).toFixed(2)) : 0;

        return {
            yesterdays_h,
            yesterdays_l,
            yesterdays_v,
            yesterdays_c,
            todays_h,
            todays_l,
            todays_v,
            todays_c,
            todays_pc
        };
    } catch (error) {
        console.log("Error from getcmcohva: ", error.message);
        return undefined;
    }
}

/**
 * ! get highest price in interval 
 */
async function getHighest(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const highest_price = await TradeHistory.find({
                currency_type: currency_type.toLowerCase(),
                compare_currency: compare_currency.toLowerCase(),
                createdAt: {
                    $gt: start_time,
                    $lt: end_time
                }
            }).sort({ price: -1 }).limit(1);
            if (highest_price && highest_price.length > 0) {
                return highest_price[0].price
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getHighest: ", error.message);
        return 0;
    }
}
/**
 * ! get lowest price in interval 
 */
async function getLowest(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const lowest_price = await TradeHistory.find({
                currency_type: currency_type.toLowerCase(),
                compare_currency: compare_currency.toLowerCase(),
                createdAt: {
                    $gt: start_time,
                    $lt: end_time
                }
            }).sort({ price: 1 }).limit(1);
            if (lowest_price && lowest_price.length > 0) {
                return lowest_price[0].price
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getLowest: ", error.message);
        return 0;
    }
}
/**
 * ! get total volume in interval 
 */
async function getTotalVolume(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const total_volume = await TradeHistory.aggregate([
                {
                    $match: {
                        currency_type: currency_type,
                        compare_currency: compare_currency,
                        createdAt: {
                            $gt: start_time,
                            $lt: end_time
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$volume"
                        }
                    }
                },
            ]);

            if (total_volume && total_volume.length > 0) {
                return total_volume[0].total
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getTotalVolume: ", error.message);
        return 0;
    }
}
/**
 * ! get closing price in interval 
 */
async function getClosingPrice(currency_type, compare_currency, start_time, end_time) {
    const TradeHistory = require('../models/trade_history');
    try {
        let s_time = start_time.getTime();
        let e_time = end_time.getTime();
        if (currency_type && compare_currency && s_time && e_time) {
            const closing_price = await TradeHistory.find({
                currency_type: currency_type.toLowerCase(),
                compare_currency: compare_currency.toLowerCase(),
                createdAt: {
                    $gte: start_time,
                    $lt: end_time
                }
            }).sort({ createdAt: -1 }).limit(1);
            if (closing_price && closing_price.length > 0) {
                return closing_price[0].price
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.log("Error from getClosingPrice: ", error.message);
        return 0;
    }
}
async function deleteData(req, res) {
    const Wallets = require("../models/trade_history");
    try {
        await Wallets.deleteMany({ price: { $gte: 1 }, currency_type: 'btex' });
        return res.json({
            status: 200,
            message: "Deleted all"
        })
    } catch (error) {
        console.log("Erro from delete data: ", error);
        return res.json({
            status: 400,
            message: error.message
        })
    }
}
async function createOHLCFromDB(req, res) {
    // const d3 = require("d3-node");
    var d3 = require("d3");
    const TradeHistory = require('../models/trade_history');
    const SupportedCurrency = require('../models/suppoted_currency');
    let limit = 3000;
    try {
        let supported_tokens = await SupportedCurrency.find({ token_type: 'self' }, "symbol");
        let st = supported_tokens.map(function (item) { return item["symbol"].toLowerCase(); });
        let thst = await TradeHistory.aggregate([
            {
                $match: {
                    currency_type: {
                        $in: st
                    }
                }
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $limit: limit,
            },
            {
                $group: {
                    _id: {
                        currency_type: "$currency_type", compare_currency: "$compare_currency"
                    },
                    orders: {
                        $push: {
                            volume: "$volume",
                            price: "$price",
                            trade_date: "$trade_date",
                            created_at: "$createdAt",
                        },
                    },
                },
            },
        ]);
        let final_data = {};
        let a = thst.map(async (dt) => {
            if (dt && dt._id) {
                let key = dt._id.currency_type.toUpperCase() + '' + dt._id.compare_currency.toUpperCase();
                if (!final_data[key]) {
                    final_data[key] = {
                        o: [],
                        h: [],
                        l: [],
                        c: [],
                        v: [],
                        t: [],
                        s: ''
                    };
                }
                // console.log("thst: ", dt._id)
                dt.orders.sort((a, b) => d3.ascending(a.created_at, b.created_at));
                // var result = [];
                var format = d3.time.format("%Y-%m-%d %H:%M:%S");
                dt.orders.forEach(d => d.trade_date = format(new Date(parseInt(d.trade_date))));
                // console.log("dt.orders: ", dt.orders);
                var allDates = [...new Set(dt.orders.map(d => (d.trade_date)))];
                // console.log("TDATE: ", allDates);
                allDates.forEach(d => {
                    var tempObject = {};
                    var filteredData = dt.orders.filter(e => e.trade_date === d);
                    // console.log("filteredData", filteredData, "TITU", filteredData[0]);
                    // tempObject.t = new Date(d).getTime();
                    final_data[key].t.push(new Date(d).getTime()/1000);
                    // tempObject.o = filteredData[0].price;
                    final_data[key].o.push(filteredData[0].price);
                    // tempObject.c = filteredData[filteredData.length - 1].price;
                    final_data[key].c.push(filteredData[filteredData.length - 1].price);
                    // tempObject.h = d3.max(filteredData, e => e.price);
                    final_data[key].h.push(d3.max(filteredData, e => e.price));
                    // tempObject.l = d3.min(filteredData, e => e.price);
                    final_data[key].l.push(d3.min(filteredData, e => e.price));
                    // tempObject.v = filteredData.reduce((a, b) => +a + +b.volume, 0);
                    final_data[key].v.push(filteredData.reduce((a, b) => +a + +b.volume, 0));
                    tempObject.s = 'ok';
                    final_data[key].s = 'ok';
                    // result.push(tempObject);
                });
            }
        })
        await Promise.all(a);
        return res.json({
            final_data
        })
        // console.log("result: ", final_data);
    } catch (error) {
        console.log("Error: ", error)
        return res.json({
            error
        })
    }
}
async function a(req, res) {
    try {
        const Users = require('../models/user');
        let d = await Users.aggregate([
            {
                $limit: 1
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    as: {$sum: 1}
                }
            }
        ])
        return res.json({
            d
        })
    } catch (err) {
        console.log("Err: ", err)
    }
}

async function createWallet(req, res) {
    const supported_currency = require("../models/supported_currency");
    const {
        createETHAddress,
        createTRXAddress, createSOLAddress } = require("../utils/functions.walletsv2");
    const wallet = require("../models/walletsv2");
    try{
        const supportedCurrency = await supported_currency.find({});
        const ethreumdata = supportedCurrency.filter((item)=>item.blockchain =='ethereum');
        const binancedata = supportedCurrency.filter((item)=>item.blockchain =='binance');
        const trxdata = supportedCurrency.filter((item)=>item.blockchain =='trx');
        let trx_addr = await createTRXAddress();
        let eth_addr = await createETHAddress();
        let sol_addr = await createSOLAddress();
        let eth_wallet = [];
        let bnb_wallet = [];
        let trx_wallet = [];
        let poly_wallet = [];
        sol_wallet = [];
        ethreumdata.map((item)=>{
            eth_wallet.push({
                wallet_type:item.symbol,
                contract_type:item.contract_type,
                contract_address:item.contract_address

            })
        })
        binancedata.map((item)=>{
            bnb_wallet.push({
                wallet_type:item.symbol,
                contract_type:item.contract_type,
                contract_address:item.contract_address

            })
        })
        trxdata.map((item)=>{
            trx_wallet.push({
                wallet_type:item.symbol,
                contract_type:item.contract_type,
                contract_address:item.contract_address

            })
        })


        let wallet_data = {
            user_id:"user_id"+Date.now(),
            blockchainData:[
                {
                    type:"ETH",
                    subcurrencyData:[
                        {
                            private_key:eth_addr.privateKey,
                            wallet_address:eth_addr.address,
                            blockchain:'ethereum',
                            walletsData :eth_wallet
                            
                        },
                        {
                            private_key:eth_addr.privateKey,
                            wallet_address:eth_addr.address,
                            blockchain:'binance',
                            walletsData :bnb_wallet
                            
                        }
                    ]

                },
                {
                    type:"TRX",
                    subcurrencyData:[
                        {
                            private_key:trx_addr.privateKey,
                            wallet_address:trx_addr.address,
                            blockchain:'TRX',
                            walletsData :trx_wallet 
                        }
                    ]
                }
            ]
        }
        const result = await wallet.create(wallet_data);
        // const result = await wallet.findOne({user_id:'user_id1654682514659'});
        // if(result.blockchainData[0].type=='ETH') {
        //     rss = result.blockchainData[0].subcurrencyData[0].walletsData[0].balance
        //         upres = await wallet.updateOne({user_id:'user_id1654682514659'}, {
        //           $set:{
        //             "blockchainData.0.subcurrencyData.0.walletsData.0.balance":rss+200
        //           }
        //       });
        // }
        return res.json({
            status:200,
            result,
            message:"success"
        })
    }catch(error) {
        console.log("Error in testing.js>createWallet: ", error.message)
        return res.json({
            status:400,
            message:"Somthing went Wrong!"
        })
    }
}
async function createOldUserWallet(req, res) {

}

async function updateWallet(symbol, type, blockchain, contract_type, contract_address, user_id) {
    const supported_currency = require("../models/supported_currency");
      const wallet = require("../models/walletsv2");
    try{
        const result = await wallet.findOne({user_id:user_id});
        let eth_wallet = [];
        let bnb_wallet = [];
        let trx_wallet = [];
        let type = type;
        let blockchain = blockchain;
        let contract_type = contract_type;
        let contract_address = contract_address;
        let symbol = symbol;
        if(type == 'ETH') {
            if(blockchain == 'ethereum') {
                trx_wallet = result.blockchainData[1].subcurrencyData;
                bnb_wallet = result.blockchainData[0].subcurrencyData[1];
                let private_key = result.blockchainData[0].subcurrencyData[0].private_key;
                let wallet_address = result.blockchainData[0].subcurrencyData[0].wallet_address;
                eth_wallet = result.blockchainData[0].subcurrencyData[0].walletsData;
                eth_wallet.push({
                    wallet_type:symbol,
                    contract_type:contract_type,
                    contract_address:contract_address
                })
                let blockchainData = [
                    {
                        type:"ETH",
                        subcurrencyData:[
                            {
                                private_key:private_key,
                                wallet_address:wallet_address,
                                blockchain:'ethereum',
                                walletsData :eth_wallet
                                
                            },
                            bnb_wallet
                        ]
    
                    },
                    {
                        type:"TRX",
                        subcurrencyData:trx_wallet
                    }
                ]
                await wallet.updateOne({_id: result._id}, {
                    $set:{
                        blockchainData:blockchainData 
                    }
                })
            } else if(blockchain == 'binance') {
                trx_wallet = result.blockchainData[1].subcurrencyData;
                eth_wallet = result.blockchainData[0].subcurrencyData[0];
                let private_key = result.blockchainData[0].subcurrencyData[1].private_key;
                let wallet_address = result.blockchainData[0].subcurrencyData[1].wallet_address;
                bnb_wallet = result.blockchainData[0].subcurrencyData[1].walletsData;
                bnb_wallet.push({
                    wallet_type:symbol,
                    contract_type:contract_type,
                    contract_address:contract_address
                })
                let blockchainData = [
                    {
                        type:"ETH",
                        subcurrencyData:[
                            eth_wallet, 
                            {
                                private_key:private_key,
                                wallet_address:wallet_address,
                                blockchain:'binance',
                                walletsData :bnb_wallet
                            }
                           
                        ]
    
                    },
                    {
                        type:"TRX",
                        subcurrencyData:trx_wallet
                    }
                ]
                await wallet.updateOne({_id: result._id}, {
                    $set:{
                        blockchainData:blockchainData 
                    }
                })
            } else if(blockchain == 'polygon') {

            }
        } else if(type == 'TRX') {
            eth_wallet = result.blockchainData[0].subcurrencyData;
            let private_key = result.blockchainData[1].subcurrencyData[0].private_key;
            let wallet_address = result.blockchainData[1].subcurrencyData[0].wallet_address;
            trx_wallet = result.blockchainData[1].subcurrencyData[0].walletsData;
            trx_wallet.push({
                wallet_type:symbol,
                contract_type:contract_type,
                contract_address:contract_address
            })
            let blockchainData =[
                {
                    type:"ETH",
                    subcurrencyData:eth_wallet

                },
                {
                    type:"TRX",
                    subcurrencyData:[
                        {
                            private_key:private_key,
                            wallet_address:wallet_address,
                            blockchain:'TRX',
                            walletsData :trx_wallet 
                        }
                    ]
                }
            ]
            await wallet.updateOne({_id: result._id}, {
                $set:{
                    blockchainData:blockchainData 
                }
            })
        } else if(type == "SOL") {

        }
       
        // if(result.blockchainData[0].type=='ETH') {
        //     rss = result.blockchainData[0].subcurrencyData[0].walletsData[0].balance
        //         upres = await wallet.updateOne({user_id:'user_id1654682514659'}, {
        //           $set:{
        //             "blockchainData.0.subcurrencyData.0.walletsData.0.balance":rss+200
        //           }
        //       });
        // }
        return res.json({
            status:200,
            result,
            message:"success"
        })
    }catch(error) {
        console.log("Error in testing.js>createWallet: ", error.message)
        return res.json({
            status:400,
            message:"Somthing went Wrong!"
        })
    }
}
module.exports = {
    createSellOrderStack,
    createBuyOrderStack,
    createOrderHistory,
    fetchUserInchunks,
    getH,
    getName,
    findWalletsFromContractAddress,
    fetchJsonData,
    fetchJsonData1,
    sendTestingMail,
    updateAllWallet,
    distributeAllUserReferal,
    removeAllusersBalance,
    updateGraphData,
    getSocketData,
    getUserActivity,
    updateBulkLocked,
    deleteWallet,
    getcmcohva,
    deleteData,
    createOHLCFromDB,
    a,
    createWallet,
    updateWallet
    // uploadImage
};
