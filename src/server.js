//===============================================================
//
//  ##  ##     ##  ####    #####  ##    ##          ##   ####
//  ##  ####   ##  ##  ##  ##      ##  ##           ##  ##
//  ##  ##  ## ##  ##  ##  #####    ####            ##   ###
//  ##  ##    ###  ##  ##  ##      ##  ##       ##  ##     ##
//  ##  ##     ##  ####    #####  ##    ##  ##   ####   ####
//
//===============================================================

const express = require("express");
const app = express();
const env = require("dotenv");
const cors = require("cors");
// const winston = require('winston');
// const expressWinston = require('express-winston');
const fileupload = require("express-fileupload");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const userRoutes = require("./router/auth");
const userDataRoute = require("./router/user");
const currencyRoutes = require("./router/Currency");
const orderRoutes = require("./router/orders");
const tradeRoutes = require("./router/history");
const testing = require("./router/testing");
const chart = require("./router/chart");
const hello = require("./router/hello");
const wallets = require("./router/wallets");
const settings = require("./router/settings");
const banking = require("./router/banking");
const kyc = require("./router/kyc");
const website = require("./router/website");
const admin = require("./router/admin");
const History = require("./models/deposite_history");

env.config();
const inrx = `mongodb+srv://bsxg:bsxg4176@cluster0.10imbue.mongodb.net/bsxgapp?retryWrites=true&w=majority`;

mongoose
  .connect(inrx, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  });

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(fileupload({}));
// app.use(expressWinston.logger({
//     transports: [
//         new winston.transports.Console(),
//         new winston.transports.File({ filename: 'error.log', level: 'error' }),
//         new winston.transports.File({ filename: 'combined.log' }),
//     ],
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//     ),
//     meta: false,
//     msg: "HTTP {{req.method}} {{req.url}}",
//     expressFormat: true,
//     colorize: false,
//     ignoreRoute: function (req, res) { return false; }
// }));
// app.use(express.static('public'));
app.use("/images", express.static(__dirname + "/d/images"));
// API
app.use("/api", userRoutes);
app.use("/api", userDataRoute);
app.use("/api", currencyRoutes);
app.use("/api", orderRoutes);
// app.use('/api', orderRoutes);
app.use("/api", tradeRoutes);
app.use("/api", testing);
app.use("/api", chart);
app.use("/api", hello);
app.use("/api", wallets);
app.use("/api", settings);
app.use("/api", kyc);
app.use("/api", banking);
app.use("/api", website);
app.use("/api", admin);


app.listen(5000, () => {
  console.log(`server is running on port ${5000}`);
});

const fetch = require("cross-fetch");
/**
 * Blockchain event
 */

const { getPromoter } = require("./helpers/helpers");
const { sendROI } = require("./router/mlm");
const { initApp, activateBooster, findparent, findPomoter } = require("./router/mlmapp");
const mainnet =
  "wss://mainnet.infura.io/ws/v3/d5bcba9decc042879125ca752dc4637b";
const ropsten_provider_url =
  "wss://ropsten.infura.io/ws/v3/d5bcba9decc042879125ca752dc4637b";
const rinkibai =
  "wss://rinkeby.infura.io/ws/v3/d5bcba9decc042879125ca752dc4637b";

/**
 * create a socket server client
 * check for cmc data
 * compare and merge with supported surrency
 * formate in an appropriate way
 * update in socket data
 * emmit and event
 *
 */
//connecting with socket server client
// const socket = createSocketClient("kujgwvfq-z-ghosttown-z-1fhhup0p6");
var cmc_last_time = Date.now();
const cmc_interval = 5 * 60; //secounds
setInterval(async () => {
  if ((Date.now() - cmc_last_time) / 1000 >= cmc_interval) {
    let fs = require('fs');
    cmc_last_time = Date.now();
    const query_coin_symbol_array = [
      "eth",
      "bnb",
      "trx"
    ];
    var coin_symbols = query_coin_symbol_array.join(",");
    var conver_currency = "usdt";
    const final_third_party_api_url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${coin_symbols}&convert=${conver_currency}`;
    // console.log(final_third_party_api_url);
    try {
      const result = await fetch(final_third_party_api_url, {
        headers: {
          "Content-Type": "Application/json",
          "X-CMC_PRO_API_KEY": "4200c3bd-c7e1-4bad-9b2d-b54f248855a6", //c@byom.de
        },
      });
      var data = await result.json();
      if (data.status.error_code) {
        console.log("Err1");
      } else {
        data = data.data;
        var coins2 = await formateData(data);
        let insertData = JSON.stringify(coins2);
        fs.writeFile(__dirname + `/json/latest_coin_price.json`, insertData, 'utf8', (d) => {
          console.log(d);
        });
      }
    } catch (error) {
      console.log("ERR", error);
    }
  }
}, 5 * 1000);
// for CMC
async function formateData(data) {
  let coins = new Array();
  for (coin in data) {
    let c = {};
    c.id = data[coin].id;
    c.symbol = data[coin].symbol;
    c.name = data[coin].name;
    c.current_price_usdt = data[coin]["quote"]["USDT"]["price"];
    c.price_change_percentage_1h_usdt = Number(
      Math.abs(data[coin]["quote"]["USDT"]["percent_change_24h"])
    ).toFixed(2);
    if (data[coin]["quote"]["USDT"]["percent_change_24h"] < 0)
      c.direction_inr = "down";
    else c.direction_inr = "up";
    c.icon = `https://s2.coinmarketcap.com/static/img/coins/64x64/${c.id}.png`;
    c.volume_24h = data[coin]["quote"]["USDT"]["volume_change_24h"].toFixed(2);
    coins.unshift(c);
  }
  return coins;
}

//getPromoter("BSXG10001")
// initApp();
//activateBooster("BSXG183293b5b41/u");
//findparent("BSXG1834d5ca8c9").then((r)=>{console.log(r)}).catch((error)=>{console.log(error.message)});

var cron = require('node-cron');

cron.schedule('* * * * *', async () => {
  const UserModel = require("./models/user");
  const InvestmentModel = require("./mlm_models/investment");
  const IncomeModel = require("../mlm_models/income_history");
  const PackageModel = require("./mlm_models/packages");
  const investments = await InvestmentModel.aggregate([
    { $match: { invest_type: 1, is_roi_expired: false } },
    {
      $lookup: {
        from: "packages",
        localField: "package_id",
        foreignField: "_id",
        as: "package_info",
      }
    }
  ]);
  investments.map(async (invest) => {
    const user = await UserModel.find({ user_id: invest.user_id });
    const package = await PackageModel.find({ _id: invest.package_id });
    const roi = (package.amount * invest.roi_amount) / 100;
    (await InvestmentModel.updateOne({ _id: invest._id }, { $inc: { roi_days: 1, roi_paid: roi } })).then(async (r) => {
      UserModel.updateOne({ user_id: invest.user_id }, { $inc: { income_wallet: roi } }).then((rs) => {
        IncomeModel.create({ user_id: invest.user_id, income_from: "", amount: roi, income_type: "roi" });
      })
    })
  })
  console.log(investments);
});


/* app.get("/getlevls", async(req, res)=> {
  const User = require("./models/user")
  try{
    const user_data = await User.findOne({user_id:'BSXG710734'});
    let leveldata = await findPomoter(user_data.user_id);
    return res.json({
      status:200,
      leveldata
    })
      
  }catch(error){
    return res.json({
      status:400,
      message:"failed"
    })
  }
}) */