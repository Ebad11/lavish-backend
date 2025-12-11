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

// Render will give PORT automatically
const PORT = process.env.PORT || 5000;

// connect db
connectDB();

// ---------------- CORS (IMPORTANT for Deployment) ----------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",

      "https://lavishattire.in",
      "http://lavishattire.in",

      "https://www.lavishattire.in",
      "http://www.lavishattire.in",

      "https://lavish-attire-boutique.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.options("*", cors());


// middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/contact", contactRoutes);

// Health check for Render
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
