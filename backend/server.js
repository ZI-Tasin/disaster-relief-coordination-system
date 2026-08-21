require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const twilio = require("twilio");

const app = express();

/* =========================================================
   CONFIGURATION
========================================================= */

const PORT = process.env.PORT || 8000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "https://disaster-relief-coordination-system-beta.vercel.app";

/* =========================================================
   ROUTE IMPORTS
========================================================= */

const authRoutes = require("./routes/authRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const donationRoutes = require("./routes/donationRoutes");

const campaignRoutes = require("./routes/campaignRoutes");
const campaignAnalyticsRoutes = require("./routes/campaignAnalyticsRoutes");

const fundAllocationRoutes = require("./routes/fundAllocationRoutes");
const locationRoutes = require("./routes/locationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const shelterRoutes = require("./routes/shelterRoutes");
const smsRoutes = require("./routes/smsRoutes");
const stageRoutes = require("./routes/stageRoutes");
const thresholdRoutes = require("./routes/thresholdroutes");
const weatherRoutes = require("./routes/weatherRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

/* =========================================================
   CORS
========================================================= */

/*
 * These are the frontend URLs that are allowed to call
 * this backend.
 */

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:3000",

  // Current Vercel production domain
  "https://disaster-relief-coordination-system-beta.vercel.app",

  // Other Vercel deployments
  "https://disaster-relief-coordination-system.vercel.app",
  "https://disaster-relief-coordination-system-five.vercel.app",
  "https://disaster-relief-coordination-system-git-main-tasin7.vercel.app",
  "https://disaster-relief-coordination-system-7q4h91fe6-tasin7.vercel.app",
  "https://disaster-relief-coordination-system-bdvrdarga-tasin7.vercel.app",

  // Environment-configured frontend
  FRONTEND_URL,
].filter(Boolean);

/*
 * Remove duplicates.
 */
const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

console.log("========================================");
console.log("CORS CONFIGURATION");
console.log("========================================");

uniqueAllowedOrigins.forEach((origin) => {
  console.log("Allowed:", origin);
});

console.log("========================================");

const corsOptions = {
  origin: function (origin, callback) {
    /*
     * Requests such as:
     * curl
     * Postman
     * server-to-server requests
     *
     * do not always have an Origin header.
     */
    if (!origin) {
      return callback(null, true);
    }

    if (uniqueAllowedOrigins.includes(origin)) {
      console.log("CORS ALLOWED:", origin);

      return callback(null, true);
    }

    console.log("CORS BLOCKED:", origin);

    /*
     * IMPORTANT:
     *
     * Returning false instead of throwing an error prevents
     * the backend from crashing because of CORS.
     */
    return callback(null, false);
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],

  exposedHeaders: ["Content-Length", "Content-Type"],

  optionsSuccessStatus: 204,
};

/* =========================================================
   CORS MIDDLEWARE
========================================================= */

app.use(cors(corsOptions));

/*
 * EXPRESS 5 FIX
 *
 * DO NOT USE:
 *
 * app.options("*", cors());
 *
 * Express 5 / path-to-regexp throws:
 *
 * PathError:
 * Missing parameter name at index 1: *
 *
 * RegExp is safe.
 */

app.options(/.*/, cors(corsOptions));

/* =========================================================
   STRIPE WEBHOOK
========================================================= */

/*
 * Stripe needs the raw request body.
 *
 * This must be registered BEFORE express.json()
 * for the webhook route.
 */

app.use(
  "/api/donations/webhook",
  express.raw({
    type: "application/json",
  }),
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

/* =========================================================
   REQUEST LOGGER
========================================================= */

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);

  next();
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Disaster Relief Coordination System API is running",
    status: "online",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",

    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",

    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   CORS TEST
========================================================= */

app.get("/api/cors-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS is working correctly",
    origin: req.headers.origin || null,
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   API ROUTES
========================================================= */

/*
 * AUTH
 */
app.use("/api/auth", authRoutes);

/*
 * VOLUNTEERS
 */
app.use("/api/volunteers", volunteerRoutes);

/*
 * DONATIONS
 */
app.use("/api/donations", donationRoutes);

/*
 * CAMPAIGNS
 */
app.use("/api/campaigns", campaignRoutes);

/*
 * CAMPAIGN ANALYTICS
 */
app.use("/api/campaign-analytics", campaignAnalyticsRoutes);

/*
 * FUND ALLOCATIONS
 */
app.use("/api/fund-allocations", fundAllocationRoutes);

/*
 * LOCATIONS
 */
app.use("/api/locations", locationRoutes);

/*
 * NOTIFICATIONS
 */
app.use("/api/notifications", notificationRoutes);

/*
 * REPORTS
 */
app.use("/api/reports", reportRoutes);

/*
 * SHELTERS
 */
app.use("/api/shelters", shelterRoutes);

/*
 * SMS
 */
app.use("/api/sms", smsRoutes);

/*
 * STAGE UPDATES
 */
app.use("/api/stage-updates", stageRoutes);

/*
 * THRESHOLDS
 */
app.use("/api/thresholds", thresholdRoutes);

/*
 * WEATHER
 */
app.use("/api/weather", weatherRoutes);

/*
 * ANALYTICS
 */
app.use("/api/analytics", analyticsRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("========================================");
  console.error("SERVER ERROR");
  console.error("========================================");

  console.error("Name:", err.name);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* =========================================================
   MONGODB
========================================================= */

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("========================================");

    console.error("MONGODB CONNECTION FAILED");

    console.error("========================================");

    console.error(error.message);

    throw error;
  }
}

/* =========================================================
   TWILIO
========================================================= */

let twilioClient = null;

if (
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID.startsWith("AC")
) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    console.log("Twilio loaded successfully - Production mode");
  } catch (error) {
    console.error("Twilio initialization failed:");

    console.error(error.message);
  }
} else {
  console.log("Twilio credentials not configured");
}

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    console.log("========================================");
    console.log("STARTING DISASTER RELIEF API");
    console.log("========================================");

    console.log("Node:", process.version);

    console.log("Environment:", process.env.NODE_ENV || "development");

    console.log("Port:", PORT);

    console.log("Frontend:", FRONTEND_URL);

    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");

      console.log("SERVER STARTED SUCCESSFULLY");

      console.log("========================================");

      console.log(`Port: ${PORT}`);

      console.log(`Health: /health`);

      console.log(`CORS Test: /api/cors-test`);

      console.log("========================================");
    });

    server.on("error", (error) => {
      console.error("HTTP SERVER ERROR:");

      console.error(error);
    });
  } catch (error) {
    console.error("========================================");

    console.error("SERVER STARTUP FAILED");

    console.error("========================================");

    console.error(error);

    process.exit(1);
  }
}

startServer();

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  try {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Shutdown error:", error.message);
  }

  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));

/* =========================================================
   EXPORT
========================================================= */

module.exports = app;
