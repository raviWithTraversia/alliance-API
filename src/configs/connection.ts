import mongoose from "mongoose";

export function connectionMongoDb(MongoUrl: any): Promise<typeof mongoose> {
    return mongoose.connect(MongoUrl)
        .then(() => {
            console.log(`Successfully connected to MongoDB.--- ${MongoUrl}`);
            return mongoose;
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        });
}