require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const fundAllocationRoutes = require("./routes/fundAllocationRoutes");
const smsRoutes = require("./routes/smsRoutes");
const ensureAdmin = require("./utils/ensureAdmin");

const app = express();

const PORT = process.env.PORT || 8000;

const FRONTEND_URL =
  process.env.CLIENT_URL ||
  "https://disaster-relief-coordination-system-steel.vercel.app";

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "https://disaster-relief-coordination-system-steel.vercel.app",

  "https://disaster-relief-coordination-system.vercel.app",

  "https://disaster-relief-coordination-system-git-main-tasin7.vercel.app",

  "https://disaster-relief-coordination-system-five.vercel.app",

  "https://disaster-relief-coordination-system-7q4h91fe6-tasin7.vercel.app",

  "https://disaster-relief-coordination-system-bdvrdarga-tasin7.vercel.app",

  FRONTEND_URL,
]);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  // Allow Vercel preview deployments for this project.
  if (
    /^https:\/\/disaster-relief-coordination-system-[a-z0-9-]+\.vercel\.app$/i.test(
      origin,
    )
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        if (origin) {
          console.log(`CORS allowed: ${origin}`);
        }

        return callback(null, true);
      }

      console.warn(`CORS blocked: ${origin}`);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Stripe-Signature",
    ],

    optionsSuccessStatus: 204,
  }),
);

// -----------------------------------------------------
// HEALTH
// -----------------------------------------------------

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
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------
// STRIPE WEBHOOK
// IMPORTANT: raw body MUST come before express.json()
// -----------------------------------------------------

app.use(
  "/api/donations/webhook",
  express.raw({
    type: "application/json",
  }),
);

// -----------------------------------------------------
// JSON
// -----------------------------------------------------

app.use(express.json());

// -----------------------------------------------------
// ROUTES
// -----------------------------------------------------

app.use("/api/reports", require("./routes/reportRoutes"));

app.use("/api/volunteers", require("./routes/volunteerRoutes"));

app.use("/api/thresholds", require("./routes/thresholdroutes"));

app.use("/api/locations", require("./routes/locationRoutes"));

app.use("/api/shelters", require("./routes/shelterRoutes"));

app.use("/api/analytics", require("./routes/analyticsRoutes"));

app.use("/api/weather", require("./routes/weatherRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/campaigns", require("./routes/campaignRoutes"));

app.use("/api/donations", require("./routes/donationRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/fund-allocations", fundAllocationRoutes);

app.use("/api/sms", smsRoutes);

app.use("/api/stage-updates", require("./routes/stageRoutes"));

app.use("/api/campaign-analytics", require("./routes/campaignAnalyticsRoutes"));

// -----------------------------------------------------
// 404
// -----------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// -----------------------------------------------------
// ERROR HANDLER
// -----------------------------------------------------

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// -----------------------------------------------------
// DATABASE + SERVER
// -----------------------------------------------------

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    // Guarantee production admin exists.
    await ensureAdmin();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
