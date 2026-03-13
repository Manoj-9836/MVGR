const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const wellnessRoutes = require("./routes/wellnessRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

function getAllowedOrigins() {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(",").map((origin) => origin.trim()))
    .filter(Boolean);

  return new Set([
    ...configuredOrigins,
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:5173"
  ]);
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests and non-browser tools with no Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "habitlens-backend" });
});

app.use("/api", wellnessRoutes);

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/habitlens";
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    console.warn("Starting backend in in-memory fallback mode.");
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  });
