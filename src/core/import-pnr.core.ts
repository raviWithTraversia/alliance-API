import axios from "axios";
import { Config, DEFAULTS, getConfig } from "../configs/config";
import { ImportPNRRequest, PNRPax, PNRRetrieveResponse, PNRRouteInfo } from "../interfaces/import-pnr.interfaces";
import { Credential } from "../interfaces/search.interface";
import { saveLogInFile } from "../utils/save-log";
import { IError } from "../interfaces/common.interface";
import dayjs from "dayjs";
import { randomUUID } from "crypto";
import Airline from "../models/airline.model";
import { convertTimePeriod } from "../utils/time-format";
import Airport from "../models/airport.model";

export async function handleImportPNR(request: ImportPNRRequest, pnr: string): Promise<any | IError> {
    try {
        const config = await getConfig(request.credentialType);
        const credentials = request.vendorList[0].credential;

        const bookingResponse = await handleFetchPNRDetails(request, config, credentials, pnr);
        if ('error' in bookingResponse) return bookingResponse;
        return convertToCommonPNRResponse(request, bookingResponse);
    } catch (error: any) {
        console.log({ importPNRError: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export async function handleFetchPNRDetails(request: ImportPNRRequest, config: Config, credentials: Credential, pnr: string): Promise<PNRRetrieveResponse | IError> {
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

export async function convertToCommonPNRResponse(request: ImportPNRRequest, PNRResponse: PNRRetrieveResponse) {
    try {
        const travelerDetails: any = getTravelerDetails(PNRResponse.pax_list);
        const airSegments: any = getSegmentDetails(PNRResponse.route_info);
        return {
            uniqueKey: request.uniqueKey || randomUUID(),
            traceId: request.traceId || randomUUID(),
            journey: [{
                status: {},
                recLocInfo: null,
                travellerDetails: travelerDetails,
                itinerary: [{
                    airSegments
                }]
            }]
        }
    } catch (error: any) {
        console.log({ errorConvertingPNRResponse: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export function getTravelerDetails(travelerDetails: PNRPax[]) {
    const travelerList: any = [];
    const types: any = {
        A: "ADT",
        C: "CHD",
        I: "INF"
    }
    for (let pax of travelerDetails) {
        try {
            const traveler = {
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
                } : null
            };
            travelerList.push(traveler);
        } catch (error: any) {
            console.log({ errorConvertingTravelerDetails: error });
        }
    }
    return travelerList;
}

export async function getSegmentDetails(routeInfo: PNRRouteInfo[]) {
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
                "cabinClass": "",
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

const months: any = {
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