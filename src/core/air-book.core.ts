import { randomUUID } from "crypto";
import { Config, DEFAULTS, getConfig } from "../configs/config";
import { AirSegment, Itinerary, Journey } from "../interfaces/search.interface";
import dayjs from "dayjs";
import { BookingJourney, PaxType, TravelerDetails } from "../interfaces/book.interface";
import axios from "axios";
import { saveLogInFile } from "../utils/save-log";

export async function handleBooking(request: any) {
    try {
        const config = await getConfig(request.credentialType);
        const bookResponse = await processBooking(request, config);
        const defaultStatus = {
            pnrStatus: "Failed",
            paymentStatus: "Unpaid"
        };
        const response: any = {
            uniqueKey: request.uniqueKey || randomUUID(),
            traceId: request.traceId || randomUUID(),
            journey: [{
                journeyKey: "",
                origin: "",
                destination: "",
                status: defaultStatus,
                recLocInfo: null,
                ...request.journey[0]
            }]
        };
        if (bookResponse?.error) {
            return { response, error: { message: bookResponse.error.message } };
        }
        defaultStatus.pnrStatus = "Confirmed";
        response.journey[0].recLocInfo = [{
            type: "GDS",
            pnr: bookResponse.book_code
        }];
        const paymentResponse = await processPayment(request, config, bookResponse);
        if (paymentResponse?.ticket_unit?.length) {
            defaultStatus.paymentStatus = "Paid";
            const ticketMap: any = {};
            paymentResponse?.ticket_unit?.forEach?.((ticket: any) => {
                if (!ticketMap[ticket[0]]) ticketMap[ticket[0]] = [];
                ticketMap[ticket[0]].push({ eTicketNumber: ticket[1] });
            });
            response.journey[0].travellerDetails.forEach((traveler: any) => {
                const fullName = `${traveler.firstName} ${traveler.lastName}`.toUpperCase();
                traveler.eTicket = ticketMap[fullName] || null;
            })
        }
        return { paymentResponse, response };
    } catch (bookError: any) {
        console.log({ bookError });
        return { error: { message: bookError.message, stack: bookError.stack } }
    }
}

export async function processBooking(request: any, config: Config) {
    try {
        const credentials = request.vendorList[0].credential;
        const journey = request.journey[0] as BookingJourney;
        const itinerary = journey.itinerary[0] as Itinerary;
        const travelerDetails = journey.travellerDetails as TravelerDetails[];

        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();
        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.append("action", config.endpoints.book);
        options.append("app", "transaction");
        options.append("org", journey.origin);
        options.append("des", journey.destination);
        const flightNumberString = getFlightNumbers(itinerary.airSegments as AirSegment[]);
        options.append("dep_flight_no", flightNumberString);
        options.append("dep_date", dayjs(itinerary.airSegments[0].departure.date, "DD/MM/YYYY").format("YYYYMMDD"));
        const fareBasisCodesString = getFareBasisCodes(itinerary.airSegments);
        options.append("subclass_dep", fareBasisCodesString);
        options.append("caller", travelerDetails[0].firstName);
        const counts: any = {
            ADT: 0,
            CHD: 0,
            INF: 0
        };
        const parents = [];
        travelerDetails.forEach((traveler, idx) => {
            const paxIdx = idx + 1;
            const typeKey = traveler.type.charAt(0).toLowerCase();
            if (traveler.type === "ADT") parents.push(traveler);
            if (paxIdx === 1) {
                options.append(`contact_${paxIdx}`, traveler.firstName || "");
                options.append(`email`, traveler.contactDetails?.email || "");
            }
            counts[traveler.type] += 1;
            options.append(`${typeKey}_first_name_${paxIdx}`, traveler.firstName);
            options.append(`${typeKey}_last_name_${paxIdx}`, traveler.lastName);
            options.append(`${typeKey}_salutation_${paxIdx}`, traveler.title.toUpperCase());
            options.append(`${typeKey}_title_${paxIdx}`, traveler.title.toUpperCase());
            if (traveler.dob)
                options.append(`${typeKey}_birthdate_${paxIdx}`, dayjs(traveler.dob, "YYYY-MM-DD").format("YYYYMMDD"))

            const contact = traveler.contactDetails?.phone || traveler?.contactDetails?.mobile;
            if (contact)
                options.append(`${typeKey}_mobile_${paxIdx}`, contact);

            if (traveler.passportDetails) {
                options.append(`${typeKey}_passport_${paxIdx}`, traveler.passportDetails.number);
                options.append(`${typeKey}_passport_exp_${paxIdx}`, dayjs(traveler.passportDetails.expiry, "YYYY-MM-DD").format("YYYYMMDD"));
            }
            options.append(`${typeKey}_nationality_${paxIdx}`, traveler.nationality);
        })

        options.append("num_pax_adult", counts.ADT);
        options.append("num_pax_child", counts.CHD);
        options.append("num_pax_infant", counts.INF);

        for (let i = 1; i <= counts.INF; i++) {
            const parentIDX = Math.min((parents.length), i);
            options.append(`i_parent_${i}`, parentIDX.toString());
        }
        url.search = options.toString();
        saveLogInFile("book-req.json", url.toString());
        const response = await axios.get(url.toString());
        saveLogInFile("book-res.json", response.data);
        return response.data;
    } catch (error: any) {
        console.log({ processBookingError: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}
export async function processPayment(request: any, config: Config, bookResponse: any) {
    try {
        const config = await getConfig(request.credentialType);
        const credentials = request.vendorList[0].credential;
        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();
        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.append("action", config.endpoints.payment);
        options.append("app", "transaction");
        options.append("book_code", bookResponse.book_code);
        url.search = options.toString();
        saveLogInFile("payment.req.json", url.toString());
        const response = await axios.get(url.toString());
        saveLogInFile("payment.res.json", response.data);
        return response.data;
    } catch (error: any) {
        console.log({ error });
        return { error: { message: error.message, stack: error.stack } }
    }
}

export function getFlightNumbers(segments: AirSegment[]) {
    let flightNumbers: string[] = [];
    segments.forEach((segment) => {
        flightNumbers.push(segment.fltNum);
    });
    return flightNumbers.join(",");
}
export function getFareBasisCodes(segments: AirSegment[]) {
    let fareBasisCodes: string[] = [];
    segments.forEach((segment) => {
        fareBasisCodes.push(segment.fareBasisCode);
    });
    return fareBasisCodes.join(",");
}