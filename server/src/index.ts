import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();

// Initialize Database Connection
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
