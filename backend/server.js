const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const wellnessRoutes = require("./routes/wellnessRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
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
