const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const aiRoutes = require("./routes/ai");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, msg: "CronoMart Backend Running" }));
app.use("/api/ai", aiRoutes);

async function start() {
  await connectDB();
  app.listen(process.env.PORT || 8080, () => {
    console.log(`✅ Backend running on http://localhost:${process.env.PORT || 8080}`);
  });
}

start();
