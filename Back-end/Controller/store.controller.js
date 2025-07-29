import Store from "../Model/store.model.js";
import User from "../Model/user.model.js";
import Rating from "../Model/rating.model.js";
import { Op } from "sequelize";

// Create store (admin only)
const createStore = async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  if (!name || !email || !address || !ownerId) {
    return res.status(400).json({ message: "All fields are required (name, email, address, ownerId)" });
  }
  try {
    const existing = await Store.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Store already exists" });
    const store = await Store.create({ name, email, address, ownerId });
    res.status(201).json({ message: "Store created successfully", store });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update store (admin only)
const updateStore = async (req, res) => {
  const { id } = req.params;
  const { name, email, address } = req.body;
  try {
    const store = await Store.findByPk(id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    store.name = name || store.name;
    store.email = email || store.email;
    store.address = address || store.address;
    await store.save();
    res.json({ message: "Store updated successfully", store });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all stores (with filtering, sorting, and search)
const getAllStores = async (req, res) => {
  const { name, address, sortBy = "createdAt", order = "DESC" } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };
  try {
    const stores = await Store.findAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'address', 'role'] }],
      order: [[sortBy, order]],
    });
    res.json({ stores });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete store (admin only)
const deleteStore = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Store.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Store deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Submit or update rating (user only)
const submitRating = async (req, res) => {
  const { storeId, rating } = req.body;
  const userId = req.user.id; // from auth middleware
  if (!storeId || !rating) return res.status(400).json({ message: "Store ID and rating required" });
  if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
  try {
    let userRating = await Rating.findOne({ where: { userId, storeId } });
    if (userRating) {
      userRating.rating = rating;
      await userRating.save();
    } else {
      userRating = await Rating.create({ userId, storeId, rating });
    }
    // Update store's average rating
    const ratings = await Rating.findAll({ where: { storeId } });
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const store = await Store.findByPk(storeId);
    store.averageRating = avg;
    await store.save();
    res.json({ message: "Rating submitted", rating: userRating });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get ratings for a store (store owner only)
const getStoreRatings = async (req, res) => {
  const { storeId } = req.params;
  try {
    const ratings = await Rating.findAll({
      where: { storeId },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'address'] }],
    });
    const avg = ratings.length ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) : 0;
    res.json({ ratings, average: avg });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { createStore, updateStore, getAllStores, deleteStore, submitRating, getStoreRatings };
