const express = require("express");
const path = require("path");
const fs = require("fs");

const itemsRoutes = require("./routes/itemsRoutes");

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

// Mount API at /api/items
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

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
