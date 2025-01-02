export enum ServiceName {
    SEARCH = 'search',
    RBD = 'rbd',
    AIR_PRICING = "air_pricing",
    FARE_RULE = "fare_rule",
    AIR_BOOKING = "air_booking",
    GET_SEAT_MAP = "get_seat_map",
    SSR = "ssr",
    IMPORT_PNR = "import_pnr",
    CANCEL_PNR = "cancel_pnr"
}

export enum Status {
    SUCCESS = "success",
    FAILURE = "failure",
    TIMEOUT = "timeout"
}

// Define an interface for the schema
export interface IVendorLog extends Document {
    uniqueKey?: string;
    traceId?: string;
    serviceName?: ServiceName;  // ----search
    systemName?: string;
    systemEntity?: string;
    vendorCode?: string;
    vendorRequest?: any;
    requestDateTimeStamp?: Date;
    vendorResponse?: any;
    responseDateTimeStamp?: Date;
    status?: Status;
}