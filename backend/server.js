require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const twilio = require("twilio");

const app = express();

/* =====================================================
   ROUTES
===================================================== */

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

/* =====================================================
   SERVER CONFIG
===================================================== */

const PORT = process.env.PORT || 8000;

/* =====================================================
   FRONTEND / CORS CONFIG
===================================================== */

const FRONTEND_URL =
  process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";

/*
 * IMPORTANT:
 * Your current Vercel frontend is:
 *
 * https://disaster-relief-coordination-system-beta.vercel.app
 */

const allowedOrigins = [
  // Environment variable
  FRONTEND_URL,

  // Local development
  "http://localhost:5173",
  "http://localhost:3000",

  // CURRENT VERCEL FRONTEND
  "https://disaster-relief-coordination-system-beta.vercel.app",

  // Other Vercel deployments
  "https://disaster-relief-coordination-system.vercel.app",
  "https://disaster-relief-coordination-system-five.vercel.app",
  "https://disaster-relief-coordination-system-git-main-tasin7.vercel.app",
  "https://disaster-relief-coordination-system-7q4h91fe6-tasin7.vercel.app",
  "https://disaster-relief-coordination-system-bdvrdarga-tasin7.vercel.app",
].filter(Boolean);

/* =====================================================
   CORS OPTIONS
===================================================== */

const corsOptions = {
  origin: function (origin, callback) {
    /*
     * Requests without Origin:
     * curl
     * Postman
     * server-to-server
     */
    if (!origin) {
      return callback(null, true);
    }

    /*
     * Allowed frontend
     */
    if (allowedOrigins.includes(origin)) {
      console.log("CORS allowed:", origin);
      return callback(null, true);
    }

    /*
     * Don't crash the server because of CORS.
     */
    console.log("CORS blocked:", origin);

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

/* =====================================================
   CORS MIDDLEWARE
===================================================== */

app.use(cors(corsOptions));

/*
 * EXPRESS 5 FIX
 *
 * DO NOT use:
 *
 * app.options("*", cors());
 *
 * Express 5 + path-to-regexp rejects "*".
 *
 * RegExp works correctly.
 */

app.options(/.*/, cors(corsOptions));

/* =====================================================
   STRIPE WEBHOOK
===================================================== */

/*
 * Stripe requires the RAW request body.
 *
 * This MUST come before express.json().
 */

app.use(
  "/api/donations/webhook",
  express.raw({
    type: "application/json",
  }),
);

/* =====================================================
   BODY PARSING
===================================================== */

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

/* =====================================================
   REQUEST LOGGER
===================================================== */

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);

  next();
});

/* =====================================================
   ROOT
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Disaster Relief Coordination System API is running",
    status: "online",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",

    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",

    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   CORS TEST
===================================================== */

app.get("/api/cors-test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CORS is working correctly",
    origin: req.headers.origin || null,
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);

app.use("/api/volunteers", volunteerRoutes);

app.use("/api/donations", donationRoutes);

app.use("/api/campaigns", campaignRoutes);

app.use("/api/campaign-analytics", campaignAnalyticsRoutes);

app.use("/api/fund-allocations", fundAllocationRoutes);

app.use("/api/locations", locationRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/shelters", shelterRoutes);

app.use("/api/sms", smsRoutes);

app.use("/api/stage-updates", stageRoutes);

app.use("/api/thresholds", thresholdRoutes);

app.use("/api/weather", weatherRoutes);

app.use("/api/analytics", analyticsRoutes);

/* =====================================================
   404 HANDLER
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/* =====================================================
   ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error("========================================");

  console.error("SERVER ERROR");

  console.error("========================================");

  console.error("Name:", err.name);

  console.error("Message:", err.message);

  console.error("Stack:", err.stack);

  /*
   * CORS error
   */
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

/* =====================================================
   MONGODB
===================================================== */

async function connectDB() {
  try {
    console.log("Checking MongoDB configuration...");

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined in Render Environment Variables",
      );
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

    console.error("Name:", error.name);

    console.error("Message:", error.message);

    console.error(error);

    throw error;
  }
}

/* =====================================================
   TWILIO
===================================================== */

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
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

/* =====================================================
   START SERVER
===================================================== */

async function startServer() {
  try {
    console.log("========================================");

    console.log("Starting Disaster Relief API");

    console.log("========================================");

    console.log("Node version:", process.version);

    console.log("Environment:", process.env.NODE_ENV || "development");

    console.log("Port:", PORT);

    console.log("Frontend URL:", FRONTEND_URL);

    console.log("Allowed origins:");

    allowedOrigins.forEach((origin) => {
      console.log(" -", origin);
    });

    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");

      console.log("SERVER STARTED SUCCESSFULLY");

      console.log("========================================");

      console.log(`Port: ${PORT}`);

      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

      console.log(`Frontend: ${FRONTEND_URL}`);

      console.log(`Health: /health`);

      console.log(`CORS Test: /api/cors-test`);

      console.log("========================================");
    });

    server.on("error", (error) => {
      console.error("HTTP SERVER ERROR");

      console.error(error);
    });
  } catch (error) {
    console.error("========================================");

    console.error("SERVER STARTUP FAILED");

    console.error("========================================");

    console.error("Name:", error.name);

    console.error("Message:", error.message);

    console.error(error);

    process.exit(1);
  }
}

startServer();

/* =====================================================
   GRACEFUL SHUTDOWN
===================================================== */

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  try {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("MongoDB shutdown error:", error.message);
  }

  process.exit(0);
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

/* =====================================================
   EXPORT
===================================================== */

module.exports = app;
