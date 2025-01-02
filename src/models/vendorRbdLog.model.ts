import mongoose, { Schema, Document } from 'mongoose';
import { IVendorLog, ServiceName, Status } from '../interfaces/vendorLog.interface';


// Define the schema
const vendorRbdLogSchema: Schema = new Schema(
    {
        uniqueKey: { type: String, default: "" },
        traceId: { type: String, default: "" },
        serviceName: {
            type: String,
            enum: Object.values(ServiceName),  // Use enum values for validation
            default: ServiceName.SEARCH
        },
        systemName: { type: String, default: "" },
        systemEntity: { type: String, default: "" },
        vendorCode: { type: String, default: "" },
        vendorRequest: { type: Schema.Types.Mixed, required: false },
        requestDateTimeStamp: { type: Date, required: true },
        vendorResponse: { type: Schema.Types.Mixed, required: false },
        responseDateTimeStamp: { type: Date, required: true },
        status: {
            type: String,
            enum: Object.values(Status),  // Use enum values for validation
            default: Status.SUCCESS
        }
    }
);

// Export the model and its interface
const VendorRbdLog = mongoose.model<IVendorLog>('VendorRbdLog', vendorRbdLogSchema);
export default VendorRbdLog;
