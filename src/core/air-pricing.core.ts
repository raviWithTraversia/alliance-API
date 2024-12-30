import { randomUUID } from "crypto";

export async function handleAirPricing(request: any) {
    try {
        const commonResponse: any = {
            uniqueKey: request.uniqueKey || randomUUID(),
            traceId: request.traceId || randomUUID(),
            journey: [{
                journeyKey: "",
                origin: "",
                destination: "",
                priceChange: false,
                ...request.journey[0]
            }]
        }
        return commonResponse;
    } catch (error: any) {
        console.log({ error });
        return { error: { message: error.message, stack: error.stack } }
    }

}