const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const donationRoutes = require("./routes/donationRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const smsRoutes = require("./routes/smsRoutes");
const stageRoutes = require("./routes/stageRoutes");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://disaster-relief-coordination-system.vercel.app",
  "https://disaster-relief-coordination-system-beta.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Disaster Relief Coordination API Running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    database: "connected",
    timestamp: new Date(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sms", smsRoutes);

// MODULE 3
app.use("/api/stage-updates", stageRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
