// ==========================
// BASIC SETUP
// ==========================
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ==========================
// STARTUP LOG
// ==========================
console.log("Server starting...");
console.log("Attempting MongoDB connection...");

// ==========================
// MONGODB CONNECTION
// ==========================
mongoose
  .connect(
    "mongodb+srv://blocksworth1203_db_user:Athena17@vailbound.rgkibli.mongodb.net/Vailbound"
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// ==========================
// SCHEMA & MODEL
// ==========================
const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  character: {
    name: { type: String, default: "" },
    race: { type: String, default: "" },
    class: { type: String, default: "" },
    trait: { type: String, default: "" }
  },
  inventory: { type: [String], default: [] }
});

const Player = mongoose.model("Player", playerSchema);

// ==========================
// ROUTES
// ==========================

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    const existing = await Player.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newPlayer = new Player({ username, password });
    await newPlayer.save();

    console.log("New user registered:", username);
    res.json({ success: true });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(400).json({ error: "User not found" });
    }

    if (player.password !== password) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    console.log("User logged in:", username);
    res.json({ success: true, username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE / UPDATE CHARACTER
app.post("/create-character", async (req, res) => {
  try {
    const { username, character } = req.body;

    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    player.character = character;
    await player.save();

    console.log("Character created for:", username);
    res.json({ success: true });
  } catch (err) {
    console.error("Character creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET PLAYER DATA
app.get("/player", async (req, res) => {
  try {
    const { username } = req.query;

    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(player);
  } catch (err) {
    console.error("Player fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// TEST ROUTE (VERY IMPORTANT)
app.get("/test-db", async (req, res) => {
  const count = await Player.countDocuments();
  res.json({ players: count });
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
