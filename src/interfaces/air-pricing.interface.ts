import { CredentialType, Journey, TypeOfTrip, Vendor } from "../interfaces/search.interface";

export interface AirPricingRequest {
    typeOfTrip: TypeOfTrip;
    credentialType: CredentialType;
    uniqueKey: string;
    traceId: string;
    vendorList: Vendor[];
    journey: Journey[];
}

export interface PricingJourney extends Journey {
    priceChange: boolean;
}
export interface AirPricingResponse {
    uniqueKey: string;
    traceId: string;
    journey: PricingJourney[];
}