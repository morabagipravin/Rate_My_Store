import Store from "../Model/store.model.js";
import User from "../Model/user.model.js";
import Rating from "../Model/rating.model.js";
import { Op } from "sequelize";

const createStore = async (req, res) => {
  console.log('createStore called with body:', req.body);
  console.log('User from auth middleware:', req.user);
  
  const { name, email, address, ownerId } = req.body;
  if (!name || !email || !address || !ownerId) {
    console.log('Missing required fields:', { name, email, address, ownerId });
    return res.status(400).json({ message: "All fields are required (name, email, address, ownerId)" });
  }
  try {

    const owner = await User.findByPk(ownerId);
    if (!owner) {
      console.log('Owner not found with ID:', ownerId);
      return res.status(400).json({ message: `Selected owner with ID ${ownerId} does not exist` });
    }
    if (owner.role !== 'owner') {
      console.log('User is not an owner:', owner.role);
      return res.status(400).json({ message: `Selected user (${owner.name}) is not a store owner. Current role: ${owner.role}` });
    }
    
    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      console.log('Store with email already exists:', email);
      return res.status(400).json({ message: "Store with this email already exists" });
    }
    
    console.log('Creating store with data:', { name, email, address, ownerId });
    const store = await Store.create({ name, email, address, ownerId });
    console.log('Store created successfully:', store);
    res.status(201).json({ message: "Store created successfully", store });
  } catch (err) {
    console.error('Store creation error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update store 
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

// Get all stores 
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

// Delete store
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

// Submit or update rating 
const submitRating = async (req, res) => {
  console.log('submitRating called with body:', req.body);
  console.log('User from auth middleware:', req.user);
  
  const { storeId, rating } = req.body;
  const userId = req.user.id; 
  if (!storeId || !rating) return res.status(400).json({ message: "Store ID and rating required" });
  if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
  
  console.log('Processing rating:', { userId, storeId, rating });
  
  try {
    const store = await Store.findByPk(storeId);
    if (!store) {
      console.log('Store not found with ID:', storeId);
      return res.status(404).json({ message: "Store not found" });
    }
    console.log('Store found:', store.name);
    
    let userRating = await Rating.findOne({ where: { userId, storeId } });
    if (userRating) {
      console.log('Updating existing rating');
      userRating.rating = rating;
      await userRating.save();
    } else {
      console.log('Creating new rating');
      userRating = await Rating.create({ userId, storeId, rating });
    }
    
    const ratings = await Rating.findAll({ where: { storeId } });
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    store.averageRating = avg;
    await store.save();
    
    console.log('Rating submitted successfully, new average:', avg);
    res.json({ message: "Rating submitted", rating: userRating });
  } catch (err) {
    console.error('Rating submission error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

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

const getStoreRatingsForOwner = async (req, res) => {
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

export { createStore, updateStore, getAllStores, deleteStore, submitRating, getStoreRatings, getStoreRatingsForOwner };
