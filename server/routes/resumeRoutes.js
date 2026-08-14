const express = require("express");

const {
    uploadResume
} = require("../controllers/resumeController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/upload",
    protect,
    upload.single("resume"),
    uploadResume
);

module.exports = router;