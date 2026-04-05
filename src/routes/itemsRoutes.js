const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/itemsController");
const multer = require("multer");
const path = require("path");

// store uploads in src/public/uploads with unique filenames
const uploadDir = path.join(__dirname, "..", "public", "uploads");
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, safeName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Routes (mounted at /api/items in app.js)
router.get("/", itemsController.getAllItems);
router.post("/", upload.single("image"), itemsController.addItem);
router.delete("/:id", itemsController.deleteItem);

module.exports = router;
