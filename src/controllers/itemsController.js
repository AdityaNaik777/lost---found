const path = require("path");
const fs = require("fs").promises;
const itemModel = require("../models/itemModel");

const {
  s3,
  PutObjectCommand,
  DeleteObjectCommand,
  BUCKET,
  REGION,
} = require("../lib/s3");

// helper to build public URL (works if you allow public-read or your bucket uses website hosting)
function buildPublicUrl(key) {
  if (!BUCKET || !REGION) return `/uploads/${key}`; // fallback to local URL if env not set
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(key)}`;
}

// GET /api/items
exports.getAllItems = async (req, res) => {
  try {
    const items = await itemModel.getAll();
    res.json(items);
  } catch (err) {
    console.error("[itemsController] getAllItems error:", err);
    res.status(500).json({ error: "Failed to read items" });
  }
};

// POST /api/items (multipart/form-data with optional image buffer from multer)
exports.addItem = async (req, res) => {
  try {
    const { title, description, contact } = req.body;
    
    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      contact,
      createdAt: new Date().toISOString(),
      // Use req.file.location provided by multerS3 in itemsRoutes.js
      image: req.file ? req.file.location : null, 
      imageKey: req.file ? req.file.key : null
    };

    await itemModel.add(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    console.error("addItem error:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await itemModel.getAll();
    const item = items.find((it) => it.id === id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const removed = await itemModel.remove(id);
    if (!removed)
      return res.status(500).json({ error: "Failed to remove item" });

    // If stored in S3, delete object
    if (item.imageKey && BUCKET) {
      try {
        await s3.send(
          new DeleteObjectCommand({ Bucket: BUCKET, Key: item.imageKey }),
        );
      } catch (err) {
        console.warn("[itemsController] failed to delete S3 image", err);
      }
    } else if (item.image) {
      // fallback: remove local file (if you still have local uploads)
      try {
        const localPath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          item.image,
        );
        await fs.unlink(localPath);
      } catch (e) {
        /* ignore */
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[itemsController] deleteItem error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
