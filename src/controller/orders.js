const { getUserBalance, updateUserBalance, updateUserLockBalance } = require('../utils/function.wallets');
const { createUniqueID } = require('../utils/functions');
const { executeOrder } = require('../utils/functions.orders');
const { createSocketClient } = require('../utils/functions.socket');
const { validateUserId, totalwithdrawFees, getOrderTypeFromOrderId, totalTradeCommission } = require('../utils/validator');
const { add } = require("../utils/Math"); 
const BuyStack = require('../models/buy_stack');
const SellStack = require('../models/sell_stack');
const socket = createSocketClient('kujgwvfq-z-ghosttown-z-1fhhup0p6');

exports.sellOrder = async (req, res) => {
    // await executeOrder({}, false);
    const body = req.body;
    // console.log("User id: ", body.user_id);
    if (!body.user_id || !validateUserId(body.user_id)) {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid request"
        })
    }
    const {balance} = await getUserBalance(body.user_id, body.currency_type);
    if (body.volume > balance) {
        return res.json({
            status: 200,
            error: true,
            message: 'Insufficient fund in wallet!'
        })
    }
    const order_id      = createUniqueID('sell_order');
    const user_id       = body.user_id;
    const raw_price     = parseFloat(body.raw_price);
    const currency_type = body.currency_type;
    const compare_currency = body.compare_currency;
    const volume        = body.volume;
    const order_date    = Date.now();
    const execution_time= ''; 
    const total_executed    = 0;
    const last_reansaction = '';
    const order_status  = 0;
    const executed_from = '';
    const order_type = body.type == 'p2p' ? 'p2p' : 'exc';

    try {
        const sellstack = await SellStack.create({
            order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type
        })
        
        const isDeducted = await updateUserLockBalance(user_id, currency_type, volume);
        if (!isDeducted) {
            await SellStack.deleteOne({ "order_id": order_id });
            return res.json({
                status: 200,
                error: true,
                message: 'Insufficient fund in wallet!'
            })
        }
        if (socket.connected) {
            let obj = {
                currency_type,
                compare_currency,
                raw_price,
                volume
            }
            socket.emit("update_sell_stack", obj);
        }
    } catch (error) {
        console.log("Error: >from: controller> orders > sellOrder > try: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Order couldn't create"
        })
    }

    const order = {
        order_id,
        user_id,
        currency_type,
        compare_currency,
        execution_time: Date.now(),
        total_executed,
        last_reansaction,
        executed_from,
        order_type,
        order_direction: 'sell',
        volume,
        raw_price,
        order_status
    }
    try {
        const historyId = await executeOrder(order, false);
        if (historyId) {
            return res.json({
                status: 200,
                error: false,
                message: 'Order Created and Executed Successfully!',
                order_id
            })
        } else {
            return res.json({
                status: 200,
                error: false,
                message: "Order Created Successfully, but didn't Executed (in queue)!",
                order_id
            })
        }
    } catch (error) {
        console.log("Error: >from: controller> orders > buyOrder > try2 (order execution): ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Order Created Successfully, but didn't Executed (in queue)*"
        })
    }
    
    return res.json({
        status: 200,
        error: false,
        message: 'Order Created Successfully!',
        order_id
    })
};

