import express from 'express';
import {
  createStore,
  updateStore,
  getAllStores,
  deleteStore,
  submitRating,
  getStoreRatings,
} from '../Controller/store.controller.js';
import authMiddleware from '../middleware/auth.js';
import roleMiddleware from '../middleware/role.js';

const router = express.Router();

// Admin routes
router.post('/create', authMiddleware, roleMiddleware('admin'), createStore);
router.patch('/update/:id', authMiddleware, roleMiddleware('admin'), updateStore);
router.get('/all', getAllStores);
router.delete('/delete/:id', authMiddleware, roleMiddleware('admin'), deleteStore);

// User rating routes
router.post('/rate', authMiddleware, roleMiddleware('user'), submitRating);
router.get('/:storeId/ratings', authMiddleware, roleMiddleware('owner'), getStoreRatings);

export default router;