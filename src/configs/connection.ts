import mongoose from "mongoose";

export async function initializeMongoDBConnection(URI: string): Promise<typeof mongoose> {
    try {
        await mongoose.connect(URI);
        console.log(`Successfully connected to MongoDB.--- ${URI}`);
        return mongoose;
    } catch (error) {
        console.error(`Error connecting to MongoDB at ${URI}:`, error);
        throw error;
    }
}