async function createBuyStack (order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type, lock, is_admin) {
    try{
        if(order_id && user_id && raw_price && currency_type && compare_currency && volume){
            createOrder = await BuyStack.create({
                order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type, lock, is_admin
            })
            const isDeducted = await updateUserLockBalance(user_id, compare_currency, (volume)*(raw_price));
            if (!isDeducted) {
                await BuyStack.deleteOne({ "order_id": order_id });
                return 0;
            }
            return createOrder ? 1 : 0; 
        }
        return 0; 
    }catch(e){
        console.log("error in order.js < createBuyStack ",e.message)
    }
}
async function createSellStack (order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type, lock, is_admin) {
    try{
        if(order_id && user_id && raw_price && currency_type && compare_currency && volume){
            createOrder = await SellStack.create({
                order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type, lock, is_admin
            })
            const isDeducted = await updateUserLockBalance(user_id, currency_type, volume);
            if (!isDeducted) {
                await SellStack.deleteOne({ "order_id": order_id });
                return 0;
            }
            return createOrder ? 1 : 0; 
        }
        return 0;
    }catch(e){
        console.log("error in order.js < createSellStack ",e.message)
    } 
}
exports.createMultipleOrder = async (req, res) => {
    const body = req.body;
    const action        = body.action;
    // console.log("User id: ", body.user_id);
    if (!body.user_id || !validateUserId(body.user_id)) {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid request"
        })
    }
    let balance = 0;
    if(action == 'buy'){
         balance = await getUserBalance(body.user_id, body.compare_currency);
         check_balance = parseFloat(body.volume) * parseFloat(body.raw_price);
        if(parseFloat(body.volume) * parseFloat(body.raw_price) > balance ){
            return res.json({
               status: 200,
               error: true,
               message: 'Insufficient fund in wallet!'
           })
        }
    }else if(action == 'sell'){
         balance = await getUserBalance(body.user_id, body.currency_type);
         if(body.volume > balance){
             return res.json({
                status: 200,
                error: true,
                message: 'Insufficient fund in wallet!'
            })
         }
    }else{
        return res.json({
            status: 400,
            error: false,
            message: 'Invalid Request!'
        })
    }
    const user_id       = body.user_id;
    let   raw_price     = parseFloat(body.raw_price);
    const currency_type = body.currency_type;
    const compare_currency = body.compare_currency;
    const volume        = body.volume;
    const order_date    = Date.now();
    const execution_time= ''; 
    const total_executed    = 0;
    const last_reansaction = '';
    const order_status  = 0;
    const executed_from = '';
    const order_type = body.type == 'p2p' ? 'p2p' : 'exc';
    const lock = false;
    let total_order        = [];
    const inc_order        = parseFloat(body.inc_order);
    const is_admin   = true;
    for(i=0; i< parseInt(body.total_order);i++){
        total_order.push(i)
    }
    try {
        let i = 0;
        let executeOrder = 0;
        let socket_emit = ''; 
        let totalCreatedOrder = [];
        // var interval = setInterval(async ()=>{
        //     i++
        //     if(i <= total_order){
        //         console.log("action ",action, i)
            var _orders = total_order.map(async ( index) => {
                if(action == 'buy'){
                    // console.log("enter ",action, i)
                    raw_price = index ? raw_price+inc_order : raw_price;
                    let order_id = createUniqueID('buy_order');
                    executed = await createBuyStack(order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type, lock , is_admin)
                    executeOrder = executeOrder+executed;
                    socket_emit = "update_buy_stack";
                    console.log("success: ",executed)
                }
                if(action == 'sell'){
                    // console.log("enter ",action, i)
                    let order_id = createUniqueID('sell_order');
                    raw_price = index ? raw_price+inc_order : raw_price;
                    executed = await createSellStack(order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type, lock, is_admin)
                    executeOrder = executeOrder+executed;
                    socket_emit = "update_sell_stack";
                    console.log("success: ",executed)
                }
                if (socket.connected && socket_emit) {
                    let obj = {
                        currency_type,
                        compare_currency,
                        raw_price,
                        volume,
                        executed
                    }
                    socket.emit(socket_emit, obj);
                    return obj;
                }
            });
            Promise.all(_orders).then(function (results) {
                if(executeOrder){
                    return res.json({
                        status: 200,
                        error: false,
                        query_status: executeOrder,
                        message: "Total "+executeOrder+" "+currency_type+"/"+compare_currency+" Created Successfully",
                        results
                    })
                }else{
                    return res.json({
                        status: 200,
                        error: true,
                        message: "Order couldn't create!"
                    })
                }
            })
        //     }else{
        //         console.log("allclear action ",action, i)
        //         clearInterval(interval)
        //     }
        //  }, 1000);


    } catch (error) {
        console.log("Error: >from: controller> orders > createOrder > try: ", error.message);
        return res.json({
            status: 400,
            error: true,
            error1 : error.message,
            message: "Order couldn't create"
        })
    }
};


