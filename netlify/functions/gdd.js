exports.handler = async function (event) {
  const { lat, lon, year, tbase = 10 } = event.queryStringParameters;

  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);
  const results = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().slice(0, 10);
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,temperature_2m_min&timezone=America/Los_Angeles`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const tmin = data.daily.temperature_2m_min?.[0];
      const tmax = data.daily.temperature_2m_max?.[0];
      const gdd = Math.max(0, ((tmax + tmin) / 2) - tbase);

      results.push({
        date: dateStr,
        tmin: Number(tmin.toFixed(1)),
        tmax: Number(tmax.toFixed(1)),
        gdd: Number(gdd.toFixed(2))
      });
    } catch (err) {
      results.push({ date: dateStr, error: "Data fetch error" });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};
