import mongoose, { Schema, Document } from 'mongoose';

// Define an interface for the schema
interface IAirline extends Document {
    airlineCode: string;
    airlineName: string;
    isLowCostCarrier: boolean;
    allianceCode?: string | null;
    customerCareNumber?: string | null;
    createdAt?: Date;  // Provided by Mongoose with timestamps
    updatedAt?: Date;  // Provided by Mongoose with timestamps
}

// Define the schema
const airlineSchema: Schema = new Schema(
    {
        airlineCode: {
            type: String,
            required: true,
        },
        airlineName: {
            type: String,
            required: true,
        },
        isLowCostCarrier: {
            type: Boolean,
            required: true,
            default: false,
        },
        allianceCode: {
            type: String,
            default: null,
        },
        customerCareNumber: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

// Export the model and its interface
const Airline = mongoose.model<IAirline>('Airline', airlineSchema);
export default Airline;
