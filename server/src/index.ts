import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();
connectRedis();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Performance logging middleware
import { perfLogger } from './middleware/perfLogger';
app.use(perfLogger);

// Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

// Basic Route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
