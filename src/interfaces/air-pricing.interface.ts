import { Journey } from "../interfaces/search.interface";
import { CommonRequest } from "./common.interface";

export interface AirPricingRequest extends CommonRequest {
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