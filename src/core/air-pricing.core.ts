// External imports
import { randomUUID } from "crypto";

// Internal imports
import { AirPricingRequest, AirPricingResponse } from "../interfaces/air-pricing.interface";
import { IError } from "../interfaces/common.interface";
import { retrieveFareFromItinerary } from "./search.core";
import { getConfig } from "../configs/config";
import { AllianceFlight, Itinerary, PriceBreakup } from "../interfaces/search.interface";
import dayjs from "dayjs";

export async function handleAirPricing(request: AirPricingRequest): Promise<AirPricingResponse | IError> {
    try {
        const fieldsBeforePriceChange = {
            journeyKey: "",
            origin: "",
            destination: "",
        };
        const config = await getConfig(request.credentialType);
        const flight = convertToFlight(request.journey[0].itinerary[0]);

        let priceBreakup: PriceBreakup[] = [];
        let totalPrice = 0;
        let taxes = 0;
        let baseFare = 0;

        const fareResponse = await retrieveFareFromItinerary({ config, index: 1, request, flight });
        if ('error' in fareResponse) return fareResponse;

        if (fareResponse && 'priceBreakup' in fareResponse) {
            priceBreakup = fareResponse.priceBreakup;
            totalPrice = fareResponse.totalPrice;
            taxes = fareResponse.taxes;
            baseFare = fareResponse.baseFare;
        };

        let isPriceChanged = false;
        if (priceBreakup.length) request.journey[0].itinerary[0].priceBreakup = priceBreakup;
        if (totalPrice) {
            if (request.journey[0].itinerary[0].totalPrice !== totalPrice) isPriceChanged = true;
            request.journey[0].itinerary[0].totalPrice = totalPrice;
        }
        if (taxes) request.journey[0].itinerary[0].taxes = taxes;
        if (baseFare) request.journey[0].itinerary[0].baseFare = baseFare;

        const commonResponse: AirPricingResponse = {
            uniqueKey: request.uniqueKey || randomUUID(),
            traceId: request.traceId || randomUUID(),
            journey: [{
                ...fieldsBeforePriceChange,
                priceChange: isPriceChanged,
                ...request.journey[0]
            }]
        };
        return commonResponse;
    } catch (error: any) {
        console.log({ error });
        return { error: { message: error.message } }
    }
}

export function convertToFlight(itinerary: Itinerary): AllianceFlight[] {
    const flights = itinerary.airSegments.map((segment) => [
        `${itinerary.provider}-${segment.fltNum}`,
        segment.departure.code,
        segment.arrival.code,
        dayjs(segment.departure.date, "DD/MM/YYYY").format("YYYYMMDD"),
        dayjs(segment.arrival.date, "DD/MM/YYYY").format("YYYYMMDD"),
        segment.departure.time.replace(":", ""),
        segment.arrival.time.replace(":", ""),
        "",
        "",
        "",
        [],
        `${segment.departure.code}-${segment.arrival.code}`,
        "",
        "Scheduled",
        segment.departure.terminal,
        segment.arrival.terminal,
    ] as AllianceFlight);
    return flights
}