import { randomUUID } from "crypto";
import { AirPricingRequest, AirPricingResponse } from "../interfaces/air-pricing.interface";

export async function handleAirPricing(request: AirPricingRequest) {
    try {
        const fieldsBeforePriceChange = {
            journeyKey: "",
            origin: "",
            destination: "",
        };
        const commonResponse: AirPricingResponse = {
            uniqueKey: request.uniqueKey || randomUUID(),
            traceId: request.traceId || randomUUID(),
            journey: [{
                ...fieldsBeforePriceChange,
                priceChange: false,
                ...request.journey[0]
            }]
        };
        return commonResponse;
    } catch (error: any) {
        console.log({ error });
        return { error: { message: error.message, stack: error.stack } }
    }
}