import mongoose, { Schema, Document } from 'mongoose';
import { IVendorLog, ServiceName, Status } from '../interfaces/vendorLog.interface';


// Define the schema
const vendorApiImportPNRLogSchema: Schema = new Schema(
    {
        uniqueKey: { type: String, default: "" },
        traceId: { type: String, default: "" },
        serviceName: {
            type: String,
            enum: Object.values(ServiceName),  // Use enum values for validation
            default: ServiceName.IMPORT_PNR
        },
        systemName: { type: String, default: "" },
        systemEntity: { type: String, default: "" },
        vendorCode: { type: String, default: "" },
        vendorRequest: { type: Schema.Types.Mixed, required: false },
        requestDateTimeStamp: { type: Date, required: false },
        vendorResponse: { type: Schema.Types.Mixed, required: false },
        responseDateTimeStamp: { type: Date, required: false },
        status: {
            type: String,
            enum: Object.values(Status),  // Use enum values for validation
            default: Status.SUCCESS
        }
    }
);

// Export the model and its interface
const VendorApiImportPNRLog = mongoose.model<IVendorLog>('VendorApiImportPNRLog', vendorApiImportPNRLogSchema);
export default VendorApiImportPNRLog;