import express from 'express';
var app = express();
import fetch from "node-fetch";

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

    let attraction = {
        id: attraction_info.id,
        name: attraction_info.name,
        parkId: attraction_info.parkId,
        waitTime: attraction_info.waitTime
    };

    let clientDate = new Date();
    let utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
    let serverDate = new Date(utc + (3600000 * -4));

    let hour = (serverDate.getHours() + 11) % 12 + 1;
    let hour_display = (hour < 10) ? `0${hour}` : hour;
    let minutes = serverDate.getMinutes();
    let minutes_display = (minutes < 10) ? `0${minutes}` : minutes;
    let time = `${hour_display}:${minutes_display}`;

    let month = serverDate.getMonth() + 1;
    let month_display = (month < 10) ? `0${month}` : month;
    let day = serverDate.getDate();
    let day_display = (day < 10) ? `0${day}` : day;
    let date = `${month_display}/${day_display}`;

    resp.json({
        attraction_info: attraction,
        weather: weather.currently.temperature,
        time,
        date
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

export default app;
