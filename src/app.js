const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// DB 
const db = require("./config/db");

// Routes
const adminRoutes = require("./routes/adminRoutes");

// Base Route
app.get("/", (req, res) => {
    res.send("Aoraniti API is running!");
});

// Test DB Route
app.get("/test-db", (req, res) => {
    db.query("SELECT 1 + 1 AS result", (err, result) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Database connection failed",
                error: err.message
            });
        }

        res.json({
            status: "success",
            message: "DB Connected",
            data: result
        });
    });
});

// API Routes
app.use("/api/admin", adminRoutes);

module.exports = app;