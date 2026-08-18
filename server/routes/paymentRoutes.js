const express = require("express");

const {
    createOrder,
    verifyPayment,
    getTransactionHistory
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", protect, createOrder);

router.post("/verify", protect, verifyPayment);

router.get("/history", protect, getTransactionHistory);

module.exports = router;
