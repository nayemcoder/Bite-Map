// controllers/menuController.js
const db = require("../config/db");
const { constructImageUrl } = require("../utils/helpers");

// GET /restaurants/:id/menu
exports.getMenu = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const [rows] = await db.query(
      `SELECT id, name, description, price, image_url
         FROM menu_items
        WHERE restaurant_id = ?
        ORDER BY name`,
      [restaurantId]
    );

    const data = rows.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: constructImageUrl(req, item.image_url, 'restaurant')
    }));

    res.json({ data });
  } catch (err) {
    console.error("getMenu error:", err);
    res.status(500).json({ message: "Could not fetch menu" });
  }
};

// POST /restaurants/:id/menu
exports.addMenuItem = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const { name, description, price } = req.body;
    const imagePath = req.file?.filename || null;

    // Simple validation
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }

    const [result] = await db.query(
      `INSERT INTO menu_items (restaurant_id, name, description, price, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [restaurantId, name, description || '', price, imagePath]
    );

    res.status(201).json({
      message: "Menu item added",
      itemId: result.insertId,
      imageUrl: constructImageUrl(req, imagePath, 'restaurant')
    });
  } catch (err) {
    console.error("addMenuItem error:", err);
    res.status(500).json({ message: "Could not add menu item" });
  }
};

// PUT /restaurants/:id/menu/:itemId
exports.updateMenuItem = async (req, res) => {
  try {
    const { id: restaurantId, itemId } = req.params;
    const { name, description, price } = req.body;
    const imagePath = req.file?.filename ?? null;

    const fields = [];
    const params = [];

    if (name)         { fields.push("name = ?");        params.push(name); }
    if (description)  { fields.push("description = ?"); params.push(description); }
    if (price)        { fields.push("price = ?");       params.push(price); }
    if (imagePath)    { fields.push("image_url = ?");   params.push(imagePath); }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Nothing to update." });
    }

    params.push(itemId, restaurantId);

    await db.query(
      `UPDATE menu_items SET ${fields.join(", ")} WHERE id = ? AND restaurant_id = ?`,
      params
    );

    res.json({
      message: "Menu item updated",
      imageUrl: imagePath ? constructImageUrl(req, imagePath, 'restaurant') : undefined
    });
  } catch (err) {
    console.error("updateMenuItem error:", err);
    res.status(500).json({ message: "Could not update menu item" });
  }
};

// DELETE /restaurants/:id/menu/:itemId
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id: restaurantId, itemId } = req.params;
    const [result] = await db.query(
      `DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?`,
      [itemId, restaurantId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted" });
  } catch (err) {
    console.error("deleteMenuItem error:", err);
    res.status(500).json({ message: "Could not delete menu item" });
  }
};