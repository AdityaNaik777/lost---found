require('dotenv').config();
const mysql = require('mysql2');

// Create the connection pool using the .env variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

const promisePool = pool.promise();

const Item = {
  // Fetches all items from RDS
  async getAll() {
    const [rows] = await promisePool.query("SELECT * FROM items ORDER BY createdAt DESC");
    return rows;
  },

  // Adds a new item to RDS
  async add(item) {
    const { title, description, contact, image, status } = item;
    const [result] = await promisePool.query(
      "INSERT INTO items (title, description, contact, image, status) VALUES (?, ?, ?, ?, ?)",
      [title, description, contact, image, status]
    );
    // Return the new item with its database-generated ID
    return { id: result.insertId, ...item };
  },

  // Removes an item from RDS by ID
  async remove(id) {
    const [result] = await promisePool.query("DELETE FROM items WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Marks an item as resolved so it moves to success stories
  async resolve(id) {
    const [result] = await promisePool.query(
      "UPDATE items SET status = ? WHERE id = ?",
      ["resolved", id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Item;
