// External imports
import axios from "axios";
import dayjs from "dayjs";
import { randomUUID } from "crypto";

// Internal imports
import { Config, DEFAULTS, getConfig } from "../configs/config";
import { AllianceFlight, AllianceSearchResponse, Credential, FareSuccessResponse, Itinerary, Journey, SearchRequest, SearchResponse } from "../interfaces/search.interface";
import { saveLogInFile } from "../utils/save-log";
import { getFareInfo } from "../utils/fare-utils";
import { convertSegment } from "../utils/flight-segment";
import { getPriceBreakup, Pax, PriceBreakupResult } from "../utils/price-breakup";
import { IError } from "../interfaces/common.interface";
import { AirPricingRequest } from "../interfaces/air-pricing.interface";

/**
 * Handles the flight search request by constructing the search URL with the provided request parameters,
 * making an HTTP GET request to the search endpoint, and processing the response.
 *
 * @param {SearchRequest} request - The search request object containing the necessary parameters for the flight search.
 * @returns {Promise<AllianceSearchResponse | { error: { message: string, stack?: string } }>} - A promise that resolves to the search response or an error object.
 *
 * @throws {Error} - Throws an error if the search request fails.
 */
export async function handleFlightSearch(request: SearchRequest): Promise<SearchResponse | IError> {
    try {
        if (request.sectors[0].cabinClass !== "Economy")
            return { error: { message: "Only Economy class is supported" } };

        const config = await getConfig(request.credentialType);

        const origin = request.sectors[0].origin;
        const destination = request.sectors[0].destination;
        const credentials = request.vendorList[0].credential;
        const departureDate = dayjs(request.sectors[0].departureDate, "DD-MM-YYYY").format("YYYYMMDD");
        // const returnFlight = request.typeOfTrip === "ROUNDTRIP" && request.travelType === "INT" ? 1 : 0;

        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();

        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.append("app", "information");
        options.append("action", config.endpoints.search);
        options.append("org", origin);
        options.append("des", destination);
        options.append("flight_date", departureDate);
        // options.append("return_flight", returnFlight.toString());
        // if (returnFlight) {
        //     const returnDate = dayjs(request.sectors[1].departureDate, "DD-MM-YYYY").format("YYYYMMDD");
        //     options.append("ret_flight_date", returnDate);
        // }
        url.search = options.toString();
        console.log({ searchEndpoint: url.toString() });

        saveLogInFile("search-req.json", url.toString());
        const response = await axios.get(url.toString());
        saveLogInFile("search-response.json", response.data);

        const result = response.data as AllianceSearchResponse;
        if (result?.err_code == "0")
            return convertCommonSearchResponse({ result, request, searchURL: url, searchOptions: options, config });
        return { error: { message: result.err_message || "Unknown search error" } };
    } catch (error: any) {
        return { error: { message: error.message, stack: error.stack } }
    }
}

export async function convertCommonSearchResponse(
    { result, request, searchURL, searchOptions, config }:
        { result: AllianceSearchResponse, request: SearchRequest, searchURL: URL, searchOptions: URLSearchParams, config: Config }): Promise<SearchResponse | IError> {
    const commonResponse: SearchResponse = {
        uniqueKey: request.uniqueKey || randomUUID(),
        traceId: randomUUID(),
        journey: [{
            journeyKey: randomUUID(),
            origin: result.org,
            destination: result.des,
            itinerary: []
        } as Journey]
    };
    let idx = 1;
    try {
        for (let schedule of result.schedule) {
            for (let flight of schedule) {
                try {
                    const itineraries = await retrieveFareFromItinerary({
                        flight, config, index: idx, request
                    });
                    if (itineraries && 'length' in itineraries && itineraries.length) {
                        commonResponse.journey[0].itinerary.push(...itineraries);
                        idx += itineraries?.length;
                    }
                } catch (error: any) {
                    console.log({ error })
                }
            }
        }
    } catch (error: any) {
        return { error: { message: error.message, stack: error.stack } }
    }
    return commonResponse;
}