exports.buyOrder = async (req, res) => {
    console.log("CVal")
    const body = req.body;
    if (!body.user_id || !validateUserId(body.user_id)) {
        return res.json({
            status: 400,
            error: true,
            message: "Invalid request**"
        })
    }
    const {balance} = await getUserBalance(body.user_id, body.compare_currency); // here we will check for compare currency balance
    if (parseFloat(body.volume) * parseFloat(body.raw_price) > balance ) {
        return res.json({
            status: 200,
            error: true,
            message: 'Insufficient fund in wallet!'
        })
    }
    const order_id = createUniqueID('buy_order');
    const user_id = body.user_id;
    const raw_price = parseFloat(body.raw_price);
    const currency_type = body.currency_type;
    const compare_currency = body.compare_currency;
    const volume = parseFloat(body.volume);
    const order_date = Date.now();
    const execution_time = '';
    const total_executed = 0;
    const last_reansaction = '';
    const order_status = 0;
    const executed_from = '';
    const order_type = body.type == 'p2p' ? 'p2p' : 'exc';
    
    try {
        const buystack = await BuyStack.create({
            order_id, user_id, raw_price, currency_type, compare_currency, volume, order_date, execution_time, total_executed, last_reansaction, order_status, executed_from, order_type
        })

        const isDeducted = await updateUserLockBalance(user_id, compare_currency, (volume)*(raw_price));
        if (!isDeducted) {
            await BuyStack.deleteOne({ "order_id": order_id });
            return res.json({
                status: 200,
                error: true,
                message: 'Insufficient fund in wallet!'
            })
        }
        if (socket.connected) {
            let obj = {
                currency_type,
                compare_currency,
                raw_price,
                volume
            }
            socket.emit("update_buy_stack", obj);
        }
    } catch (error) {
        console.log("Error: >from: controller> orders > buyOrder > try: ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Order couldn't create"
        })
    }
    const order = {
        order_id,
        user_id,
        currency_type,
        compare_currency,
        execution_time: Date.now(),
        total_executed,
        last_reansaction,
        executed_from,
        order_type,
        order_direction: 'buy',
        volume,
        raw_price,
        order_status
    }
    try {
        const historyId = await executeOrder(order, false);
        if (historyId) {
            return res.json({
                status: 200,
                error: false,
                message: 'Order Created and Executed Successfully!',
                order_id
            })
        } else {
            return res.json({
                status: 200,
                error: false,
                message: "Order Created Successfully, but didn't Executed (in queue)!",
                order_id
            })
        }
    } catch (error) {
        console.log("Error: >from: controller> orders > buyOrder > try2 (order execution): ", error.message);
        return res.json({
            status: 400,
            error: true,
            message: "Order Created Successfully, but didn't Executed (in queue)*"
        })
    }
    return res.json({
        status: 200,
        error: false,
        message: 'Order Created Successfully!',
        order_id
    })
}
exports.orderHistory = async (req, res) => {
    const TradeHistory = require('../models/trade_history');
    try {
        // console.log("Start: ", Date.now())
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            const sell_orders = await SellStack.find({user_id: user_id, order_status:0 });
            const buy_orders = await BuyStack.find({ user_id: user_id, order_status:0 });
            const compleated_orders = [];
            const pending_orders = [];
            
            // if (sell_orders && Array.isArray(sell_orders) && buy_orders && Array.isArray(buy_orders)) {
                // code for selling
            const tradeloopobj = (sell_orders ? sell_orders.length : 0) > (buy_orders?buy_orders.length:0) ? sell_orders : buy_orders;
                var _orders = tradeloopobj.map(async (order, index) => {
                    let new_arr = [];
                    let buy_obj = buy_orders.length > index ? buy_orders[index] : undefined;
                    let sell_obj = sell_orders.length > index ? sell_orders[index] : undefined;
                    // console.log(sell_obj)
                    if (buy_obj) {
                        let ordr = {};
                        ordr.currency_type = buy_obj.currency_type;
                        ordr.compare_currency = buy_obj.compare_currency;
                        ordr.raw_price = buy_obj.raw_price;
                        ordr.volume = buy_obj.volume;
                        ordr.total_executed = buy_obj.total_executed;
                        ordr.timestamp = buy_obj.order_date;
                        ordr.order_id = buy_obj.order_id;
                        ordr.type = 'buy';
                        if (buy_obj.volume > buy_obj.total_executed) {
                            ordr.status = "p";
                        } else if (buy_obj.volume == buy_obj.total_executed) {
                            ordr.status = "c";
                        }
                        //  = [];
                        const trade_h = await TradeHistory.find({ buy_order_id: buy_obj.order_id });
                        // if (trade_h && Array.isArray(trade_h) && trade_h > 0) {
                            ordr.trades = trade_h.map((h) => {
                                let hobj = {};
                                hobj.trade_date = h.trade_date;
                                hobj.price = h.price;
                                hobj.volume = h.volume;
                                let cf = h.commition_fee ? h.commition_fee.split('+'):undefined;
                                let mf = cf ? cf[0] : 0;
                                hobj.transaction_fee = mf;
                                return hobj;
                                // ordr.trades.push(hobj);
                            })
                        // }
                        new_arr[0] = ordr;
                    }
                    if (sell_obj) {
                        let ordr = {};
                        ordr.currency_type = sell_obj.currency_type;
                        ordr.compare_currency = sell_obj.compare_currency;
                        ordr.raw_price = sell_obj.raw_price;
                        ordr.volume = sell_obj.volume;
                        ordr.total_executed = sell_obj.total_executed;
                        ordr.timestamp = sell_obj.order_date;
                        ordr.order_id = sell_obj.order_id;
                        ordr.type = 'sell';
                        if (sell_obj.volume > sell_obj.total_executed) {
                            ordr.status = "p";
                        } else if (sell_obj.volume == sell_obj.total_executed) {
                            ordr.status = "c";
                        }
                        const trade_h = await TradeHistory.find({ sell_order_id: sell_obj.order_id });
                        //  = [];
                        // if (trade_h && Array.isArray(trade_h) && trade_h > 0) {
                            ordr.trades = trade_h.map((h) => {
                                let hobj = {};
                                hobj.trade_date = h.trade_date;
                                hobj.price = h.price;
                                hobj.volume = h.volume;
                                let cf = h.commition_fee ? h.commition_fee.split('+'):undefined;
                                let mf = cf ? cf[1] : 0;
                                hobj.transaction_fee = mf;
                                return hobj;
                                // ordr.trades.push(hobj);
                            })
                        // }
                        new_arr[1] = ordr;
                        // console.log(new_arr)
                    }
                    return new_arr;
                });
                // console.log(_orders);
                Promise.all(_orders).then(function (results) {
                    const trade_hist = {};
                    trade_hist.compleated = [];
                    trade_hist.pending = [];
                    results.map((d) => {
                        if (d[0] && d[0].status == 'c') {
                            trade_hist.compleated.push(d[0])
                        } else if (d[0] && d[0].status == 'p') {
                            trade_hist.pending.push(d[0])
                        }
                        if (d[1] && d[1].status == 'c') {
                            trade_hist.compleated.push(d[1])
                        } else if (d[1] && d[1].status == 'p') {
                            trade_hist.pending.push(d[1])
                        }
                    })
                    // console.log("End: ", Date.now())
                    return res.json({
                        status: 200,
                        error: false,
                        params: {
                            trade_history: trade_hist
                        },
                        message: "Success"
                    })
                    /** */
                }).catch((error)=>{
                    console.log("error: ", error.message);
                })
            // } else {
            //     return res.json({
            //         status: 400,
            //         error: true,
            //         message: 
            //     })
            // }
        } else {
            // console.log("End-: ", Date.now())
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request"
            })
        }
    } catch (error) {
        console.log("End--: ", Date.now())
        console.log("Error: ", error.message)
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"
        })
    }
}

