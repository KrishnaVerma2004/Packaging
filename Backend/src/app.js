const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/jobs.routes");
const plateRoutes = require("./routes/plate.routes");
const dieRoutes = require("./routes/die.routes");

app.use(express.json());
app.use(
  cors({
    origin: "https://packaging-8dmq.onrender.com",
    credentials: true,
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/plates", plateRoutes);
app.use("/api/dies", dieRoutes);

module.exports = app;
