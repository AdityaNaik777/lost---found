const fs = require("fs").promises;
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "..", "data", "items.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function getAll() {
  return await readData();
}

async function add(item) {
  const items = await readData();
  items.push(item);
  await writeData(items);
  return item;
}

async function remove(id) {
  const items = await readData();
  const idx = items.findIndex((it) => it.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  await writeData(items);
  return true;
}

// Explicit CommonJS exports — fixes "is not a function" when require(...) returned unexpected value
module.exports = {
  getAll,
  add,
  remove,
};
