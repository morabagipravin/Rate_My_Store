import express from "express";
import {
  registerUser,
  loginUser,
  updatePassword,
  getAllUsers,
  deleteUser,
} from "../Controller/user.conntroller.js";
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/role.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/updatePassword", authMiddleware, updatePassword);
router.get("/all", authMiddleware, roleMiddleware('admin'), getAllUsers);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

export default router;
