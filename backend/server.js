require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const fundAllocationRoutes = require("./routes/fundAllocationRoutes");
const smsRoutes = require("./routes/smsRoutes");

const app = express();

// =====================================================
// SERVER CONFIG
// =====================================================

const PORT = process.env.PORT || 8000;

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",

  // Vercel production domain
  "https://disaster-relief-coordination-system.vercel.app",

  // Vercel Git/production domain
  "https://disaster-relief-coordination-system-git-main-tasin7.vercel.app",

  // Vercel deployment domains
  "https://disaster-relief-coordination-system-five.vercel.app",
  "https://disaster-relief-coordination-system-7q4h91fe6-tasin7.vercel.app",
  "https://disaster-relief-coordination-system-bdvrdarga-tasin7.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

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
  }),
);

// Explicitly handle CORS preflight requests


// =====================================================
// HEALTH CHECK
// =====================================================

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

// =====================================================
// STRIPE WEBHOOK
// =====================================================

// Stripe requires the raw request body.
app.use(
  "/api/donations/webhook",
  express.raw({
    type: "application/json",
  }),
);

// =====================================================
// JSON BODY
// =====================================================

app.use(express.json());

// =====================================================
// API ROUTES
// =====================================================

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

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/sms", smsRoutes);

app.use("/api/stage-updates", require("./routes/stageRoutes"));

app.use("/api/campaign-analytics", require("./routes/campaignAnalyticsRoutes"));

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =====================================================
// DATABASE + SERVER
// =====================================================

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

startServer();
