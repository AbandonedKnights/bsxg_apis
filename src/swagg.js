//swaggerApi
const swagg = require("./swagg");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "A simple Express Library API",
		},
		servers: [
			{
				url: "http://localhost:4000",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);


app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
// app.use("/api", swagg);



const { options } = require("./router/auth");

router.get('/get-all-order', openOrder);
{
    options:{
        action: buy,sell,buysell
    }
    require: {
        status: 0,
        action: "buy"
    }
}
router.get('/get-all-orderHistory', allHistory);
{
    require: {
        status: 0,
    }
}
router.get('/suppotedCurrency', allHistory);
{
    require: {
        symbols: UNI,
    }
}

router.get("/getpairedCurrency", getpairedCurrency);;
http://localhost:4000/api/getpairedCurrency
{
    require: {
        status: true,
    }
}




















// router.get("/getChart", chart);
// router.get("/get_history", history);

// router.get("/chart/store_ohlc_token", storeOHLCToken);
// router.get("/chart/config", config);
// router.get("/chart/marks", marks);
// router.get("/chart/study_templates", study_templates);
// router.get("/chart/time", time);
// router.get("/chart/symbols", symbols);
// router.get("/chart/history", charthistory);
// router.get("/chart/symbol_info", symbol_info);
// router.get("/chart/timescale_marks", timescale_marks);
// router.get("/paired_currency", pairedCurrency);
// router.get("/suppotedCurrency", suppoted_currency);