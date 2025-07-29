import User from "../Model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Helper: Validate user input
function validateUserInput({ name, address, email, password }) {
  if (!name || name.length < 20 || name.length > 60) {
    return "Name must be between 20 and 60 characters.";
  }
  if (!address || address.length > 400) {
    return "Address must be at most 400 characters.";
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return "Invalid email address.";
  }
  if (!password || !/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(password)) {
    return "Password must be 8-16 chars, include an uppercase letter and a special character.";
  }
  return null;
}

// Register user
const registerUser = async (req, res) => {
  const { name, address, email, password, role } = req.body;
  const validationError = validateUserInput({ name, address, email, password });
  if (validationError) return res.status(400).json({ message: validationError });
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, address, email, password: hashPassword, role: role || "user" });
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user password
const updatePassword = async (req, res) => {
  const { id } = req.user; // from auth middleware
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "Old and new password required" });
  if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(newPassword)) {
    return res.status(400).json({ message: "New password must be 8-16 chars, include an uppercase letter and a special character." });
  }
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: "Old password incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all users (with filtering, sorting)
const getAllUsers = async (req, res) => {
  const { name, email, address, role, sortBy = "createdAt", order = "DESC" } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };
  if (role) where.role = role;
  try {
    const users = await User.findAll({ where, order: [[sortBy, order]] });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { registerUser, loginUser, updatePassword, getAllUsers, deleteUser };
