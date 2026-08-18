const Razorpay = require("razorpay");
const crypto = require("crypto");

const User = require("../models/User");
const Transaction = require("../models/Transaction");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
    starter: {
        credits: 100,
        amount: 4900
    },

    popular: {
        credits: 500,
        amount: 19900
    },

    pro: {
        credits: 1000,
        amount: 34900
    }
};


// CREATE ORDER
const createOrder = async (req, res) => {
    try {
        const { plan } = req.body;

        const selectedPlan = PLANS[plan];

        if (!selectedPlan) {
            return res.status(400).json({
                success: false,
                message: "Invalid credit plan"
            });
        }

        const order = await razorpay.orders.create({
            amount: selectedPlan.amount,
            currency: "INR",
            receipt: `iq_${Date.now()}`
        });

        await Transaction.create({
            user: req.user._id,
            razorpayOrderId: order.id,
            amount: selectedPlan.amount,
            credits: selectedPlan.credits,
            status: "created"
        });

        res.status(201).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            credits: selectedPlan.credits,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create payment order"
        });
    }
};


// VERIFY PAYMENT
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        const transaction = await Transaction.findOne({
            razorpayOrderId: razorpay_order_id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // Prevent duplicate credit addition
        if (transaction.status === "paid") {
            const user = await User.findById(req.user._id);

            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                credits: user.credits
            });
        }

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            transaction.status = "failed";
            await transaction.save();

            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        transaction.razorpayPaymentId = razorpay_payment_id;
        transaction.razorpaySignature = razorpay_signature;
        transaction.status = "paid";

        await transaction.save();

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.credits += transaction.credits;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Payment successful and credits added",
            creditsAdded: transaction.credits,
            totalCredits: user.credits
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to verify payment"
        });
    }
};


// PAYMENT HISTORY
const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error("Transaction History Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch transaction history"
        });
    }
};


module.exports = {
    createOrder,
    verifyPayment,
    getTransactionHistory
};