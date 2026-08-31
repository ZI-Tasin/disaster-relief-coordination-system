const axios = require("axios");
const WeatherLog = require("../models/WeatherLog");
const DisasterReport = require("../models/disasterReport");

// most severe check first so the boundaries (30, 50, 1, 5) fall on the right side
function getRecommendation(wind, precip) {
  if (wind > 50 || precip > 5) return "Do Not Deploy";
  if (wind >= 30 || precip >= 1) return "Exercise Caution";
  return "Safe to Deploy";
}

// just a friendly one-liner for the UI, nothing scientific
function describeCondition(wind, precip) {
  if (precip > 5) return "Heavy rain";
  if (precip > 1) return "Light rain";
  if (wind > 50) return "Strong winds";
  if (wind > 30) return "Windy";
  return "Clear";
}

exports.getIncidents = async (req, res) => {
  try {
    const reports = await DisasterReport.find({
      status: { $regex: /^verified$/i },
      latitude: { $ne: null },
      longitude: { $ne: null },
    }).select("crisisType district subdistrict latitude longitude");

    const incidents = reports.map((r) => ({
      id: r._id,
      title: `${r.crisisType} - ${r.subdistrict}, ${r.district}`,
      district: r.district,
      lat: r.latitude,
      lng: r.longitude,
    }));

    res.json(incidents);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load incidents", detail: err.message });
  }
};

exports.queryWeather = async (req, res) => {
  try {
    const { lat, lng, incidentId } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lng,
        current: "temperature_2m,precipitation,wind_speed_10m",
      },
    });

    const temperature = data.current.temperature_2m;
    const windSpeed = data.current.wind_speed_10m;
    const precipitation = data.current.precipitation;
    const recommendation = getRecommendation(windSpeed, precipitation);

    const log = await WeatherLog.create({
      incident: incidentId,
      latitude: lat,
      longitude: lng,
      weatherSummary: {
        temperature,
        windSpeed,
        precipitation,
        condition: describeCondition(windSpeed, precipitation),
      },
      recommendation,
      queriedBy: req.user?._id, // req.user comes from protect middleware
    });

    res.status(201).json(log);
  } catch (err) {
    // split "Open-Meteo is having a bad day" from "we messed up" so the frontend can tell them apart
    if (err.response) {
      return res
        .status(502)
        .json({ error: "Open-Meteo request failed", detail: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};
