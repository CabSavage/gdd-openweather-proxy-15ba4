const fetch = require("node-fetch");

exports.handler = async function (event) {
  const { lat, lon, year, tbase = 10 } = event.queryStringParameters;

  const key = process.env.OPENWEATHER_KEY;
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);

  const results = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const timestamp = Math.floor(date.getTime() / 1000);
    const url = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&units=metric&appid=${key}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      const temps = json.hourly?.map(h => h.temp) || [];
      const tmin = Math.min(...temps);
      const tmax = Math.max(...temps);
      const gdd = Math.max(0, ((tmax + tmin) / 2) - tbase);

      results.push({
        date: date.toISOString().split("T")[0],
        tmin: Number(tmin.toFixed(1)),
        tmax: Number(tmax.toFixed(1)),
        gdd: Number(gdd.toFixed(2)),
      });
    } catch (err) {
      results.push({
        date: date.toISOString().split("T")[0],
        error: "No data",
      });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