export async function retrieveFareFromItinerary(
    { flight, config, index, request }
        : {
            flight: AllianceFlight | AllianceFlight[],
            config: Config, index: number, request: SearchRequest | AirPricingRequest
        }): Promise<Itinerary[] | PriceBreakupResult | IError> {

    const sectors = (Array.isArray(flight?.[0]) ? flight : [flight]) as AllianceFlight[];
    try {
        const flightNumbers: string[] = sectors.map((sector) => {
            const [_provider, flightNumber] = sector?.[0]?.split?.("-") || [];
            return flightNumber;
        });
        if (!flightNumbers.length) throw new Error("No flight numbers found");
        const credentials = request.vendorList[0].credential;
        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();
        const departureDate = sectors[0][3];

        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.set("action", config.endpoints.fare);
        options.append("app", "information");
        options.append("org", sectors[0][1]);
        options.append("des", sectors.length > 1 ? sectors[1][2] : sectors[0][2]);
        options.set("flight_no", flightNumbers.join(","));
        options.append("flight_date", departureDate);

        url.search = options.toString();

        saveLogInFile("fare-details-request.json", { url: url.toString() } as any);
        const fareDetailsResponse = await axios.get(url.toString());
        saveLogInFile("fare-details-response.json", { url: url.toString(), data: fareDetailsResponse.data } as any);

        const result = fareDetailsResponse.data;
        if ('err_msg' in result) return { error: { message: result.err_msg } }

        if ('journey' in request) return updatedFareDetails({ result, request });
        return convertItinerary({ request, sectors, fareResponse: result, index });
    } catch (error: any) {
        console.log({ errorRetrievingFare: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export async function convertItinerary(
    { request, sectors, fareResponse, index }
        : { request: SearchRequest, sectors: AllianceFlight[], fareResponse: FareSuccessResponse, index: number }): Promise<Itinerary[] | IError> {
    try {
        const fares = getFareInfo(fareResponse);
        const paxList: Pax[] = [
            {
                type: "ADT",
                count: Number(request.paxDetail.adults) || 0,
                key: "adult"
            },
            {
                type: "CHD",
                count: Number(request.paxDetail.children) || 0,
                key: "child"
            },
            {
                type: "INF",
                count: Number(request.paxDetail.infants) || 0,
                key: "infant"
            },
        ];
        const itineraries: Itinerary[] = [];
        let idx = 0;
        for (let fare of fares) {
            try {
                const { priceBreakup, taxes, totalPrice, baseFare } = getPriceBreakup(fare, paxList);
                itineraries.push({
                    uid: randomUUID(),
                    indexNumber: index + idx,
                    baseFare,
                    taxes,
                    totalPrice,
                    currency: fare.currency,
                    provider: "9I",
                    promoCodeType: "",
                    valCarrier: "",
                    fareFamily: "Regular Fare",
                    airSegments: await convertSegment(sectors, fare),
                    priceBreakup,
                    freeSeat: false,
                    freeMeal: false,
                    carbonEmission: "",
                    refundableFare: true,
                    fareType: "RP",
                    promotionalCode: "",
                    key: `${fareResponse.ws_access_id}`,
                    hostTokens: [],
                    sessionKey: "",
                    inPolicy: false,
                    isRecommended: true
                });
                idx += 1;
            } catch (error: any) {
                console.log({ error });
            }
        }
        saveLogInFile("itineraries.json", itineraries as any);
        return itineraries;
    } catch (error: any) {
        console.log({ errorConvertingItinerary: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export function updatedFareDetails({ result, request }: { result: FareSuccessResponse, request: AirPricingRequest }): PriceBreakupResult | IError {
    console.log("fetching updated fare details");
    try {
        const fares = getFareInfo(result);
        const paxList: Pax[] = [
            {
                type: "ADT",
                count: 0,
                key: "adult"
            },
            {
                type: "CHD",
                count: 0,
                key: "child"
            },
            {
                type: "INF",
                count: 0,
                key: "infant"
            },
        ];
        request.journey[0].itinerary[0].priceBreakup.forEach((breakup) => {
            if (breakup.passengerType === "ADT") paxList[0].count += Number(breakup.noOfPassenger);
            if (breakup.passengerType === "CHD") paxList[1].count += Number(breakup.noOfPassenger);
            if (breakup.passengerType === "INF") paxList[2].count += Number(breakup.noOfPassenger);
        });
        const fare = fares.find((fare) => fare.fareBasis === request.journey[0].itinerary[0].airSegments[0].fareBasisCode);
        if (!fare) throw new Error("Fare not found");
        return getPriceBreakup(fare, paxList);
    } catch (error: any) {
        console.log({ errorConvertingFare: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}