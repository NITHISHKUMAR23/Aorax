const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB 
const db = require("./config/db");

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require("./routes/adminRoutes");

// Base Route
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Aoraniti Task Management API is running!",
        version: "1.0.0"
    });
});

// Health Check Route
app.get("/health", (req, res) => {
    res.json({
        status: "success",
        message: "API is healthy",
        timestamp: new Date().toISOString()
    });
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
app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        status: "FAIL",
        message: "Route not found"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({
        status: "ERROR",
        message: err.message || "Internal server error"
    });
});

module.exports = app;