import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using Mongoose.
 * This is a reusable connection instance.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      console.error('An unexpected error occurred during MongoDB connection.');
    }
    // Exit process with failure
    process.exit(1);
  }
};
