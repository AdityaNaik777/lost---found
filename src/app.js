const express = require("express");
const path = require("path");
const fs = require("fs");
const itemsRoutes = require("./routes/itemsRoutes");
const multer = require("multer");
const { s3, BUCKET } = require("./lib/s3");
const multerS3 = require("multer-s3");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists so multer can write there
const uploadsDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

// Simple request logger to help debugging
app.use((req, res, next) => {
  console.log("[REQ]", req.method, req.url);
  next();
});

// Serve static files (css, js, uploaded images under /uploads)
app.use(express.static(path.join(__dirname, "public")));

// Views (EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Use multer-s3 for S3 uploads
const uploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET,
    acl: "public-read",
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

app.use("/api/items", itemsRoutes);

// UI routes
app.get("/", (req, res) => res.redirect("/items"));
app.get("/items", (req, res, next) => {
  // server renders list; controller used client-side fetch as well
  const itemModel = require("./models/itemModel");
  itemModel
    .getAll()
    .then((items) => res.render("items/list", { items }))
    .catch(next);
});
app.get("/items/new", (req, res) => res.render("items/form"));

// Data submission route (now uploads to S3)
app.post("/items", uploadS3.single("image"), async (req, res, next) => {
  try {
    const itemModel = require("./models/itemModel");
    const { title, description, contact } = req.body;
    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      contact,
      createdAt: new Date().toISOString(),
      image: req.file ? req.file.location : null, // S3 public URL
      imageKey: req.file ? req.file.key : null, // S3 object key
    };
    await itemModel.add(newItem);
    res.redirect("/items");
  } catch (err) {
    next(err);
  }
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