exports.cancleOrder = async (req, res) => {
    try {
        const { user_id, order_id, action_by } = req.body;
        if (user_id && validateUserId(user_id)) {
            if (order_id) {
                let deleted_by =  action_by ? action_by : 'self';
                const order_type = getOrderTypeFromOrderId(order_id);
                if (order_type) {
                    if (order_type == 'sell') {
                        const order_d = await SellStack.findOne({ order_id: order_id, user_id: user_id });
                        if (order_d && order_d.lock != true && order_d.order_status == 0) {
                            const total_volume = order_d.volume ? parseFloat(parseFloat(order_d.volume).toFixed(8)) : 0;
                            const total_executed = order_d.total_executed ? parseFloat(parseFloat(order_d.total_executed).toFixed(8)) : 0;
                            const remaining_volume = total_volume - total_executed;
                            if (remaining_volume > 0) {
                                await SellStack.updateOne({ order_id: order_id, user_id: user_id }, {
                                    $set: {
                                        order_status: 2,
                                        deleted_by:deleted_by
                                    }
                                });
                                /** 
                                 * volume -
                                 * total_executed
                                 * = cancle locked
                                 */
                                await updateUserLockBalance(user_id, order_d.currency_type, (-1) * remaining_volume);
                                let ob = {
                                    currency_type: order_d.currency_type,
                                    compare_currency: order_d.compare_currency,
                                    raw_price: order_d.raw_price,
                                    volume: (remaining_volume)>0? remaining_volume: 0
                                }
                                socket.emit("delete_sell_stack", ob);
                                return res.json({
                                    status: 200,
                                    error: false,
                                    message: "Order Cancled Successfully"
                                })
                            } else {
                                await SellStack.updateOne({ order_id: order_id, user_id: user_id }, {
                                    $set: {
                                        order_status: 2,
                                        deleted_by:deleted_by
                                    }
                                });
                                return res.json({
                                    status: 200,
                                    error: false,
                                    message: "Order Cancled Successfully"
                                })
                            }
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Invalid attempt"
                            })
                        }
                    } else if (order_type == 'buy') {
                        const order_d = await BuyStack.findOne({ order_id: order_id, user_id: user_id });
                        if (order_d && order_d.lock != true && order_d.order_status == 0) {
                            const total_volume = order_d.volume ? parseFloat(parseFloat(order_d.volume).toFixed(8)) : 0;
                            const total_executed = order_d.total_executed ? parseFloat(parseFloat(order_d.total_executed).toFixed(8)) : 0;
                            const remaining_volume = (total_volume - total_executed) * (order_d.raw_price ? parseFloat(order_d.raw_price.toFixed(8)) : 0);
                            if (remaining_volume > 0) {
                                await BuyStack.updateOne({ order_id: order_id, user_id: user_id }, {
                                    $set: {
                                        order_status: 2,
                                        deleted_by:deleted_by
                                    }
                                });
                                await updateUserLockBalance(user_id, order_d.compare_currency, (-1) * remaining_volume);
                                let ob = {
                                    currency_type: order_d.currency_type,
                                    compare_currency: order_d.compare_currency,
                                    raw_price: order_d.raw_price,
                                    volume: (remaining_volume)>0? remaining_volume: 0
                                }
                                socket.emit("delete_buy_stack", ob);
                                return res.json({
                                    status: 200,
                                    error: false,
                                    message: "Order Cancled Successfully"
                                })
                            } else {
                                await BuyStack.updateOne({ order_id: order_id, user_id: user_id }, {
                                    $set: {
                                        order_status: 2,
                                        deleted_by:deleted_by
                                    }
                                });
                                return res.json({
                                    status: 200,
                                    error: false,
                                    message: "Order Cancled Successfully"
                                })
                            }
                        } else {
                            return res.json({
                                status: 400,
                                error: true,
                                message: "Invalid attempt"
                            })
                        }
                    }
                } else {
                    return res.json({
                        status: 400,
                        error: true,
                        message: "Invalid attempt"
                    })
                }
            } else {
                return res.json({
                    status: 400,
                    error: true,
                    message: "Invalid attempt"
                })
            }
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid  request"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again "+error.message
        })
    }
}

