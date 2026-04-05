const path = require("path");
const fs = require("fs").promises;
const itemModel = require("../models/itemModel");

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

// POST /api/items (multipart/form-data with optional "image" file)
exports.addItem = async (req, res) => {
  try {
    const { title, description, contact } = req.body;
    if (!title || !description || !contact) {
      return res
        .status(400)
        .json({ error: "title, description and contact required" });
    }

    const imageFile = req.file; // multer sets this if provided
    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      contact,
      createdAt: new Date().toISOString(),
      image: imageFile ? imageFile.filename : undefined,
    };

    await itemModel.add(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    console.error("[itemsController] addItem error:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    // read current items to find the one being deleted (so we can remove its image)
    const items = await itemModel.getAll();
    const item = items.find((it) => it.id === id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // remove item from JSON store
    const removed = await itemModel.remove(id);
    if (!removed)
      return res.status(500).json({ error: "Failed to remove item" });

    // delete image file if present (best-effort)
    if (item.image) {
      const imgPath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        item.image,
      );
      try {
        await fs.unlink(imgPath);
      } catch (err) {
        // ignore missing file errors; log others
        if (err.code !== "ENOENT")
          console.warn("[itemsController] failed to delete image", err);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[itemsController] deleteItem error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
