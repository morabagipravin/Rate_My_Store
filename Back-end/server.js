import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './DB/DB.Connection.js';
import userRoutes from './Routes/user.route.js';
import storeRoutes from './Routes/store.route.js';
// import ratingRoutes from './Routes/rating.route.js'; // To be created if needed

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/api/user', userRoutes);
app.use('/api/store', storeRoutes);
// app.use('/api/rating', ratingRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
