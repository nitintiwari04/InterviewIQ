const Razorpay = require("razorpay");
const crypto = require("crypto");

const User = require("../models/User");
const Transaction = require("../models/Transaction");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ==========================================
// CREDIT PACKAGES
// ==========================================

const CREDIT_PACKAGES = {
    starter: {
        credits: 100,
        amount: 49
    },

    popular: {
        credits: 500,
        amount: 199
    },

    pro: {
        credits: 1000,
        amount: 349
    }
};


// ==========================================
// CREATE PAYMENT ORDER
// ==========================================

const createOrder = async (req, res) => {

    try {

        const { packageId } = req.body;

        const selectedPackage =
            CREDIT_PACKAGES[packageId];

        if (!selectedPackage) {

            return res.status(400).json({
                success: false,
                message: "Invalid credit package"
            });
        }


        const amountInPaise =
            selectedPackage.amount * 100;


        const options = {
            amount: amountInPaise,
            currency: "INR",

            receipt:
                `iq_${req.user._id}_${Date.now()}`,

            notes: {
                userId:
                    req.user._id.toString(),

                credits:
                    selectedPackage.credits,

                packageId
            }
        };


        const order =
            await razorpay.orders.create(
                options
            );


        await Transaction.create({

            user: req.user._id,

            orderId: order.id,

            amount:
                selectedPackage.amount,

            currency: "INR",

            credits:
                selectedPackage.credits,

            status: "created"

        });


        res.status(201).json({

            success: true,

            order: {
                id: order.id,

                amount: order.amount,

                currency:
                    order.currency
            },

            package: {
                id: packageId,

                credits:
                    selectedPackage.credits,

                amount:
                    selectedPackage.amount
            },

            key:
                process.env.RAZORPAY_KEY_ID

        });

    } catch (error) {

        console.error(
            "Create Razorpay Order Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to create payment order"

        });
    }
};


// ==========================================
// VERIFY PAYMENT
// ==========================================

const verifyPayment = async (
    req,
    res
) => {

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

                message:
                    "Payment verification data is incomplete"

            });
        }


        const transaction =
            await Transaction.findOne({
                orderId:
                    razorpay_order_id
            });


        if (!transaction) {

            return res.status(404).json({

                success: false,

                message:
                    "Transaction not found"

            });
        }


        // Prevent duplicate credit addition
        if (
            transaction.status ===
            "paid"
        ) {

            const user =
                await User.findById(
                    req.user._id
                );

            return res.status(200).json({

                success: true,

                message:
                    "Payment was already processed",

                credits:
                    user.credits

            });
        }


        // Make sure transaction belongs
        // to the logged-in user
        if (
            transaction.user.toString() !==
            req.user._id.toString()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized transaction"

            });
        }


        // Generate server-side signature
        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env
                        .RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        if (
            generatedSignature !==
            razorpay_signature
        ) {

            transaction.status =
                "failed";

            await transaction.save();


            return res.status(400).json({

                success: false,

                message:
                    "Payment signature verification failed"

            });
        }


        // Get user
        const user =
            await User.findById(
                req.user._id
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });
        }


        // Add credits
        user.credits +=
            transaction.credits;

        await user.save();


        // Mark payment as paid
        transaction.paymentId =
            razorpay_payment_id;

        transaction.status =
            "paid";

        await transaction.save();


        res.status(200).json({

            success: true,

            message:
                "Payment successful! Credits added.",

            creditsAdded:
                transaction.credits,

            totalCredits:
                user.credits

        });

    } catch (error) {

        console.error(
            "Verify Payment Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to verify payment"

        });
    }
};


// ==========================================
// TRANSACTION HISTORY
// ==========================================

const getTransactions = async (
    req,
    res
) => {

    try {

        const transactions =
            await Transaction.find({
                user: req.user._id
            })
                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            success: true,

            transactions

        });

    } catch (error) {

        console.error(
            "Transaction History Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};


module.exports = {

    createOrder,

    verifyPayment,

    getTransactions

};