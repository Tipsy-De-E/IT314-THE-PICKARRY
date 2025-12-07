// import express from "express";
// import { pool } from "../server.js";

// const router = express.Router();

// // POST /api/orders
// router.post("/", async (req, res) => {
//   try {
//     const {
//       pickupLocation, deliveryLocation, deliveryItem, selectedService,
//       bookForDelivery, selectedDate, selectedTime, selectedVehicle, vehiclePrice,
//       estimatedDistance, selectedCategory, description, uploadedPhotos,
//       isRushDelivery, rushAmount, selectedPayment
//     } = req.body;

//     const query = `
//       INSERT INTO orders (
//         pickup_location, delivery_location, delivery_item, selected_service, book_for_delivery,
//         delivery_date, delivery_time, selected_vehicle, vehicle_price, estimated_distance,
//         selected_category, description, uploaded_photos, is_rush_delivery, rush_amount, payment_method
//       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
//       RETURNING *;
//     `;

//     const values = [
//       pickupLocation, deliveryLocation, deliveryItem, selectedService, bookForDelivery || false,
//       selectedDate || null, selectedTime || null, selectedVehicle || null, vehiclePrice || 0,
//       estimatedDistance || null, selectedCategory || null, description || null,
//       uploadedPhotos || [], isRushDelivery || false, rushAmount || 0, selectedPayment || null
//     ];

//     const result = await pool.query(query, values);
//     res.json({ success: true, order: result.rows[0] });
//   } catch (err) {
//     console.error("❌ Error inserting order:", err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// export default router;


import express from "express";
import { pool } from "../server.js";

const router = express.Router();

// ✅ POST /api/orders
router.post("/", async (req, res) => {
  try {
    const {
      pickup_location,
      delivery_location,
      delivery_item,
      selected_service,
      book_for_delivery,
      delivery_date,
      delivery_time,
      selected_vehicle,
      vehicle_price,
      estimated_distance,
      selected_category,
      description,
      uploaded_photos,
      is_rush_delivery,
      rush_amount,
      payment_method,
      customer_id
    } = req.body;

    const query = `
      INSERT INTO orders (
        pickup_location,
        delivery_location,
        delivery_item,
        selected_service,
        book_for_delivery,
        delivery_date,
        delivery_time,
        selected_vehicle,
        vehicle_price,
        estimated_distance,
        selected_category,
        description,
        uploaded_photos,
        is_rush_delivery,
        rush_amount,
        payment_method,
        customer_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *;
    `;

    const values = [
      pickup_location || null,
      delivery_location || null,
      delivery_item || null,
      selected_service || null,
      book_for_delivery || false,
      delivery_date || null,
      delivery_time || null,
      selected_vehicle || null,
      vehicle_price || 0,
      estimated_distance || null,
      selected_category || null,
      description || null,
      uploaded_photos
        ? (Array.isArray(uploaded_photos)
            ? uploaded_photos
            : uploaded_photos.split(","))
        : [],
      is_rush_delivery || false,
      rush_amount || 0,
      payment_method || null,
      customer_id || null
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error("❌ Error inserting order:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
