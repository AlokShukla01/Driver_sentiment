const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let drivers = [];
let idCounter = 1;

const threshold = 2.5;
const cooldownMinutes = 1;

/* ---------- ADVANCED SENTIMENT ANALYZER ---------- */
function analyze(text) {
  if (!text) return 3;

  text = text.toLowerCase();
  let score = 3;

  const positiveWords = [
    "good","nice","polite","smooth","friendly","safe",
    "professional","helpful","clean","comfortable",
    "on-time","punctual","respectful"
  ];

  const strongPositive = [
    "excellent","amazing","outstanding","fantastic","perfect","awesome"
  ];

  const negativeWords = [
    "bad","rude","late","unsafe","dirty","careless",
    "slow","unprofessional","noisy","uncomfortable"
  ];

  const strongNegative = [
    "terrible","horrible","worst","dangerous","abusive"
  ];

  const positiveEmojis = ["🙂","😊","👍"];
  const negativeEmojis = ["😡","😠","👎"];

  positiveWords.forEach(word => {
    if (text.includes(word)) score += 1;
  });

  strongPositive.forEach(word => {
    if (text.includes(word)) score += 2;
  });

  negativeWords.forEach(word => {
    if (text.includes(word)) score -= 1;
  });

  strongNegative.forEach(word => {
    if (text.includes(word)) score -= 2;
  });

  positiveEmojis.forEach(e => {
    if (text.includes(e)) score += 1;
  });

  negativeEmojis.forEach(e => {
    if (text.includes(e)) score -= 1;
  });

  return Math.max(1, Math.min(score, 5));
}

/* ---------- CREATE DRIVER ---------- */
app.post("/api/drivers/create", (req, res) => {
  const driver = {
    id: idCounter++,
    name: req.body.name,
    averageScore: 0,
    feedbackCount: 0,
    lastAlertTime: null
  };

  drivers.push(driver);
  res.json(driver);
});

/* ---------- SUBMIT FEEDBACK ---------- */
app.post("/api/drivers/feedback", (req, res) => {
  const { driverId, text, rating } = req.body;

  const driver = drivers.find(d => d.id == driverId);
  if (!driver) return res.status(404).json("Driver not found");

  let score;

  if (rating && rating >= 1 && rating <= 5) {
    score = rating; // star rating overrides text
  } else {
    score = analyze(text);
  }

  driver.averageScore =
    (driver.averageScore * driver.feedbackCount + score) /
    (driver.feedbackCount + 1);

  driver.feedbackCount++;

  if (driver.averageScore < threshold) {
    const now = new Date();
    if (
      !driver.lastAlertTime ||
      (now - new Date(driver.lastAlertTime)) / 60000 > cooldownMinutes
    ) {
      console.log("⚠ ALERT: Driver underperforming!");
      driver.lastAlertTime = now;
    }
  }

  res.json(driver);
});

/* ---------- GET DRIVERS ---------- */
app.get("/api/drivers", (req, res) => {
  res.json(drivers);
});

/* ---------- START SERVER ---------- */
app.listen(5001, () => {
  console.log("Server running on port 5001");
});