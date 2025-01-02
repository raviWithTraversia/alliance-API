// External imports
import axios from "axios";
import dayjs from "dayjs";
import { randomUUID } from "crypto";

// Config imports
import { Config, DEFAULTS, getConfig } from "../configs/config";

// Interface imports
import { ImportPNRRequest, PNRFareRetrieveResponse, PNRPax, PNRRetrieveResponse, PNRRouteInfo } from "../interfaces/import-pnr.interfaces";
import { AirSegment, Credential, PriceBreakup } from "../interfaces/search.interface";
import { IError } from "../interfaces/common.interface";
import { BookingResponse, BookingStatus, RecordLocator, TravelerDetails } from "../interfaces/book.interface";

// Utility imports
import { saveLogInFile } from "../utils/save-log";
import { PriceBreakupResult } from "../utils/price-breakup";

// Model imports
import Airline from "../models/airline.model";
import Airport from "../models/airport.model";

export async function handleImportPNR(request: ImportPNRRequest, pnr: string): Promise<any | IError> {
    try {
        const config = await getConfig(request.credentialType);
        const credentials = request.vendorList[0].credential;

        const bookingResponse = await handleFetchPNRDetails({ config, credentials, pnr });
        if ('error' in bookingResponse) return bookingResponse;
        const fareResult = await handleFetchPNRFareDetails({ config, credentials, pnr });
        if ('error' in fareResult) return fareResult;
        return convertToCommonPNRResponse({ request, result: bookingResponse, fareResult });
    } catch (error: any) {
        console.log({ importPNRError: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export async function handleFetchPNRDetails({ config, credentials, pnr }
    : { config: Config, credentials: Credential, pnr: string })
    : Promise<PNRRetrieveResponse | IError> {
    try {
        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();

        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.append("action", config.endpoints.retrieve_booking);
        options.append("app", "information");
        options.append("book_code", pnr);

        url.search = options.toString();
        saveLogInFile("pnr-retrieve.req.json", url.toString());
        const response = await axios.get(url.toString());
        saveLogInFile("pnr-retrieve.res.json", response.data);
        if (response.data.err_code != "0") return { error: { message: response.data.err_msg } };
        return response.data as PNRRetrieveResponse;
    } catch (error: any) {
        console.log({ errorFetchingPNRDetails: error });
        return { error: { message: error.message, stack: error.stack } };
    }
}

export async function handleFetchPNRFareDetails({ config, credentials, pnr }
    : { config: Config, credentials: Credential, pnr: string })
    : Promise<PNRFareRetrieveResponse | IError> {
    try {
        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();

        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.append("action", config.endpoints.retrieve_pnr_fare);
        options.append("app", "information");
        options.append("book_code", pnr);

        url.search = options.toString();
        saveLogInFile("pnr-fare-retrieve.req.json", url.toString());
        const response = await axios.get(url.toString());
        saveLogInFile("pnr-fare-retrieve.res.json", response.data);
        if (response.data.err_code != "0") return { error: { message: response.data.err_msg } };
        return response.data as PNRFareRetrieveResponse;
    } catch (error: any) {
        console.log({ errorFetchingPNRFareDetails: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export async function convertToCommonPNRResponse({ request, result, fareResult }: { request: ImportPNRRequest, result: PNRRetrieveResponse, fareResult: PNRFareRetrieveResponse }): Promise<BookingResponse | IError> {
    try {
        const travelerDetails = getTravelerDetails(result.pax_list);
        const fare = getFareDetails(fareResult, travelerDetails);
        if ('error' in fare) return fare;
        saveLogInFile("fare-details.json", fare as any);
        const airSegments = await getSegmentDetails(result.route_info);
        let recLocInfo: RecordLocator[] | null = null;
        const status: BookingStatus = {
            pnrStatus: "Failed",
            paymentStatus: "Unpaid"
        };
        if (result.book_code) {
            recLocInfo = [{
                type: "GDS",
                pnr: result.book_code
            }];
            status.pnrStatus = "Confirmed";
        }
        if (travelerDetails.some((traveler) => traveler.eTicket)) status.paymentStatus = "Paid";
        return {
            uniqueKey: request.uniqueKey || randomUUID(),
            traceId: request.traceId || randomUUID(),
            journey: [{
                journeyKey: randomUUID(),
                origin: request.journey[0].origin,
                destination: request.journey[0].destination,
                status,
                recLocInfo,
                travellerDetails: travelerDetails,
                itinerary: [{
                    uid: randomUUID().toString(),
                    indexNumber: 1,
                    baseFare: fare.baseFare,
                    taxes: fare.taxes,
                    totalPrice: fare.totalPrice,
                    currency: "",
                    provider: "9I",
                    promoCodeType: "",
                    valCarrier: "",
                    fareFamily: "Regular Fare",
                    airSegments,
                    priceBreakup: fare.priceBreakup,
                    freeSeat: false,
                    freeMeal: false,
                    carbonEmission: "",
                    refundableFare: false,
                    fareType: "",
                    promotionalCode: "",
                    key: "",
                    hostTokens: [],
                    sessionKey: "",
                    inPolicy: false,
                    isRecommended: false
                }]
            }]
        }
    } catch (error: any) {
        console.log({ errorConvertingPNRResponse: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export function getTravelerDetails(travelerDetails: PNRPax[]): TravelerDetails[] {
    const travelerList: any = [];
    const types: any = {
        A: "ADT",
        C: "CHD",
        I: "INF"
    };
    for (let pax of travelerDetails) {
        try {
            const traveler: TravelerDetails = {
                travellerId: pax[11],
                type: types[pax[5]],
                title: pax[10],
                firstName: pax[0],
                middleName: "",
                lastName: pax[1],
                age: pax[8] ? dayjs().diff(convertDate(pax[8]), "y") : 0,
                dob: pax[8] ? convertDate(pax[8]) : "",
                gender: "",
                frequentFlyer: null,
                contactDetails: {
                    address1: "",
                    address2: "",
                    city: "",
                    state: "",
                    country: "",
                    countryCode: "",
                    email: "",
                    mobile: pax[3] || "",
                    phone: pax[3] || "",
                    postalCode: "",
                    isdCode: "",
                },
                seatPreferences: null,
                mealPreferences: null,
                baggagePreferences: null,
                ffwdPreferences: null,
                bofPreferences: null,
                priortyCheckinPreference: null,
                loungePreference: null,
                passportDetails: pax[3] ? {
                    number: pax[3] ?? "",
                    issuingCountry: pax[4] ?? "",
                    expiry: "",
                } : null,
                eTicket: null,
                emd: null
                // nationality: "",
                // department: "",
                // designation: ""
            };
            if (pax[6]) traveler.eTicket = [{
                eTicketNumber: pax[6]
            }];
            travelerList.push(traveler);
        } catch (error: any) {
            console.log({ errorConvertingTravelerDetails: error });
        }
    }
    return travelerList;
}

export async function getSegmentDetails(routeInfo: PNRRouteInfo[]): Promise<AirSegment[]> {
    const airSegments: any = [];
    for (let route of routeInfo) {
        try {
            const [airlineCode, flightNumber] = route[7].split("-");
            const airline = await Airline.findOne({ airlineCode: airlineCode });
            const depAirport = await Airport.findOne({ airportCode: route[0] });
            const arrAirport = await Airport.findOne({ airportCode: route[1] });
            const segment = {
                "airlineCode": airlineCode,
                "airlineName": airline?.airlineName ?? "",
                "fltNum": flightNumber,
                "classofService": "",
                "cabinClass": "Economy",
                "departure": {
                    "code": route[0],
                    "date": convertDate(route[2]),
                    "time": convertTime(route[4]),
                    "name": depAirport?.airportName ?? "",
                    "terminal": "",
                    "cityCode": depAirport?.cityCode ?? "",
                    "cityName": depAirport?.cityName ?? "",
                    "countryCode": depAirport?.countryCode ?? "",
                    "countryName": depAirport?.countryName ?? ""
                },
                "arrival": {
                    "code": route[1],
                    "date": convertDate(route[3]),
                    "time": convertTime(route[5]),
                    "name": arrAirport?.airportName ?? "",
                    "terminal": "",
                    "cityCode": arrAirport?.cityCode ?? "",
                    "cityName": arrAirport?.cityName ?? "",
                    "countryCode": arrAirport?.countryCode ?? "",
                    "countryName": arrAirport?.countryName ?? ""
                },
                "operatingCarrier": {
                    "code": airlineCode
                },
                "flyingTime": "04:30",
                "travelTime": "",
                "equipType": "773",
                "group": "0",
                "baggageInfo": "1PCG",
                "handBaggage": "7KG",
                "offerDetails": null,
                "productClass": "",
                "noSeats": 0,
                "fareBasisCode": "",
                "availabilitySource": "",
                "isConnect": true,
                "key": "1"
            };
            airSegments.push(segment);
        } catch (error: any) {
            console.log({ errorConvertingSegment: error });
        }
    }
    return airSegments;
}

export function getFareDetails(fareResult: PNRFareRetrieveResponse, travelerDetails: TravelerDetails[]): PriceBreakupResult | IError {
    try {
        const paxTypeMap: any = {};
        travelerDetails.forEach((traveler) => {
            paxTypeMap[`${traveler.firstName} ${traveler.lastName}`.toUpperCase()] = traveler.type;
        });
        let totalPrice = 0;
        let baseFare = 0;
        let taxes = 0;

        const fareBreakup: { [type: string]: PriceBreakup } = {
            "ADT": {
                passengerType: "ADT",
                noOfPassenger: 0,
                baseFare: 0,
                tax: 0,
                taxBreakup: [],
                airPenalty: [],
                key: ""
            },
            "CHD": {
                passengerType: "CHD",
                noOfPassenger: 0,
                baseFare: 0,
                tax: 0,
                taxBreakup: [],
                airPenalty: [],
                key: ""
            },
            "INF": {
                passengerType: "INF",
                noOfPassenger: 0,
                baseFare: 0,
                tax: 0,
                taxBreakup: [],
                airPenalty: [],
                key: ""
            },
        }

        const count: any = {};
        for (let fare of fareResult.detail_price) {
            const type = paxTypeMap[fare[1].toUpperCase()];
            if (!count[fare[1].toUpperCase()]) {
                fareBreakup[type].noOfPassenger += 1;
                count[fare[1].toUpperCase()] = true;
            }
            totalPrice += fare[5];
            if (fare[4] === "Basic Fare") {
                baseFare += fare[5];
                fareBreakup[type].baseFare = fare[5];
            } else {
                taxes += fare[5];
                if (!fareBreakup[type].taxBreakup.find((tax) => tax.taxType === fare[4])) {
                    fareBreakup[type].tax += fare[5];
                    fareBreakup[type].taxBreakup.push({ taxType: fare[4], amount: fare[5] });
                }
            }
        }

        return {
            priceBreakup: Object.values(fareBreakup),
            totalPrice,
            taxes,
            baseFare
        }
    } catch (error: any) {
        console.log({ errorGettingFareDetails: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export const months: any = {
    JAN: '01',
    FEB: '02',
    MAR: '03',
    APR: '04',
    MAY: '05',
    JUN: '06',
    JUL: '07',
    AUG: '08',
    SEP: '09',
    OCT: '10',
    NOV: '11',
    DEC: '12'
}

export function convertDate(dateString: string, forSegment?: boolean) {
    const [day, monthName, year2Digit] = dateString.split("-");
    const year = Number(year2Digit) > 50 && !forSegment ? `19${year2Digit}` : `20${year2Digit}`;
    return `${day}/${months[monthName]}/${year}`;
}

export function convertTime(timeString: string) {
    return `${timeString.substring(0, 2)}:${timeString.substring(2, 4)}`
}