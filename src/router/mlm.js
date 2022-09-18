const express = require('express');
const router = express.Router();

router.post("/", ()=>{

});

router.get("/get-packages", async (req, res)=>{
    try {
        const PackageModel = require("../mlm_models/packages");
        const packages = await PackageModel.find();
        return res.status(200).json({packages});
    } catch(error){
        return res.status(400).json({message: error.message});
    }
})

module.exports = router;