exports.openOrder = async (req, res) => {
    try {
        const buyStack = require('../models/buy_stack');
        const sellStack = require('../models/sell_stack');
        const { user_id, status, order_id, action } = req.query;
        let order = total_price = total_volume = total_count = [];
        if (status || status === 0  ) {
            if(action == 'buy'){
                order = await buyStack.aggregate( [
                    { "$match": { order_status: parseInt(status) } }, 
                    {
                        $lookup: {
                            from: "pending_kyc",
                            localField: "user_id",
                            foreignField: "user_id",
                            as: "pending_kyc",
                           
                        },
                    },
                    {
                        $replaceRoot: { 
                            newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$pending_kyc", 0 ] }, "$$ROOT" ] } 
                        }
                     },
                    { 
                        $project: { 
                            first_name:1,last_name:1,middle_name:1 ,email: 1,compare_currency: 1, currency_type:1,createdAt:1,user_id:1,raw_price:1,volume:1,updatedAt:1,order_status:1,order_id:1
                        } 
                    }
                ] ).sort({"createdAt":-1});
                total_price = totalwithdrawFees(order,'raw_price','currency_type');
                total_volume = totalwithdrawFees(order,'volume','currency_type');
                total_count = totalwithdrawFees(order,'count','currency_type');
                return res.json({
                    status: 200,
                    result: order,
                    total_price: total_price,
                    total_volume: total_volume,
                    total_count: total_count,
                    error: false,
                    message: "success"
                })
            }
            if(action == 'sell'){
                order = await sellStack.aggregate( [
                    { "$match": { order_status: parseInt(status) } }, 
                    {
                        $lookup: {
                            from: "pending_kyc",
                            localField: "user_id",
                            foreignField: "user_id",
                            as: "pending_kyc",
                        }
                    },
                    {
                        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$pending_kyc", 0 ] }, "$$ROOT" ] } }
                     },
                    { $project: { first_name:1,last_name:1,middle_name:1 ,email: 1,compare_currency: 1, currency_type:1,createdAt:1,user_id:1,raw_price:1,volume:1,updatedAt:1 ,order_status:1,order_id:1} }
                ] ).sort({"createdAt":-1});
                total_price = totalwithdrawFees(order,'raw_price','currency_type');
                total_volume = totalwithdrawFees(order,'volume','currency_type');
                total_count = totalwithdrawFees(order,'count','currency_type');
                return res.json({
                    status: 200,
                    result: order,
                    total_price: total_price,
                    total_volume: total_volume,
                    total_count: total_count,
                    error: false,
                    message: "success"
                })
            }
            if(action == 'buysell'){
                BuyOrder = await buyStack.find({is_admin:true,order_status:0}).sort({"createdAt":-1});
                SellOrder = await sellStack.find({is_admin:true,order_status:0}).sort({"createdAt":-1});
                order = [];
                BuyOrder.map((res) => {
                    res.order_type = 'buy';
                    order.push(res);
                })
                SellOrder.map((res) => {
                    res.order_type = 'sell';
                    order.push(res);
                })
                return res.json({
                    status: 200,
                    result: order,
                    total_buy_order: BuyOrder.length,
                    total_sell_order: SellOrder.length,
                    // b_total_price: totalwithdrawFees(BuyOrder,'raw_price','currency_type'),
                    // b_total_volume: totalwithdrawFees(BuyOrder,'volume','currency_type'),
                    // b_total_count: totalwithdrawFees(BuyOrder,'count','currency_type'),
                    // s_total_price: totalwithdrawFees(SellOrder,'raw_price','currency_type'),
                    // s_total_volume: totalwithdrawFees(SellOrder,'volume','currency_type'),
                    // s_total_count: totalwithdrawFees(SellOrder,'count','currency_type'),
                    error: false,
                    message: "success"
                })
            }
            return res.json({
                status: 400,
                error: true,
                message: "Invalid action"
            })
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid  request"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            error1: error.message,
            message: "Something went wrong, please try again"
        })
    }
}
exports.allHistory = async (req, res) => {
    try {
        const TradeHistory = require('../models/trade_history');
        const { user_id, status, order_id } = req.query;
        if (status ) {
            result = await TradeHistory.aggregate( [
                {
                    $lookup: {
                        from: "pending_kyc",
                        localField: "buy_user_id",
                        foreignField: "user_id",
                        as: "buy_detail",
                    },
                    
                },{
                    $lookup: {
                        from: "pending_kyc",
                        localField: "sell_user_id",
                        foreignField: "user_id",
                        as: "sell_detail",
                        
                    },
                }
            ] ).sort({"updatedAt":-1});
            total_fees = totalTradeCommission(result,'commition_fee');
            total_price = totalwithdrawFees(result,'price','currency_type');
            total_volume = totalwithdrawFees(result,'volume','currency_type');
            total_count = totalwithdrawFees(result,'count','currency_type');
            return res.json({
                status: 200,
                result: result,
                total_fees: total_fees,
                total_price: total_price,
                total_volume: total_volume,
                total_count: total_count,
                error: false,
                message: "success"
            })
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid  request"
            })
        }
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again "+error.message
        })
    }
}


