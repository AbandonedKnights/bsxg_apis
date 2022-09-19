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


app.listen(5000, () => {
  console.log(`server is running on port ${5000}`);
});

/**
 * Socket Server Code
 */
const { Server } = require("socket.io");
const { createServer } = require("http");
const uuid = require("uuid");
const { isValidUser } = require("./utils.socket/validator");
const {
  getRoomByAccessToken,
  getArrayFromMapObjectArray,
  emmitPingToRoom,
  fetchCoinData,
  fetchCoinOHLC,
  emmitPing,
} = require("./utils.socket/functions");
const {
  countWallets,
  getWalletsFromRange,
  checkForDeposit,
  updateAdminWallet,
} = require("./utils.socket/wallets.functions");
const mWallets = require("./models/wallets");
const httpServer = createServer(app);
const fetch = require("cross-fetch");
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "REQUEST"],
  },
});
const REFRESS_IN_MINUTES = 1;
const clients = new Map();
const sell_order_stack = new Map();
const buy_order_stack = new Map();
const order_history = new Map();
const CURRENCY_LIST = ["BTC", "TRX"];
const COMPARE_CURRENCY_LIST = ["INR", "BTC"];
const supported_coins = new Map();
const ohlc_data = new Map();
var cmc = [];
var buy = [];
var sell = [];
var th = [];
/**
 *  client code to send credentials
 *    const socket = io({
 *      auth: {
 *        token: "abc"
 *      }
 *    });
 */
const server_time = {
  ping: { time: new Date(), interval: 1 },
  coin: { time: new Date(), interval: 1 * 60 * 24 * 1 },
  coin_history: { time: new Date(), interval: 10 },
};

io.use((socket, next) => {
  if (isValidUser(socket)) {
    // console.log("valid access token: ", { "access_token": socket.handshake.auth.token, "id": socket.id });
    next();
  } else {
    // console.log("invalid access token: ", { "access_token": socket.handshake.auth.token, "id": socket.id  })
    next(new Error("invalid request"));
  }
});
// check connection error
io.engine.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

/**
 * Blockchain event
 */

const PendingTransaction = require("./models/pending_transaction");
const AdminWallet = require("./models/wallet_cold");
const { getSupportedCurrency } = require("./controller/wallets");
const { createSocketClient } = require("./utils/functions.socket");
const { storeOHLCCustom } = require("./utils/functions.chart");
const { getCMCOHVA, getHighest, getLowest } = require("./utils/functions");
const { getPromoter } = require("./helpers/helpers");
const { sendROI } = require("./router/mlm");
const { initApp, activateBooster, findparent } = require("./router/mlmapp");
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
const cmc_interval = 5*60; //secounds
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
        fs.writeFile(__dirname+`/json/latest_coin_price.json`, insertData, 'utf8', (d) => {
          console.log(d);
      });
      }
    } catch (error) {
      console.log("ERR", error);
    }
  }
}, 5*1000);
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
    c.icon =`https://s2.coinmarketcap.com/static/img/coins/64x64/${c.id}.png`;
    c.volume_24h = data[coin]["quote"]["USDT"]["volume_change_24h"].toFixed(2);
    coins.unshift(c);
  }
  return coins;
}

