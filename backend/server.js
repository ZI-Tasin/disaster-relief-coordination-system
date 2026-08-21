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
const userRoutes = require("./routes/userRoutes");
const disasterRoutes = require("./routes/disasterRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const donationRoutes = require("./routes/donationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const notificationRoutes = require("./routes/notificationRoutes");
const smsRoutes = require("./routes/smsRoutes");
const stageRoutes = require("./routes/stageRoutes");
const campaignAnalyticsRoutes = require("./routes/campaignAnalyticsRoutes");

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

  // Vercel production domain
  "https://disaster-relief-coordination-system.vercel.app",

  // Vercel Git/production domain
  "https://disaster-relief-coordination-system-git-main-tasin7.vercel.app",

  // Vercel deployment domains
  "https://disaster-relief-coordination-system-five.vercel.app",
  "https://disaster-relief-coordination-system-7q4h91fe6-tasin7.vercel.app",
  "https://disaster-relief-coordination-system-bdvrdarga-tasin7.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header.
    // Useful for Postman, curl, server-to-server requests, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked:", origin);

    // Do not crash the server because of CORS.
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

/*
 * =====================================================
 * EXPRESS 5 CORS FIX
 * =====================================================
 *
 * DO NOT use:
 *
 * app.options("*", cors());
 *
 * Express 5 uses a newer path-to-regexp version
 * which rejects an unnamed "*" wildcard.
 *
 * This was causing:
 *
 * PathError [TypeError]:
 * Missing parameter name at index 1: *
 *
 * A regular expression safely matches all paths.
 */

app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

/* =====================================================
   STRIPE WEBHOOK
===================================================== */

/*
 * Stripe requires the raw request body for webhook
 * signature verification.
 *
 * This must be registered BEFORE express.json().
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

app.use(express.json({ limit: "10mb" }));

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

app.use("/api/users", userRoutes);

app.use("/api/disasters", disasterRoutes);

app.use("/api/volunteers", volunteerRoutes);

app.use("/api/donations", donationRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/sms", smsRoutes);

app.use("/api/stage-updates", stageRoutes);

app.use("/api/campaign-analytics", campaignAnalyticsRoutes);

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
  console.error("Server error:", err);

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
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:");
    console.error(error);

    process.exit(1);
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

    console.log("✅ Twilio loaded successfully - Production mode");
  } catch (error) {
    console.error("❌ Twilio initialization failed:");
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
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");
      console.log("🚀 Server started successfully");
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Frontend: ${FRONTEND_URL}`);
      console.log(`❤️ Health: http://localhost:${PORT}/health`);
      console.log("========================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    process.exit(1);
  }
}

startServer();

/* =====================================================
   GRACEFUL SHUTDOWN
===================================================== */

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");

  try {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);

    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");

  try {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);

    process.exit(1);
  }
});

module.exports = app;
