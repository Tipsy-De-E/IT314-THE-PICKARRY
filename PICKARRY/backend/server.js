import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";
import ordersRouter from "./routes/orders.js";

dotenv.config();
const { Pool } = pkg;

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Database connection
export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test DB connection & create table
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to database!");

    // Create orders table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        pickup_location TEXT,
        delivery_location TEXT,
        delivery_item TEXT,
        selected_service TEXT,
        book_for_delivery BOOLEAN DEFAULT false,
        delivery_date DATE,
        delivery_time TIME,
        selected_vehicle TEXT,
        vehicle_price NUMERIC(10,2) DEFAULT 0,
        estimated_distance TEXT,
        selected_category TEXT,
        description TEXT,
        uploaded_photos TEXT[] DEFAULT '{}',
        is_rush_delivery BOOLEAN DEFAULT false,
        rush_amount NUMERIC(10,2) DEFAULT 0,
        payment_method TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Orders table ready");
    client.release();
  } catch (err) {
    console.error("❌ Could not create orders table:", err.message);
    process.exit(1);
  }
})();

// Routes
app.use("/api/orders", ordersRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date(), service: "Pickarry Backend API" });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, error: "Endpoint not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
