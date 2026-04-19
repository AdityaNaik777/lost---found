const path = require("path");
const fs = require("fs").promises;
const itemModel = require("../models/itemModel");

const { s3, DeleteObjectCommand, BUCKET } = require("../lib/s3");

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

// POST /api/items
exports.addItem = async (req, res) => {
  try {
    const { title, description, contact, status } = req.body;

    const newItem = {
      title,
      description,
      contact,
      status: status || "lost",
      // Store the FULL URL for the frontend
      image: req.file ? req.file.location : null,
      // Store the KEY so we can delete it from S3 later
      imageKey: req.file ? req.file.key : null,
    };

    const savedItem = await itemModel.add(newItem);
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("addItem error:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find item to get S3 Key before deleting from DB
    const items = await itemModel.getAll();
    const item = items.find((it) => Number(it.id) === Number(id));

    if (!item) return res.status(404).json({ error: "Item not found" });

    // 2. Delete from MySQL
    const removed = await itemModel.remove(id);
    if (!removed)
      return res.status(500).json({ error: "Failed to remove item" });

    // 3. Clean up S3
    if (item.imageKey && BUCKET) {
      try {
        await s3.send(
          new DeleteObjectCommand({ Bucket: BUCKET, Key: item.imageKey }),
        );
        console.log("S3 Image deleted successfully");
      } catch (err) {
        console.warn("[itemsController] failed to delete S3 image", err);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[itemsController] deleteItem error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
