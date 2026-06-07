const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/patients",     require("./routes/patients"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/doctors",      require("./routes/doctors"));
app.use("/api/dashboard",    require("./routes/dashboard"));

// Health check
app.get("/", (req, res) => res.json({ message: "MedCore API Running ✅" }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));