exports.openOrder = async (req, res) =>{
    try {
        // console.log("Start: ", Date.now())
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            const sell_orders = await SellStack.find({user_id: user_id, order_status:0});
            const buy_orders = await BuyStack.find({ user_id: user_id, order_status:0});
            
            // if (sell_orders && Array.isArray(sell_orders) && buy_orders && Array.isArray(buy_orders)) {
                // code for selling
            const tradeloopobj = (sell_orders ? sell_orders.length : 0) > (buy_orders?buy_orders.length:0) ? sell_orders : buy_orders;
                var _orders = tradeloopobj.map(async (order, index) => {
                    let new_arr = [];
                    let buy_obj = buy_orders.length > index ? buy_orders[index] : undefined;
                    let sell_obj = sell_orders.length > index ? sell_orders[index] : undefined;
                    // console.log(sell_obj)
                    if (buy_obj) {
                        let ordr = {};
                        ordr.currency_type = buy_obj.currency_type;
                        ordr.compare_currency = buy_obj.compare_currency;
                        ordr.raw_price = buy_obj.raw_price;
                        ordr.volume = buy_obj.volume;
                        ordr.total_executed = buy_obj.total_executed;
                        ordr.timestamp = buy_obj.order_date;
                        ordr.order_id = buy_obj.order_id;
                        ordr.type = 'buy';
                        ordr.status = "p";
                        new_arr[0] = ordr;
                    }
                    if (sell_obj) {
                        let ordr = {};
                        ordr.currency_type = sell_obj.currency_type;
                        ordr.compare_currency = sell_obj.compare_currency;
                        ordr.raw_price = sell_obj.raw_price;
                        ordr.volume = sell_obj.volume;
                        ordr.total_executed = sell_obj.total_executed;
                        ordr.timestamp = sell_obj.order_date;
                        ordr.order_id = sell_obj.order_id;
                        ordr.type = 'sell';
                        ordr.status = "p";
                        new_arr[1] = ordr;
                    }
                    return new_arr;
                });
                // console.log(_orders);
                Promise.all(_orders).then(function (results) {
                    const trade_hist = {};
                    trade_hist.compleated = [];
                    trade_hist.pending = [];
                    results.map((d) => {
                        if (d[0] && d[0].status == 'p') {
                            trade_hist.pending.push(d[0])
                        }
                        if (d[1] && d[1].status == 'p') {
                            trade_hist.pending.push(d[1])
                        }
                    })
                    // console.log("End: ", Date.now())
                    return res.json({
                        status: 200,
                        error: false,
                        params: {
                            trade_history: trade_hist
                        },
                        message: "Success"
                    })
                    /** */
                }).catch((error)=>{
                    console.log("error: ", error.message);
                })
            // } else {
            //     return res.json({
            //         status: 400,
            //         error: true,
            //         message: 
            //     })
            // }
        } else {
            // console.log("End-: ", Date.now())
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request"
            })
        }
    } catch (error) {
        console.log("End--: ", Date.now())
        console.log("Error: ", error.message)
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"
        })
    } 
}

