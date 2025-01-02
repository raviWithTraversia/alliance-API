import VendorApiSearchLog from '../models/vendorApiSearchLog.model';
import VendorAirBookingLog from '../models/vendorAirBookingLog.model';
import VendorAirPricingLog from '../models/vendorAirPricingLog.model';
import VendorFareRuleLog from '../models/vendorFareRuleLog.model';
import VendorGetSeatMapLog from '../models/vendorGetSeatMapLog.model';
import VendorRbdLog from '../models/vendorRbdLog.model';
import VendorSsrLog from '../models/vendorSsrLog.model';
import VendorApiCancelPNRLog from '../models/vendorApiCancelPNRLog.model';
import VendorApiImportPNRLog from '../models/vendorApiImportPNRLog.model';

export async function saveVendorLog(logData: any): Promise<void> {
    try {
        let serviceName = logData.serviceName;
        switch (serviceName) {
            case "search":
                const searchLog = new VendorApiSearchLog(logData);
                await searchLog.save();
                break;
            case "air_pricing":
                const pricingLog = new VendorAirPricingLog(logData);
                await pricingLog.save();
                break;
            case "rbd":
                const rbdLog = new VendorRbdLog(logData);
                await rbdLog.save();
                break;
            case "fare_rule":
                const fareRuleLog = new VendorFareRuleLog(logData);
                await fareRuleLog.save();
                break;
            case "get_seat_map":
                const seatMapLog = new VendorGetSeatMapLog(logData);
                await seatMapLog.save();
                break;
            case "ssr":
                const ssrLog = new VendorSsrLog(logData);
                await ssrLog.save();
                break;
            case "air_booking":
                const bookingLog = new VendorAirBookingLog(logData);
                await bookingLog.save();
                break;
            case "import_pnr":
                const importPnr = new VendorApiImportPNRLog(logData);
                await importPnr.save();
                break;
            case "cancel_pnr":
                const cancelPnr = new VendorApiCancelPNRLog(logData);
                await cancelPnr.save();
                break;
            default:
                console.error(`Unknown serviceName: ${serviceName}`);
                break;
        }
        console.log("Log saved successfully");
    } catch (error) {
        console.error("Error saving log:", error);
    }
}