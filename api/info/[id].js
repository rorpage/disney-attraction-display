import fetch from "node-fetch";

async function handler(req, resp) {
  var attraction_id = req.query.id || 80010191;

  const [attraction_info, weather] = await Promise.all([
    getAttractionInformation(attraction_id),
    getWeatherInformation()
  ]);

  let attraction = {
    id: attraction_info.id,
    name: attraction_info.name,
    parkId: parseInt(attraction_info.parkId),
    waitTime: getAttractionWaitTime(attraction_info)
  };

  let utc_offset = getUtcOffset(attraction_info.parkId);

  let client_date = new Date();
  let utc = client_date.getTime() + (client_date.getTimezoneOffset() * 60000);
  let server_date = new Date(utc + (3600000 * utc_offset));

  let hour = (server_date.getHours() + 11) % 12 + 1;
  let hour_display = (hour < 10) ? `0${hour}` : hour;
  let minutes = server_date.getMinutes();
  let minutes_display = (minutes < 10) ? `0${minutes}` : minutes;
  let time = `${hour_display}:${minutes_display}`;

  let month = server_date.getMonth() + 1;
  let month_display = (month < 10) ? `0${month}` : month;
  let day = server_date.getDate();
  let day_display = (day < 10) ? `0${day}` : day;
  let date = `${month_display}/${day_display}`;

  resp.header("Access-Control-Allow-Origin", "*");
  resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  resp.json({
    attraction_info: attraction,
    temperature: Math.round(weather.currently.temperature),
    time,
    date
  });
}

async function getAttractionInformation(attraction_id) {
  let attractionRequest = await fetch(`https://wdwnt-now-api.herokuapp.com/api/attractions/${attraction_id}`);
  return await attractionRequest.json();
}

async function getWeatherInformation() {
  let weatherRequest = await fetch('https://weather.wdwnt.com/api/wdw');
  return await weatherRequest.json();
}

function getAttractionWaitTime(attraction_info) {
  let wait_time = attraction_info.currentStatus;

  if (wait_time.includes("Closed")) {
    return "Closed";
  } else if (wait_time.includes("Temporary")) {
    return "Temp. closure";
  }

  return attraction_info.currentStatus.replace('Posted wait', 'Wait');
}

function getUtcOffset(park_id) {
  let utc_offset = -5;

  // Anaheim
  if (park_id === 330339 || park_id === 336894) {
    utc_offset = -7;
  // Tokyo
  } else if (park_id === 1 || park_id === 2) {
    utc_offset = 9;
  // Paris
  } else if (park_id === 3 || park_id === 4) {
    utc_offset = 2;
  // Hong Kong
  } else if (park_id === 5) {
    utc_offset = 8;
  // Shanghai
  } else if (park_id === 6) {
    utc_offset = 8;
  }

  return utc_offset;
}

export default handler;
