const express = require("express");

const {
    createOrder,
    verifyPayment,
    getTransactions
} = require("../controllers/paymentController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// Create Razorpay order
router.post(
    "/create-order",
    protect,
    createOrder
);


// Verify successful payment
router.post(
    "/verify",
    protect,
    verifyPayment
);


// Get transaction history
router.get(
    "/transactions",
    protect,
    getTransactions
);


module.exports = router;