// connection event
io.on("connection", (socket) => {
  let access_token = socket.handshake.auth.token;
  let room_name = getRoomByAccessToken(access_token);
  socket.join(room_name);

  clients.set(socket.id, access_token);

  // console.log("A socket client is connected with Access Token: ", access_token);

  socket.emit("welcome", { message: "You are connected to the server!" });
  /**
   * emmit cmc data
   */
  if (
    cmc &&
    cmc.length > 0 &&
    sell &&
    sell.length > 0 &&
    buy &&
    buy.length > 0 &&
    th &&
    th.length > 0
  ) {
    socket.emit("cmc_updated", cmc);
    /**
     *  emmit sell stack
     */
    // let arr1 = getArrayFromMapObjectArray(sell_order_stack);
    // if (sell.length > 0)
    socket.emit("sell_order_updated", sell);

    /**
     *  emmit buy stack
     */
    // let arr2 = getArrayFromMapObjectArray(buy_order_stack);
    // if (buy.length > 0)
    socket.emit("buy_order_updated", buy);

    /**
     * emmit trade history
     */
    // let arr3 = getArrayFromMapObjectArray(order_history);
    // if (th.length > 0)
    socket.emit("order_history_updated", th);
  } else {
    try {
      let fs = require("fs");
      let path = require("path");
      let dirname = path.join(__dirname, `./json/socket.json`);
      const s_price = JSON.parse(fs.readFileSync(dirname, "utf8"));
      if (s_price) {
        // order_history
        // sell_order
        // buy_order

        let oh = s_price["order_history"];
        let so = s_price["sell_order"];
        let bo = s_price["buy_order"];

        socket.emit("sell_order_updated", so);
        socket.emit("buy_order_updated", bo);
        socket.emit("order_history_updated", oh);

        let map_arg_oh = Object.keys(oh).map((d) => {
          return [d, oh[d]];
        });
        let map_arg_so = Object.keys(so).map((d) => {
          return [d, oh[d]];
        });
        let map_arg_bo = Object.keys(bo).map((d) => {
          return [d, oh[d]];
        });

        sell_order_stack = new Map(map_arg_so);
        buy_order_stack = new Map(map_arg_bo);
        order_history = new Map(map_arg_oh);
      } else {
      }
    } catch (error) {
      //
    }
  }

  // console.log("rooms", io.of("/").adapter.rooms);
  // for continous ping service
  setInterval(async () => {
    emmitPingToRoom(socket, "eater", server_time.ping);
  }, 1000);

  // will call when a client will disconnect
  socket.on("disconnect", () => {
    console.log("Client Disconnected!");
  });

  // will call when a client will ping
  socket.on("ping", () => {
    emmitPing(socket);
  });

  socket.on("update_cmc", (data) => {
    if (socket.rooms.has("feeder")) {
      if (data) {
        cmc = data;
      }
      socket.to("eater").emit("cmc_updated", data);
      // console.log("cmc updated");
    } else {
    }
  });

  // will call if a user want chart data
  socket.on("chart_data", (data) => {
    if (socket.rooms.has("eater")) {
      if (data.currency_type && data.compare_currency) {
        socket.emit("chart_data", {
          currency_type: data.currency_type,
          compare_currency: data.compare_currency,
          ohlc: chartData(data.currency_type, data.compare_currency),
        });
      } else {
        socket.to("eater").emit("chart_data", []);
      }
    } else {
    }
  });

  // for updating order history
  socket.on("update_order_history", (data) => {
    if (socket.rooms.has("feeder")) {
      if (
        data.currency_type &&
        data.compare_currency &&
        data.raw_price &&
        data.volume
      ) {
        let title = data.currency_type + data.compare_currency;
        if (order_history.get(title)) {
          let old_arr = order_history.get(title);
          let new_arr = old_arr.slice(Math.max(old_arr.length - 9, 0));
          order_history.set(title, [...new_arr, data]);
        } else {
          order_history.set(title, [data]);
        }
      }

      let arr = getArrayFromMapObjectArray(order_history);
      th = arr;
      socket.to("eater").emit("order_history_updated", arr);
      storeSocketData(order_history, "order_history");
      console.log("history updated");
    } else {
    }
  });

  // for updating sell stack
  socket.on("update_sell_stack", async (data) => {
    if (socket.rooms.has("feeder")) {
      if (
        data.currency_type &&
        data.compare_currency &&
        data.raw_price &&
        data.volume
      ) {
        let title = data.currency_type + data.compare_currency;
        if (sell_order_stack.get(title)) {
          let old_arr = sell_order_stack.get(title);
          let new_arr = old_arr.slice(Math.max(old_arr.length - 9, 0));
          sell_order_stack.set(title, [...new_arr, data]);
        } else {
          sell_order_stack.set(title, [data]);
        }
      }
      // console.log("buy_order_stack", sell_order_stack.get(data.currency_type + data.compare_currency))

      let arr = getArrayFromMapObjectArray(sell_order_stack);
      sell = arr;
      socket.to("eater").emit("sell_order_updated", arr);
      storeSocketData(sell_order_stack, "sell_order");
      console.log("sell_stack updated");
    } else {
    }
  });

  // for updating buy stack
  socket.on("update_buy_stack", (data) => {
    if (socket.rooms.has("feeder")) {
      if (
        data.currency_type &&
        data.compare_currency &&
        data.raw_price &&
        data.volume
      ) {
        let title = data.currency_type + data.compare_currency;
        if (buy_order_stack.get(title)) {
          let old_arr = buy_order_stack.get(title);
          let new_arr = old_arr.slice(Math.max(old_arr.length - 9, 0));
          buy_order_stack.set(title, [...new_arr, data]);
        } else {
          buy_order_stack.set(title, [data]);
        }
      }

      let arr = getArrayFromMapObjectArray(buy_order_stack);
      // console.log('buy arr', arr);
      buy = arr;
      socket.to("eater").emit("buy_order_updated", arr);
      storeSocketData(arr, "buy_order");
      console.log("buy_stack updated");
    } else {
    }
  });
});

