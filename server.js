require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// routes
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const ordersRoutes = require("./routes/orders");
const contactRoutes = require("./routes/contact");

const app = express();

// connect DB
connectDB();

// -------------------- FIXED CORS FOR VERCEL --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://lavishattire.in",
  "http://lavishattire.in",
  "https://www.lavishattire.in",
  "http://www.lavishattire.in",
  "https://lavish-attire-boutique.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ------------- FALLBACK HEADERS (IMPORTANT FOR VERCEL) -------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/contact", contactRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// -------------------- EXPORT INSTEAD OF LISTEN --------------------
module.exports = app;
