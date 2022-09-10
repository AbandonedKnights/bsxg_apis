const { getChartDataByCurrency, getHistory, getConfigExchange, getMarkExchange, getStudyTemplateExchange, getTimeExchange, getSymbolExchange, getHistoryExchange, getsymbolInfoExchange, gettimeScaleExchange, getHistoryFROMCMC, storeOHLCCustom } = require("../utils/functions.chart");

async function chart(req, res) {
    // http://localhost/api/chart/history?symbol=BitCoin&resolution=1D&from=1633261118&to=1634125118&countback=2
    try {
        const { currency_type, compare_currency } = req.query;
        const data = await getChartDataByCurrency(currency_type.split(','), compare_currency.split(','));
        console.log(data)
        return res.json({
            status: 200,
            error: false,
            message: "Success!",
            data
        })
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function history(req, res) {
    // http://localhost/api/chart/history?symbol=BitCoin&resolution=1D&from=1633261118&to=1634125118&countback=2
    try {
        const { symbol, resolution, from, to, countback } = req.query;
        const currency = symbol.split('-')[0];
        const compare = symbol.split('-')[1];
        const data = await getHistory(currency, compare, resolution, from, to, countback);
        console.log(data)
        return res.json({
            status: 200,
            error: false,
            message: "Success!",
            data
        })
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function config(req, res) {
    try {
        const data = await getConfigExchange();
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function marks(req, res) {
    try {
        const data = await getMarkExchange();
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function study_templates(req, res) {
    console.log("hit")
    try {
        const data = await getStudyTemplateExchange();
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function time(req, res) {
    try {
        const data = await getTimeExchange();
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function symbols(req, res) {
    try {
        const { symbol} = req.query;
        const data = await getSymbolExchange(symbol);
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function charthistory(req, res) {
    try {
        const { symbol,resolution, from, to, countback} = req.query;
        const data = await getHistoryFROMCMC(symbol,resolution, from, to, countback);
        // const data = await getHistoryExchange(symbol,resolution, from, to, countback);
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function symbol_info(req, res) {
    try {
        const data = await getsymbolInfoExchange();
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function timescale_marks(req, res) {
    try {
        const data = await gettimeScaleExchange();
        return res.json(data)
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: `Error! ${error.message}`
        })
    }
}
async function storeOHLCToken(req, res) {
    try {
        const {currency_type} = req.query;
        let data = await storeOHLCCustom(currency_type.toUpperCase())
        return res.json({
            status: 200,
            error: false,
            data,
            message: 'Success'
        })
    } catch (error) {
        return res.json({
            status: 400,
            error: true,
            message: 'Error! chart.js>Testing.js'+error.message
        })
    }
}

module.exports = {
    chart,
    history,
    config,
    marks,
    study_templates,
    time, 
    symbols,
    charthistory,
    symbol_info,
    timescale_marks,
    storeOHLCToken,
}