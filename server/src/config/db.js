"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connects to MongoDB Atlas using Mongoose.
 * This is a reusable connection instance.
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }
        const conn = await mongoose_1.default.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
        }
        else {
            console.error('An unexpected error occurred during MongoDB connection.');
        }
        // Exit process with failure
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map