// server starting
// httpServer.listen(5007, () =>
//   console.log("Socker Server is Started on PORT: ", 5007)
// );

function chartData(currency_type, compare_currency) {
  return ohlc_data.get((currency_type + compare_currency).toUpperCase());
}
// createOHLCFromDB().then(()=>{console.log("Success!")}).catch((err)=>{console.log("Err: ", err)})
// render a chart (dump data into json file)
var isfirstTime = true;
var chart_last_time = Date.now();
const chart_interval = 60 * 60 * 1; //secounds
var is_tokenstored = false;
setInterval(async () => {
  if ((Date.now() - chart_last_time) / 1000 >= chart_interval || isfirstTime) {
    isfirstTime = false;
    chart_last_time = Date.now();
    //await geTChartdata();
  }

  // }, 24*60*60*1000 )
}, 6000); // 60 min

async function geTChartdata() {
  const SupportedCurrency = require("./models/suppoted_currency");
  try {
    const supported_currency = await SupportedCurrency.find(
      { token_type: { $ne: "self" } },
      "symbol"
    );
    const supported_token = await SupportedCurrency.find(
      { token_type: { $eq: "self" } },
      "symbol inr_price usdt_price btc_price vrx_price"
    );
    var currency_type = supported_currency.map((d) => {
      return d.symbol;
    });
    // console.log("supported_token", supported_token);
    var token_type = supported_token.map((d) => {
      return {
        symbol: d.symbol,
        inr_price: d.inr_price,
        usdt_price: d.usdt_price,
        btc_price: d.btc_price,
        vrx_price: d.vrx_price,
      };
    });
    const index_of_inr = currency_type.indexOf("INR");
    // console.log('currency_type: ',currency_type)
    if (index_of_inr > -1) {
      currency_type.splice(index_of_inr, 1);
    }
    // console.log("currency_type: ", currency_type);
    await storeOHLC(currency_type, "1h");
    if (!is_tokenstored) {
      is_tokenstored = true;
      setTimeout(async () => {
        await storeTokenOHLC(token_type);
      }, 5000);
    }
    console.log("chart_data_updated: ", new Date().toLocaleString());
  } catch (error) {
    console.log("Error in chart updatetion: ", error.message);
  }
}
async function storeTokenOHLC(currency_type) {
  try {
    var fs = require("fs");
    console.log("storeTokenOHLC");
    let final_ohlc = await getTokenOHLCData(currency_type);
    console.log("storeTokenOHLC: final_ohlc");
    var json = JSON.stringify(final_ohlc);
    if (final_ohlc) {
      fs.writeFile(__dirname + `/json/ohlc_custom.json`, json, "utf8", (d) => {
        console.log(d);
      });
    }
  } catch (error) {
    console.log("Error in storeTokenOHLC: ", error);
  }
}
async function storeOHLC(currency_type, duration) {
  try {
    var fs = require("fs");
    let currency_type_chunk_1 = currency_type.slice(0, 3);
    let ohlc1 = await getOHLCData(currency_type_chunk_1, duration);
    let currency_type_chunk_2 = currency_type.slice(3, 6);
    let ohlc2 = await getOHLCData(currency_type_chunk_2, duration);
    let currency_type_chunk_3 = currency_type.slice(6, 9);
    let ohlc3 = await getOHLCData(currency_type_chunk_3, duration);
    let currency_type_chunk_4 = currency_type.slice(9, 12);
    let ohlc4 = await getOHLCData(currency_type_chunk_4, duration);
    let currency_type_chunk_5 = currency_type.slice(12, 15);
    let ohlc5 = await getOHLCData(currency_type_chunk_5, duration);
    let currency_type_chunk_6 = currency_type.slice(15, 18);
    let ohlc6 = await getOHLCData(currency_type_chunk_6, duration);
    ohlc1 = ohlc1 ? ohlc1 : {};
    ohlc2 = ohlc2 ? ohlc2 : {};
    ohlc3 = ohlc3 ? ohlc3 : {};
    ohlc4 = ohlc4 ? ohlc4 : {};
    ohlc5 = ohlc5 ? ohlc5 : {};
    ohlc6 = ohlc6 ? ohlc6 : {};
    let final_ohlc = {
      ...ohlc1,
      ...ohlc2,
      ...ohlc3,
      ...ohlc4,
      ...ohlc5,
      ...ohlc6,
    };
    var json = JSON.stringify(final_ohlc);
    fs.writeFile(
      __dirname + `/json/ohlc_${duration}.json`,
      json,
      "utf8",
      (d) => {
        console.log(d);
      }
    );
  } catch (error) {
    console.log("Error in storeOHLC: ", error.message);
  }
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
async function getTokenOHLCData(currency_type) {
  const ohlc_1h = require("./json/ohlc_1h.json");
  // console.log("token currency_type : ", currency_type)
  // const ohlc_1h = JSON.parse(fs.readFileSync(dirname, 'utf8'));
  const _ci = ["XLMINR", "TRXINR", "DASHINR", "XEMINR"];
  const _cu = ["XLMUSDT", "TRXUSDT", "DASHUSDT", "XEMUSDT"];
  const _cb = ["XLMBTC", "TRXBTC", "DASHBTC", "XEMBTC"];
  const _cx = ["XLMBTEX", "TRXBTEX", "DASHBTEX", "XEMBTEX"];
  try {
    if (
      currency_type &&
      Array.isArray(currency_type) &&
      currency_type.length > 0
    ) {
      let graph_data = {};
      let resp = currency_type.map(async (c1) => {
        let c = c1.symbol;
        let price = 5;
        // console.log("Abcd: ", c1);
        let pricei = c1.inr_price;
        let priceu = c1.usdt_price;
        let priceb = c1.btc_price;
        let pricex = c1.vrx_price;
        let keyi = c.toUpperCase() + "INR";
        let keyu = c.toUpperCase() + "USDT";
        let keyb = c.toUpperCase() + "BTC";
        let keyx = c.toUpperCase() + "BTEX";
        let randome_index = getRandomInt(4);
        let ki = _ci[randome_index];
        let ku = _cu[randome_index];
        let kb = _cb[randome_index];
        let kx = _ci[randome_index];
        let chart_datai = ohlc_1h[ki];
        let chart_datau = ohlc_1h[ku];
        let chart_datab = ohlc_1h[kb];
        let chart_datax = ohlc_1h[kx];
        // console.log("chart_datax: ", kx, randome_index);
        let uchart_datai = await convertOHLCprice(
          chart_datai,
          pricei,
          c + "inr"
        );
        let uchart_datau = await convertOHLCprice(
          chart_datau,
          priceu,
          c + "usdt"
        );
        let uchart_datab = await convertOHLCprice(
          chart_datab,
          priceb,
          c + "btc"
        );
        let uchart_datax = await convertOHLCprice(chart_datax, pricex, c + "x");
        graph_data[keyi] = uchart_datai;
        graph_data[keyu] = uchart_datau;
        graph_data[keyb] = uchart_datab;
        graph_data[keyx] = uchart_datax;
        /**
         *
         */
      });
      let rslt = await Promise.all(resp);
      return graph_data;
    } else {
      return undefined;
    }
  } catch (error) {
    console.log("Error in getTokenOHLCData: ", error);
    return undefined;
  }
}
async function convertOHLCprice(data, price, t) {
  if (data && data["o"] && data["h"] && data["l"] && data["c"]) {
    let o = data["o"];
    let h = data["h"];
    let l = data["l"];
    let c = data["c"];
    if (o && o.length > 0) {
      let xo = o[o.length - 1];
      let xh = h[h.length - 1];
      let xl = l[l.length - 1];
      let xc = c[c.length - 1];
      let a = price;
      let ohlc = {
        o: [],
        h: [],
        l: [],
        c: [],
      };
      // console.log("open: ", a, o[0], xo, t);
      let updated_d = o.map(async (d, i) => {
        let yo = d;
        let yh = h[i];
        let yl = l[i];
        let yc = c[i];
        let bo = (a * yo) / xo;
        let bh = (a * yh) / xh;
        let bl = (a * yl) / xl;
        let bc = (a * yc) / xc;
        // console.log(bo, a, yo, xo);
        ohlc["o"].push(bo);
        ohlc["h"].push(bh);
        ohlc["l"].push(bl);
        ohlc["c"].push(bc);
        return "hi";
      });
      let _d = await Promise.all(updated_d);
      let dta = {
        o: [],
        h: [],
        l: [],
        c: [],
        v: [],
        t: [],
        s: "ok",
      };
      dta["o"] = ohlc["o"];
      dta["h"] = ohlc["h"];
      dta["l"] = ohlc["l"];
      dta["c"] = ohlc["c"];
      dta["v"] = data["v"];
      dta["t"] = data["t"];
      dta["s"] = data["s"];
      return dta;
    } else {
      return data;
    }
  } else {
    return undefined;
  }
}

async function getOHLCData(currency_type, duration) {
  const compare_currency = ["inr", "btc", "usdt"];
  if (currency_type && compare_currency) {
    const rp = require("request-promise");
    const c_date = new Date();
    // c_date.setDate(c_date.getDate() - 60);
    const start_date =
      c_date.getFullYear() +
      "-" +
      c_date.getUTCMonth() +
      "-" +
      c_date.getDate();
    c_date.setMonth(c_date.getMonth() + 3);
    const now =
      c_date.getFullYear() + "-" + c_date.getMonth() + "-" + c_date.getDate();
    let dt;
    const requestOptions = {
      method: "GET",
      uri: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/historical`,
      qs: {
        symbol: Array.isArray(currency_type)
          ? currency_type.join(",")
          : currency_type,
        time_start: start_date,
        time_end: now,
        interval: duration,
        time_period: "hourly",
        convert: Array.isArray(compare_currency)
          ? compare_currency.join(",")
          : compare_currency,
      },
      headers: {
        "X-CMC_PRO_API_KEY": "55223f08-515b-46d2-8874-ca54d263b848",
      },
      json: true,
      gzip: true,
    };
    dt = await rp(requestOptions);
    const ohlc = await formateOHLC(dt.data);
    return ohlc;
  } else {
    return undefined;
  }
}
async function formateOHLC(data) {
  const ohlc = {};
  if (data.id) {
    await formateQuotes(data.quotes, data.symbol, ohlc);
  } else {
    const keys = Object.keys(data);
    for (const k of keys) {
      let val = data[k];
      if (val.quotes) await formateQuotes(val.quotes, k, ohlc);
    }
  }
  return ohlc;
}
async function formateQuotes(quotes, k, ohlc) {
  for (const v of quotes) {
    let _keys = Object.keys(v.quote);
    for (const k1 of _keys) {
      if (!ohlc[k + k1]) {
        ohlc[k + k1] = {
          o: [],
          h: [],
          l: [],
          c: [],
          v: [],
          t: [],
        };
      }
      ohlc[k + k1]["o"].push(v.quote[k1].open);
      ohlc[k + k1]["h"].push(v.quote[k1].high);
      ohlc[k + k1]["l"].push(v.quote[k1].low);
      ohlc[k + k1]["c"].push(v.quote[k1].close);
      ohlc[k + k1]["v"].push(v.quote[k1].volume);
      ohlc[k + k1]["t"].push(new Date(v.quote[k1].timestamp) / 1000);
      ohlc[k + k1]["s"] = "ok";
    }
  }
}

function storeSocketData(data, type) {
  try {
    const _data = require("./json/socket.json");
    var fs = require("fs");
    if (_data) {
      _data[type] = data;
      var json = JSON.stringify(_data);
      fs.writeFile(__dirname + `/json/socket.json`, json, "utf8", (d) => {
        console.log(d);
      });
    } else {
      let final_data = {};
      final_data[type] = data;
      var json = JSON.stringify(final_data);
      fs.writeFile(__dirname + `/json/socket.json`, json, "utf8", (d) => {
        console.log(d);
      });
    }
  } catch (error) {
    console.log("Error in socket data store: ", error);
  }
}



app.post('/api-docs', addApisInDoc)
function addApisInDoc(req, res) {
  try {
    const apiDoc = require("./models/api_doc_api");
    const { heading, title, header, parameters, response, url, note } = req.body;
    // const parameters = [];
    // if (req.body.length > 0) {
    //   Parameters = req.body.map((parameter) => {
    //     return {
    //       name: name,
    //       type: type,
    //       mandatory: mandatory,
    //       description: description,
    //     };
    //   });
    // }
    const api = new apiDoc({
      heading,
      title,
      header,
      url,
      parameters: parameters,
      response,
      note,
    });
    api.save();
    res.status(200).json({ api: api });
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: "Somthing went wrong" });
  }
}
//getPromoter("BSXG10001")
//initApp();
activateBooster("BSXG183293b5b41/u");
findparent("BSXG1834d5ca8c9").then((r)=>{console.log(r)}).catch((error)=>{console.log(error.message)});