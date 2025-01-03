// GLOBAL IMPORTS
import dayjs from "dayjs";

// MODEL IMPORTS
import Airport from "../models/airport.model";

// INTERFACE IMPORTS
import { AirportDetail, AirSegment, AllianceFlight, FareInfo } from "../interfaces/search.interface";
import Airline from "../models/airline.model";
import { convertTimePeriod } from "./time-format";
import { DEFAULTS } from "../configs/config";

/**
 * Creates a flight segment object with formatted date and time, and additional airport information.
 * 
 * @param {Object} params - The parameters for creating the flight segment.
 * @param {string} params.code - The airport code.
 * @param {string} params.date - The flight date in YYYYMMDD format.
 * @param {string} params.time - The flight time in HHmm format.
 * @param {string} params.terminal - The terminal information.
 * 
 * @returns {Promise<Object>} The flight segment object with formatted date and time, and additional airport information.
 */
export async function createFlightSegment({ code, date, time, terminal }:
    { code: string, date: string, time: string, terminal: string }): Promise<AirportDetail> {
    const airport = await Airport.findOne({ airportCode: code });
    return {
        code,
        date: dayjs(date, "YYYYMMDD").format("DD/MM/YYYY"),
        time: dayjs(`${date}-${time}`, "YYYYMMDD-HHmm").format("HH:mm"),
        "name": airport?.airportName ?? "",
        "terminal": terminal ?? "",
        "cityCode": airport?.cityCode ?? "",
        "cityName": airport?.cityName ?? "",
        "countryCode": airport?.countryCode ?? "",
        "countryName": airport?.countryName ?? ""
    };
}


/**
 * Converts an array of AllianceFlight sectors and fare information into an array of AirSegment objects.
 *
 * @param {AllianceFlight[]} sectors - An array of AllianceFlight objects representing flight sectors.
 * @param {FareInfo} fare - An object containing fare information.
 * @returns {Promise<AirSegment[]>} A promise that resolves to an array of AirSegment objects.
 */
export async function convertSegment(sectors: AllianceFlight[], fare: FareInfo): Promise<AirSegment[]> {
    const segments: AirSegment[] = [];
    for (let sector of sectors) {
        const [airlineCode, fltNum] = sector?.[0]?.split?.("-") || [];
        const airline: any = airlineCode
            && (await Airline.findOne({ airlineCode }));
        const noOfSeats = sector?.[10]?.find?.((item: any) => ["S", "A"].includes(item[0]));
        const segment: AirSegment = {
            airlineCode,
            airlineName: airline?.airlineName || "",
            fltNum,
            classofService: DEFAULTS.CLASS_OF_SERVICE,
            cabinClass: DEFAULTS.CABIN_CLASS,
            departure: await createFlightSegment({ code: sector[1], date: sector[3], time: sector[5], terminal: sector[14] }),
            arrival: await createFlightSegment({ code: sector[2], date: sector[4], time: sector[6], terminal: sector[15] }),
            operatingCarrier: {
                code: airlineCode,
            },
            flyingTime: convertTimePeriod(sector[7]),
            travelTime: "",
            equipType: "",
            group: "0",
            baggageInfo: fare?.baggageAllowance?.adult && `${fare?.baggageAllowance?.adult}KG` || "",
            handBaggage: "",
            offerDetails: null,
            productClass: "",
            noSeats: noOfSeats?.[1] ? parseInt(noOfSeats?.[1]) : 0,
            fareBasisCode: fare.fareBasis,
            availabilitySource: "",
            isConnect: false,
            key: "",
            // sector,
            // fare
        }
        segments.push(segment)
    }
    return segments;
}