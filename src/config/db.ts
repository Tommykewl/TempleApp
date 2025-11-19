import mongoose from 'mongoose';
import { CONNECTION_STRING } from './env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(CONNECTION_STRING);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // process.exit(1); // Exit process with failure
    }
};

export default connectDB;