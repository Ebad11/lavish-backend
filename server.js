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
const PORT = process.env.PORT || 5000;

// connect db
connectDB();

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" })); // allow large payload (images base64)
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/contact", contactRoutes);

// health
app.get("/api/health", (req, res) => res.json({ ok: true, time: Date.now() }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
