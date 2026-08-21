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
   CORS
===================================================== */

const FRONTEND_URL =
  process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";

const allowedOrigins = [
  FRONTEND_URL,

  "http://localhost:5173",
  "http://localhost:3000",

  // Vercel production
  "https://disaster-relief-coordination-system.vercel.app",

  // Vercel Git / production
  "https://disaster-relief-coordination-system-git-main-tasin7.vercel.app",

  // Vercel deployments
  "https://disaster-relief-coordination-system-five.vercel.app",
  "https://disaster-relief-coordination-system-7q4h91fe6-tasin7.vercel.app",
  "https://disaster-relief-coordination-system-bdvrdarga-tasin7.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without Origin
    // e.g. curl, Postman, server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked:", origin);

    // Don't crash the application because of CORS.
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

  optionsSuccessStatus: 204,
};

/* =====================================================
   EXPRESS 5 CORS FIX
===================================================== */

/*
 * IMPORTANT:
 *
 * Express 5 does NOT accept:
 *
 * app.options("*", cors());
 *
 * This caused:
 *
 * PathError:
 * Missing parameter name at index 1: *
 *
 * Use a RegExp instead.
 */

app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

/* =====================================================
   STRIPE WEBHOOK
===================================================== */

/*
 * Stripe needs the raw request body for
 * webhook signature verification.
 *
 * This MUST be before express.json().
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
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Disaster Relief Coordination System API is running",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

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
  console.error(err);

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
    console.log("🔄 Checking MongoDB configuration...");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("========================================");

    console.error("❌ MONGODB CONNECTION FAILED");

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

    console.log("✅ Twilio initialized successfully");
  } catch (error) {
    console.error("⚠️ Twilio initialization failed:");

    console.error(error.message);
  }
} else {
  console.log("⚠️ Twilio credentials not configured");
}

/* =====================================================
   START SERVER
===================================================== */

async function startServer() {
  try {
    console.log("========================================");

    console.log("🚀 Starting Disaster Relief API");

    console.log("========================================");

    console.log("Node version:", process.version);

    console.log("Environment:", process.env.NODE_ENV || "development");

    console.log("Port:", PORT);

    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");

      console.log("✅ SERVER STARTED SUCCESSFULLY");

      console.log("========================================");

      console.log(`📡 Port: ${PORT}`);

      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

      console.log(`🔗 Frontend: ${FRONTEND_URL}`);

      console.log(`❤️ Health: /health`);

      console.log("========================================");
    });

    server.on("error", (error) => {
      console.error("❌ HTTP SERVER ERROR");

      console.error(error);
    });
  } catch (error) {
    console.error("========================================");

    console.error("❌ SERVER STARTUP FAILED");

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

    console.log("✅ MongoDB connection closed");
  } catch (error) {
    console.error("❌ MongoDB shutdown error:", error.message);
  }

  process.exit(0);
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

module.exports = app;