exports.order24History = async (req, res) => {
    const TradeHistory = require('../models/trade_history');
    try {
        // console.log("Start: ", Date.now())
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            const sell_orders = await SellStack.find({user_id: user_id});
            const buy_orders = await BuyStack.find({ user_id: user_id });
            const compleated_orders = [];
            const pending_orders = [];
            
            // if (sell_orders && Array.isArray(sell_orders) && buy_orders && Array.isArray(buy_orders)) {
                // code for selling
            const tradeloopobj = (sell_orders ? sell_orders.length : 0) > (buy_orders?buy_orders.length:0) ? sell_orders : buy_orders;
                var _orders = tradeloopobj.map(async (order, index) => {
                    let new_arr = [];
                    let buy_obj = buy_orders.length > index ? buy_orders[index] : undefined;
                    let sell_obj = sell_orders.length > index ? sell_orders[index] : undefined;
                    // console.log(sell_obj)
                    if (buy_obj) {
                        let ordr = {};
                        ordr.currency_type = buy_obj.currency_type;
                        ordr.compare_currency = buy_obj.compare_currency;
                        ordr.raw_price = buy_obj.raw_price;
                        ordr.volume = buy_obj.volume;
                        ordr.total_executed = buy_obj.total_executed;
                        ordr.timestamp = buy_obj.order_date;
                        ordr.order_id = buy_obj.order_id;
                        ordr.type = 'buy';
                        if (buy_obj.volume > buy_obj.total_executed) {
                            ordr.status = "p";
                        } else if (buy_obj.volume == buy_obj.total_executed) {
                            ordr.status = "c";
                        }
                        //  = [];
                        const trade_h = await TradeHistory.find({ buy_order_id: buy_obj.order_id });
                        // if (trade_h && Array.isArray(trade_h) && trade_h > 0) {
                            ordr.trades = trade_h.map((h) => {
                                let hobj = {};
                                hobj.trade_date = h.trade_date;
                                hobj.price = h.price;
                                hobj.volume = h.volume;
                                let cf = h.commition_fee ? h.commition_fee.split('+'):undefined;
                                let mf = cf ? cf[0] : 0;
                                hobj.transaction_fee = mf;
                                return hobj;
                                // ordr.trades.push(hobj);
                            })
                        // }
                        new_arr[0] = ordr;
                    }
                    if (sell_obj) {
                        let ordr = {};
                        ordr.currency_type = sell_obj.currency_type;
                        ordr.compare_currency = sell_obj.compare_currency;
                        ordr.raw_price = sell_obj.raw_price;
                        ordr.volume = sell_obj.volume;
                        ordr.total_executed = sell_obj.total_executed;
                        ordr.timestamp = sell_obj.order_date;
                        ordr.order_id = sell_obj.order_id;
                        ordr.type = 'sell';
                        if (sell_obj.volume > sell_obj.total_executed) {
                            ordr.status = "p";
                        } else if (sell_obj.volume == sell_obj.total_executed) {
                            ordr.status = "c";
                        }
                        const trade_h = await TradeHistory.find({ sell_order_id: sell_obj.order_id });
                        //  = [];
                        // if (trade_h && Array.isArray(trade_h) && trade_h > 0) {
                            ordr.trades = trade_h.map((h) => {
                                let hobj = {};
                                hobj.trade_date = h.trade_date;
                                hobj.price = h.price;
                                hobj.volume = h.volume;
                                let cf = h.commition_fee ? h.commition_fee.split('+'):undefined;
                                let mf = cf ? cf[1] : 0;
                                hobj.transaction_fee = mf;
                                return hobj;
                                // ordr.trades.push(hobj);
                            })
                        // }
                        new_arr[1] = ordr;
                        // console.log(new_arr)
                    }
                    return new_arr;
                });
                // console.log(_orders);
                Promise.all(_orders).then(function (results) {
                    const trade_hist = {};
                    trade_hist.compleated = [];
                    trade_hist.pending = [];
                    results.map((d) => {
                        if (d[0] && d[0].status == 'c') {
                            trade_hist.compleated.push(d[0])
                        } else if (d[0] && d[0].status == 'p') {
                            trade_hist.pending.push(d[0])
                        }
                        if (d[1] && d[1].status == 'c') {
                            trade_hist.compleated.push(d[1])
                        } else if (d[1] && d[1].status == 'p') {
                            trade_hist.pending.push(d[1])
                        }
                    })
                    // console.log("End: ", Date.now())
                    return res.json({
                        status: 200,
                        error: false,
                        params: {
                            trade_history: trade_hist
                        },
                        message: "Success"
                    })
                    /** */
                }).catch((error)=>{
                    console.log("error: ", error.message);
                })
            // } else {
            //     return res.json({
            //         status: 400,
            //         error: true,
            //         message: 
            //     })
            // }
        } else {
            // console.log("End-: ", Date.now())
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request"
            })
        }
    } catch (error) {
        console.log("End--: ", Date.now())
        console.log("Error: ", error.message)
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"
        })
    }
}

// exports.userOrderHistory = async (req, res) =>{
//     const buyStak = require('../models/buy_stack');
//     const sellStak = require('../models/sell_stack');

