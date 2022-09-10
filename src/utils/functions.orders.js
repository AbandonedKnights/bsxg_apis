const { sendBalanceToUserWallet } = require("./function.wallets");
const { createSocketClient } = require("./functions.socket");
const { validateOrderId } = require("./validator");
const socket = createSocketClient('kujgwvfq-z-ghosttown-z-1fhhup0p6');

async function executeOrder(order, deepCheck = true) {
    const { calculateTakerFee, calculateMakerFee } = require('./functions');
    const isvalidorder = await verifieOrder(order, deepCheck);
    if (!isvalidorder) { return false; }
    if (order.order_status != 0) { return false; }
    let history_id = false;
    if (order.order_direction == 'sell') {
        const BuyStack = require('../models/buy_stack');
        try {
            const buy_orders = await BuyStack.find({ currency_type: { $regex: new RegExp(order.currency_type, "i") }, compare_currency: { $regex: new RegExp(order.compare_currency, "i") }, order_status: 0, raw_price: order.raw_price });
            if (buy_orders.length <= 0) { return false; }
            buy_orders.map(async (order_node) => {
                const available_volume = parseFloat(order.volume) - parseFloat(order.total_executed);
                if (available_volume > 0) {
                    const next_order_available_volume = parseFloat(order_node.volume) - parseFloat(order_node.total_executed);
                    if (next_order_available_volume == available_volume) {
                        // update both 
                        const taker_fee = calculateTakerFee(available_volume);
                        const maker_fee = calculateMakerFee(parseFloat(available_volume) * parseFloat(order.raw_price));
                        const history = {
                            currency_type: order.currency_type,
                            compare_currency: order.currency_type,
                            price: order.raw_price,
                            volume: available_volume,
                            sell_user_id: order.user_id,
                            buy_user_id: order_node.user_id,
                            sell_order_id: order.order_id,
                            buy_order_id: order_node.order_id,
                            trade_type: order.order_type,
                            commition_fee: taker_fee + "+" + maker_fee
                        };
                        const seller_order_update_status = await updateOrder(order.order_id, available_volume, order_node.user_id, 'sell');
                        const buyer_order_update_status = await updateOrder(order_node.order_id, available_volume, order.user_id, 'buy');
                        const seller_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order.user_id, (parseFloat(available_volume) - parseFloat(maker_fee)), order.raw_price, order.order_type == 'sell' ? 'sub' : 'add');
                        const buyer_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order_node.user_id, (parseFloat(available_volume) - parseFloat(taker_fee)), order.raw_price, order.order_type != 'sell' ? 'sub' : 'add');
                        // console.log("seller_wallet_update_status: ", seller_wallet_update_status);
                        // console.log("buyer_wallet_update_status: ", buyer_wallet_update_status);
                        // console.log("seller_order_update_status: ", seller_order_update_status);
                        // console.log("buyer_order_update_status: ", buyer_order_update_status);
                        history_id = await createOrderHistory(history);
                        let obj = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            raw_price: order.raw_price,
                            volume: available_volume
                        }
                        socket.emit("update_order_history", obj);
                        console.log("history_id: ", history_id);
                    } else if (next_order_available_volume > available_volume) {
                        // update self
                        const taker_fee = calculateTakerFee(next_order_available_volume);
                        const maker_fee = calculateMakerFee(parseFloat(next_order_available_volume) * parseFloat(order.raw_price));
                        const history = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            price: order.raw_price,
                            volume: available_volume,
                            sell_user_id: order.user_id,
                            buy_user_id: order_node.user_id,
                            sell_order_id: order.order_id,
                            buy_order_id: order_node.order_id,
                            trade_type: order.order_type,
                            commition_fee: taker_fee + "+" + maker_fee
                        };
                        const seller_order_update_status = await updateOrder(order.order_id, available_volume, order_node.user_id, 'sell');
                        const buyer_order_update_status = await updateOrder(order_node.order_id, available_volume, order.user_id, 'buy');
                        const seller_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order.user_id, (parseFloat(available_volume) - parseFloat(maker_fee)), order.raw_price, order.order_type == 'sell' ? 'sub' : 'add');
                        const buyer_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order_node.user_id, (parseFloat(available_volume) - parseFloat(taker_fee)), order.raw_price, order.order_type != 'sell' ? 'sub' : 'add');

                        history_id = await createOrderHistory(history);
                        let obj = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            raw_price: order.raw_price,
                            volume: available_volume
                        }
                        socket.emit("update_order_history", obj);
                    } else if (next_order_available_volume < available_volume) {
                        // update him
                        const taker_fee = calculateTakerFee(available_volume);
                        const maker_fee = calculateMakerFee(parseFloat(available_volume) * parseFloat(order.raw_price));
                        const history = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            price: order.raw_price,
                            volume: next_order_available_volume,
                            sell_user_id: order.user_id,
                            buy_user_id: order_node.user_id,
                            sell_order_id: order.order_id,
                            buy_order_id: order_node.order_id,
                            trade_type: order.order_type,
                            commition_fee: taker_fee + "+" + maker_fee

                        };
                        const seller_order_update_status = await updateOrder(order.order_id, next_order_available_volume, order_node.user_id, 'sell');
                        const buyer_order_update_status = await updateOrder(order_node.order_id, next_order_available_volume, order.user_id, 'buy');
                        const seller_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order.user_id, (parseFloat(next_order_available_volume) - parseFloat(maker_fee)), order.raw_price, order.order_type == 'sell' ? 'sub' : 'add');
                        const buyer_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order_node.user_id, (parseFloat(next_order_available_volume) - parseFloat(taker_fee)), order.raw_price, order.order_type != 'sell' ? 'sub' : 'add');

                        history_id = await createOrderHistory(history)
                        let obj = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            raw_price: order.raw_price,
                            volume: next_order_available_volume
                        }
                        socket.emit("update_order_history", obj);
                    }
                }
            })
        } catch (error) {
            console.log("Error: >from: utils> functions.orders > executeorder > try-sell (fetching buy stack): ", error.message);
            return false;
        }
    } else if (order.order_direction == 'buy') {
        const SellStack = require('../models/sell_stack');
        try {
            const sell_orders = await SellStack.find({ currency_type: { $regex: new RegExp(order.currency_type, "i") }, compare_currency: { $regex: new RegExp(order.compare_currency, "i") }, order_status: 0, raw_price: order.raw_price });
            if (sell_orders.length <= 0) { return false; }
            sell_orders.map(async (order_node) => {
                const available_volume = parseFloat(order.volume) - parseFloat(order.total_executed);
                if (available_volume > 0) {
                    const next_order_available_volume = parseFloat(order_node.volume) - parseFloat(order_node.total_executed);
                    if (next_order_available_volume == available_volume) {
                        // update both 
                        const taker_fee = calculateTakerFee(available_volume);
                        const maker_fee = calculateMakerFee(parseFloat(available_volume) * parseFloat(order.raw_price));
                        const history = {
                            currency_type: order.currency_type,
                            compare_currency: order.currency_type,
                            price: order.raw_price,
                            volume: available_volume,
                            sell_user_id: order_node.user_id,
                            buy_user_id: order.user_id,
                            sell_order_id: order_node.order_id,
                            buy_order_id: order.order_id,
                            trade_type: order.order_type,
                            commition_fee: taker_fee + "+" + maker_fee
                        };
                        const seller_order_update_status = await updateOrder(order_node.order_id, available_volume, order.user_id, 'sell');
                        const buyer_order_update_status = await updateOrder(order.order_id, available_volume, order_node.user_id, 'buy');
                        const seller_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order_node.user_id, (parseFloat(available_volume) - parseFloat(maker_fee)), order.raw_price, order.order_type == 'sell' ? 'sub' : 'add');
                        const buyer_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order.user_id, (parseFloat(available_volume) - parseFloat(taker_fee)), order.raw_price, order.order_type != 'sell' ? 'sub' : 'add');
                        // console.log("seller_wallet_update_status: ", seller_wallet_update_status);
                        // console.log("buyer_wallet_update_status: ", buyer_wallet_update_status);
                        // console.log("seller_order_update_status: ", seller_order_update_status);
                        // console.log("buyer_order_update_status: ", buyer_order_update_status);
                        history_id = await createOrderHistory(history);
                        let obj = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            raw_price: order.raw_price,
                            volume: available_volume
                        }
                        socket.emit("update_order_history", obj);
                        // console.log("history_id: ", history_id);
                    } else if (next_order_available_volume > available_volume) {
                        // update self
                        const taker_fee = calculateTakerFee(next_order_available_volume);
                        const maker_fee = calculateMakerFee(parseFloat(next_order_available_volume) * parseFloat(order.raw_price));
                        const history = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            price: order.raw_price,
                            volume: available_volume,
                            sell_user_id: order_node.user_id,
                            buy_user_id: order.user_id,
                            sell_order_id: order_node.order_id,
                            buy_order_id: order.order_id,
                            trade_type: order.order_type,
                            commition_fee: taker_fee + "+" + maker_fee
                        };
                        const seller_order_update_status = await updateOrder(order_node.order_id, available_volume, order.user_id, 'sell');
                        const buyer_order_update_status = await updateOrder(order.order_id, available_volume, order_node.user_id, 'buy');
                        const seller_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order_node.user_id, (parseFloat(available_volume) - parseFloat(maker_fee)), order.raw_price, order.order_type == 'sell' ? 'sub' : 'add');
                        const buyer_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order.user_id, (parseFloat(available_volume) - parseFloat(taker_fee)), order.raw_price, order.order_type != 'sell' ? 'sub' : 'add');

                        history_id = await createOrderHistory(history);
                        let obj = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            raw_price: order.raw_price,
                            volume: available_volume
                        }
                        socket.emit("update_order_history", obj);

                    } else if (next_order_available_volume < available_volume) {
                        // update him
                        const taker_fee = calculateTakerFee(available_volume);
                        const maker_fee = calculateMakerFee(parseFloat(available_volume) * parseFloat(order.raw_price));
                        const history = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            price: order.raw_price,
                            volume: next_order_available_volume,
                            sell_user_id: order_node.user_id,
                            buy_user_id: order.user_id,
                            sell_order_id: order_node.order_id,
                            buy_order_id: order.order_id,
                            trade_type: order.order_type,
                            commition_fee: taker_fee + "+" + maker_fee

                        };
                        const seller_order_update_status = await updateOrder(order_node.order_id, next_order_available_volume, order.user_id, 'sell');
                        const buyer_order_update_status = await updateOrder(order.order_id, next_order_available_volume, order_node.user_id, 'buy');
                        const seller_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order_node.user_id, (parseFloat(next_order_available_volume) - parseFloat(maker_fee)), order.raw_price, order.order_type == 'sell' ? 'sub' : 'add');
                        const buyer_wallet_update_status = await sendBalanceToUserWallet(order.currency_type, order.compare_currency, order.user_id, (parseFloat(next_order_available_volume) - parseFloat(taker_fee)), order.raw_price, order.order_type != 'sell' ? 'sub' : 'add');

                        history_id = await createOrderHistory(history)
                        let obj = {
                            currency_type: order.currency_type,
                            compare_currency: order.compare_currency,
                            raw_price: order.raw_price,
                            volume: next_order_available_volume
                        }
                        socket.emit("update_order_history", obj);
                    }
                } 
            })
        } catch (error) {
            console.log("Error: >from: utils> functions.orders > executeorder > try-sell (fetching buy stack): ", error.message);
            return false;
        }
    } else { return false; }
    return true;
}
async function verifieOrder(order, deepCheck = true) {
    // const SellStack = require('../models/sell_stack');
    try {
        const { order_id,
            user_id,
            currency_type,
            compare_currency,
            execution_time,
            total_executed,
            last_reansaction,
            executed_from,
            order_type,
            order_directon,
            volume,
            raw_price,
            order_status } = order;
            console.log("data")
        if (!await validateOrderId(order_id, order_type, deepCheck)) {
            return false;
        }
        console.log("data1")
        if (deepCheck) {
            const { validateCurrency, validateAmount, validatePrice, validateUserId } = require('../utils/validator');
            if (!validateUserId(user_id)) { return false; }
            if (!validateAmount(volume)) { return false; }
            if (!validatePrice(raw_price)) { return false; }
            if (!validateCurrency(currency_type)) { return false; }
            if (!validateCurrency(compare_currency)) { return false; }
            if (order_directon != 'sell' && order_directon != 'buy') { return false; }
            return true;
        }
        if (total_executed >= volume) { return false; }
    } catch (error) {
        console.log("Error: >from: utils> functions.orders > verifieOrder > try-parent (export variable and more): ", error.message);
        return false;
    }
    console.log("data2")
    return true;
}
async function createOrderHistory(history) {
    const TradeHistory = require('../models/trade_history');
    const { createUniqueID } = require("./functions");
    const history_id = createUniqueID('history');
    try {
        const trade_date = Date.now();
        const { currency_type, compare_currency, price, volume, sell_user_id, buy_user_id, sell_order_id, buy_order_id, trade_type, commition_fee } = history;
        const history_token = await TradeHistory.create({
            history_id, currency_type, compare_currency, price, volume, sell_user_id, buy_user_id, sell_order_id, buy_order_id, trade_type, trade_date, commition_fee
        });
    } catch (error) {
        console.log("Error: >from: utils> functions.orders > updateOrderHistory > try-extract and insert (fetching buy stack): ", error.message);
        return false;
    }
    return history_id;
}
async function updateOrder(order_id, total_executed, executed_from, order_direction) {
    if (order_direction == 'sell') {
        try {
            const SellStack = require('../models/sell_stack');
            const order = await SellStack.findOne({ order_id: order_id });
            const new_total_executed = parseFloat(order.total_executed) + parseFloat(total_executed);
            const new_status = order.volume == new_total_executed ? 1 : 0;
            const new_last_transaction = order.last_reansaction + ',' + total_executed;
            const new_execution_time = order.execution_time + ',' + Date.now();
            const new_executed_from = order.executed_from + ',' + executed_from;

            await SellStack.updateOne({ order_id: order_id }, {
                $set: {
                    order_status    : new_status,
                    total_executed  : new_total_executed,
                    last_transaction: new_last_transaction,
                    execution_time  : new_execution_time,
                    executed_from   : new_executed_from
                }
            })
            return true;
        } catch (error) {
            console.log("Error: >from: utils> functions.orders > updateOrder > try-extract and insert (fetching buy stack): ", error.message);
            return false;
        }
    } else if (order_direction == 'buy') {
        try {
            const BuyStack = require('../models/buy_stack');
            const order = await BuyStack.findOne({ order_id: order_id });
            const new_total_executed = parseFloat(order.total_executed) + parseFloat(total_executed);
            const new_status = order.volume == new_total_executed ? 1 : 0;
            const new_last_transaction = order.last_reansaction + ',' + total_executed;
            const new_execution_time = order.execution_time + ',' + Date.now();
            const new_executed_from = order.executed_from + ',' + executed_from;

            await BuyStack.updateOne({ order_id: order_id }, {
                $set: {
                    order_status: new_status,
                    total_executed: new_total_executed,
                    last_transaction: new_last_transaction,
                    execution_time: new_execution_time,
                    executed_from: new_executed_from
                }
            })
            return true;
        } catch (error) {
            console.log("Error: >from: utils> functions.orders > updateOrder > try-extract and insert (fetching buy stack): ", error.message);
            return false;
        }
    } else {
        return false;
    }
}
module.exports = {
    executeOrder
}