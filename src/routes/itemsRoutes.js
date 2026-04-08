const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/itemsController");

// IMPORTANT: Do not redefine multer here with memoryStorage if you want 
// to use the S3 logic we built in app.js. 

// Option: Export the 'upload' from app.js or redefine the S3 version here
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new S3Client({ region: "us-east-1" });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'lostfoundserver',
    key: function (req, file, cb) {
      cb(null, "lost-items/" + Date.now().toString() + "-" + file.originalname);
    }
  })
});

// GET /api/items -> calls itemsController.getAllItems
router.get("/", itemsController.getAllItems);

// POST /api/items -> handles S3 upload then calls controller
router.post("/", upload.single("image"), itemsController.addItem);

// DELETE /api/items/:id
router.delete("/:id", itemsController.deleteItem);

module.exports = router;