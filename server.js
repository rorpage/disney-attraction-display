var express = require('express');
var app = express();
// var os = require("os");
const fetch = require("node-fetch");

// var hostname = os.hostname();
// var port = process.env.PORT || 3000;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/api/info/:id", async (req, resp) => {
    var attraction_id = req.params.id || 80010191;

    const [attraction_info, weather] = await Promise.all([
        getAttractionInformation(attraction_id),
        getWeatherInformation()
    ]);

    resp.json({
        'attraction_info': attraction_info,
        'weather': weather
    });
});

async function getAttractionInformation(attraction_id) {
    let attractionRequest = await fetch('https://wdwntnowapi.azurewebsites.net/api/v2/mobile/attraction/' + attraction_id);
    return await attractionRequest.json();
}

async function getWeatherInformation() {
    let weatherRequest = await fetch('https://weather.wdwnt.com/api/wdw');
    return await weatherRequest.json();
}

// app.listen(port);
// console.log(hostname + ": App listening on port " + port);
module.exports = app;