//     try {
//         // console.log("Start: ", Date.now())
//         const { user_id } = req.body;
//         if (user_id && validateUserId(user_id)) {

            
//             const buy_Stak = await buyStak.aggregate([
//             {$match :
//                 {user_id:user_id, order_status:1}
//             },
//             {
//                 $addFields :{
//                     type:'buy'
//                 }
//             },
//             { 
//                 $project:
//                 {
//                     currency_type:1, 
//                     compare_currency:1, 
//                     raw_price:1, 
//                     volume:1, 
//                     type:1, 
//                     order_date:1
//                 }
//             }
//         ]);
//             const sell_Stak = await sellStak.aggregate([
//                 {$match :
//                     {user_id:user_id, order_status:1}
//                 },
//                 {
//                     $addFields :{
//                         type:'sell'
//                     }
//                 },
//                 {
//                     $project:{
//                         currency_type:1, 
//                         compare_currency:1, 
//                         raw_price:1, 
//                         volume:1, 
//                         type:1, 
//                         order_date:1
//                     }
//                 }
//             ]);
//             let tdhistory = [...buy_Stak, ...sell_Stak].sort(
//                 (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//               );
//             return res.json({
//                 status: 200,
//                 error: false,
//                 data:tdhistory,
//                 message: "success"
//             })
//         } else {
//             return res.json({
//                 status: 400,
//                 error: true,
//                 message: "Invalid request"
//             })
//         }
//     } catch (error) {
//         console.log("End--: ", Date.now())
//         console.log("Error: ", error.message)
//         return res.json({
//             status: 400,
//             error: true,
//             message: "Something went wrong, please try again"
//         })
//     }  
// }

exports.userOrderHistory = async (req, res) =>{
    const buyStak = require('../models/buy_stack');
    const sellStak = require('../models/sell_stack');

    try {
        // console.log("Start: ", Date.now())
        const matchParams = req.body;
        const { user_id } = req.body;
        if (user_id && validateUserId(user_id)) {
            const page = Number(matchParams.page);
            const per_page = Number(matchParams.per_page);
            // console.log("shdgfh",matchParams);
        
            let c_buy_stak = await buyStak.find({user_id:user_id, order_status:1}).count();
            let c_sell_stak = await sellStak.find({user_id:user_id, order_status:1}).count();
            let totalCount = add(c_buy_stak, c_sell_stak);
            const buy_Stak = await buyStak.aggregate([
            {$match :
                {user_id:user_id, order_status:1}
            },
            {
                $addFields :{
                    type:'buy'
                }
            },
            { 
                $project:
                {
                    currency_type:1, 
                    compare_currency:1, 
                    raw_price:1, 
                    volume:1, 
                    type:1, 
                    order_date:1
                }
            }
        ]).skip((page - 1) * per_page)
        .limit(per_page);
            const sell_Stak = await sellStak.aggregate([
                {$match :
                    {user_id:user_id, order_status:1}
                },
                {
                    $addFields :{
                        type:'sell'
                    }
                },
                {
                    $project:{
                        currency_type:1, 
                        compare_currency:1, 
                        raw_price:1, 
                        volume:1, 
                        type:1, 
                        order_date:1
                    }
                }
            ]).skip((page - 1) * per_page)
            .limit(per_page);
            let user_data = [...buy_Stak, ...sell_Stak].sort(
                (a, b) => new Date(Number(b.order_date)) - new Date(Number(a.order_date))
              );
            return res.json({
                status: 200,
                error: false,
                user_data,
                totalCount,
                message: "success"
            })
        } else {
            return res.json({
                status: 400,
                error: true,
                message: "Invalid request"
            })
        }
    } catch (error) {
        console.log("End--: ", Date.now())
        console.log("Error: ", error.message)
        return res.json({
            status: 400,
            error: true,
            message: "Something went wrong, please try again"
        })
    }  
}

exports.orderValume = async (req, res) => {
    const buyStack = require("../models/buy_stack")
    const sellStack = require("../models/sell_stack")
    try {
  
      const { currency_type, compare_currency } = req.body;
        const buy_stak = await buyStack.aggregate([
          {$match:{currency_type:currency_type, compare_currency:compare_currency}
          },
            {
                $group: {
                  _id: "$raw_price",
                  volume: { $sum: { $toDouble: "$volume"} },
                  // raw_price: { $sum: "$raw_price" },
                  currency_type: { $first: "$currency_type" },
                  compare_currency: { $first: "$compare_currency" }
    
                //   type: { $first: "$type" },
                //   createdAt: { $first: "$createdAt" },
                  // total_count: { $sum: 1 },
                },
              },
          ]).sort({updatedAt:-1}).limit(100);
          const sell_stak = await sellStack.aggregate([
            {$match:{currency_type:currency_type, compare_currency:compare_currency}
          },
              {
                  $group: {
                    _id: "$raw_price",
                    volume: { $sum: { $toDouble: "$volume"} },
                    // raw_price: { $sum: "$raw_price" },
                    currency_type: { $first: "$currency_type" },
                    compare_currency: { $first: "$compare_currency" }
      
                  //   type: { $first: "$type" },
                  //   createdAt: { $first: "$createdAt" },
                    // total_count: { $sum: 1 },
                  },
                },
            ]).sort({updatedAt:-1}).limit(100);
          return res.json({
            status: 200,
            error: false,
            message: "success",
            buy_stak,
            sell_stak
          })
        }catch(error) {
          return res.json({
            status: 200,
            error: true,
            message: "something went wrong!",
          })
        }
    }