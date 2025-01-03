// External imports
import dayjs from "dayjs";
import axios from "axios";
import { randomUUID } from "crypto";

// Internal imports
import { Config, DEFAULTS, getConfig } from "../configs/config";
import { AirSegment } from "../interfaces/search.interface";
import { AllianceBookResponse, AlliancePaymentResponse, BookingErrorResponse, BookingRequest, BookingResponse, BookingStatus, ETicket } from "../interfaces/book.interface";
import { IError } from "../interfaces/common.interface";
import { saveLogInFile } from "../utils/save-log";
import { handleImportPNR } from "./import-pnr.core";
import { ImportPNRRequest } from "../interfaces/import-pnr.interfaces";
import { saveVendorLog } from "../utils/vendor-log";

export async function handleBooking(request: BookingRequest): Promise<BookingErrorResponse | BookingResponse> {
    const status: BookingStatus = {
        pnrStatus: "Failed",
        paymentStatus: "Unpaid"
    };
    const fieldsBeforeStatus = {
        journeyKey: "",
        origin: "",
        destination: "",
    };
    const response: BookingResponse = {
        uniqueKey: request.uniqueKey || randomUUID(),
        traceId: request.traceId || randomUUID(),
        journey: [{
            ...fieldsBeforeStatus,
            status,
            recLocInfo: null,
            ...request.journey[0],
        }]
    };
    try {
        const config = await getConfig(request.credentialType);
        const bookResponse = await processBooking(request, config);

        if ('error' in bookResponse)
            return { response, error: { message: bookResponse.error.message } };

        status.pnrStatus = "Confirmed";
        response.journey[0].recLocInfo = [{
            type: "GDS",
            pnr: bookResponse.book_code
        }];
        if (request.isHoldBooking == false) {
            const paymentResponse = await processPayment(request, config, bookResponse.book_code);
            if ('ticket_unit' in paymentResponse) {
                status.paymentStatus = "Paid";
                const ticketMap: { [key: string]: ETicket[] } = {};
                paymentResponse?.ticket_unit?.forEach?.((ticket) => {
                    if (!ticketMap[ticket[0]]) ticketMap[ticket[0]] = [];
                    ticketMap[ticket[0]].push({ eTicketNumber: ticket[1] } as ETicket);
                });
                response.journey[0].travellerDetails.forEach((traveler) => {
                    const fullName = `${traveler.firstName} ${traveler.lastName}`.toUpperCase();
                    traveler.eTicket = ticketMap[fullName] || null;
                })
            }
        }
        const importPNRRequest: ImportPNRRequest = {
            typeOfTrip: request.typeOfTrip,
            credentialType: request.credentialType,
            travelType: request.travelType,
            systemEntity: request.systemEntity,
            systemName: request.systemName,
            corpCode: request.corpCode,
            requestorCode: request.requestorCode,
            uniqueKey: request.uniqueKey,
            traceId: request.traceId,
            vendorList: request.vendorList,
            journey: [{
                uid: randomUUID(),
                origin: request.journey[0].origin,
                destination: request.journey[0].destination,
                itinerary: [{
                    recordLocator: bookResponse.book_code
                }]
            }]
        }
        const pnrResponse = await handleImportPNR(importPNRRequest, bookResponse.book_code);
        if ('error' in pnrResponse) return { response, error: pnrResponse.error };
        return pnrResponse;
    } catch (bookError: any) {
        console.log({ bookError });
        return { error: { message: bookError.message }, response }
    }
}

const salutations: any = {
    MR: "MSTR",
    MSTR: "MSTR",
    MRS: "MISS",
    MISS: "MISS",
    MS: "MISS"
};

export async function processBooking(request: BookingRequest, config: Config): Promise<AllianceBookResponse | IError> {
    let vendorRequest: any = null;
    let vendorResponse: any = null;

    try {
        const credentials = request.vendorList[0].credential;
        const journey = request.journey[0];
        const itinerary = journey.itinerary[0];
        const travelerDetails = journey.travellerDetails;

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
        if ('gstDetails' in request && request.gstDetails) {
            if (request.gstDetails?.gstNumber)
                options.append("company_gst_no", request.gstDetails.gstNumber);
            if (request.gstDetails?.companyName)
                options.append("company_name", request.gstDetails.companyName);
            if (request.gstDetails?.addressLine1)
                options.append("company_location", `${request.gstDetails?.addressLine1 ?? ""} ${request.gstDetails?.addressLine2 ?? ""} ${request.gstDetails?.city ?? ""} ${request.gstDetails?.countryCode ?? ""} ${request.gstDetails?.postalCode ?? ""}`);
        }
        const counts: any = {
            ADT: 0,
            CHD: 0,
            INF: 0
        };
        const parents = [];
        travelerDetails.forEach((traveler) => {
            counts[traveler.type] += 1;
            const paxIdx = counts[traveler.type];
            const typeKey = traveler.type.charAt(0).toLowerCase();
            if (traveler.type === "ADT") parents.push(traveler);
            if (paxIdx === 1 && traveler.type === "ADT") {
                options.append(`contact_${paxIdx}`, traveler.firstName || "");
                options.append(`email`, traveler.contactDetails?.email || "");
            }
            options.append(`${typeKey}_first_name_${paxIdx}`, traveler.firstName);
            options.append(`${typeKey}_last_name_${paxIdx}`, traveler.lastName);
            let salutation = traveler.title.toUpperCase();
            if (traveler.type !== "ADT") {
                salutation = salutations[salutation] || "MSTR";
            }
            options.append(`${typeKey}_salutation_${paxIdx}`, salutation);
            options.append(`${typeKey}_title_${paxIdx}`, traveler.title.toUpperCase());
            if (traveler.dob)
                options.append(`${typeKey}_birthdate_${paxIdx}`, dayjs(traveler.dob, "YYYY-MM-DD").format("YYYYMMDD"))

            const contact = traveler.contactDetails?.phone || traveler?.contactDetails?.mobile;
            if (contact)
                options.append(`${typeKey}_mobile_${paxIdx}`, contact);

            if (traveler.passportDetails) {
                options.append(`${typeKey}_passport_${paxIdx}`, traveler.passportDetails.number);
                options.append(`${typeKey}_passport_exp_${paxIdx}`, dayjs(traveler.passportDetails.expiry, "YYYY-MM-DD").format("YYYYMMDD"));
                options.append(`${typeKey}_nationality_${paxIdx}`, traveler.passportDetails.issuingCountry);
            }
        })

        options.append("num_pax_adult", counts.ADT);
        options.append("num_pax_child", counts.CHD);
        options.append("num_pax_infant", counts.INF);

        for (let i = 1; i <= counts.INF; i++) {
            const parentIDX = Math.min((parents.length), i);
            options.append(`i_parent_${i}`, parentIDX.toString());
        }
        url.search = options.toString();
        vendorRequest = url.toString();
        saveLogInFile("book-req.json", url.toString());
        const response = await axios.get(url.toString());
        vendorResponse = response.data;
        saveLogInFile("book-res.json", response.data);
        if (response.data.err_code != "0")
            return { error: { message: response.data?.err_msg || "Error while processing booking" } }
        return response.data as AllianceBookResponse;
    } catch (error: any) {
        console.log({ bookingError: error });
        const errorResponse: IError = { error: { message: error.message, stack: error.stack } };
        vendorResponse = { ...(vendorResponse && { vendorResponse }), ...errorResponse };
        return errorResponse;
    } finally {
        request.uniqueKey = request.uniqueKey || randomUUID();
        request.traceId = request.traceId || randomUUID();
        saveVendorLog({
            uniqueKey: request.uniqueKey,
            traceId: request.traceId,
            serviceName: "air_booking",
            systemName: config.endpoints.book || "",
            systemEntity: request?.systemEntity || "",
            vendorCode: "9I",
            vendorRequest,
            requestDateTimeStamp: new Date(),
            vendorResponse,
            responseDateTimeStamp: new Date(),
            status: vendorResponse?.error ? "failure" : "success",
        });
    }
}

export async function processPayment(request: BookingRequest, config: Config, pnr: string): Promise<AlliancePaymentResponse | IError> {
    let vendorRequest: any = null;
    let vendorResponse: any = null;

    try {
        const credentials = request.vendorList[0].credential;
        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();
        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.append("action", config.endpoints.payment);
        options.append("app", "transaction");
        options.append("book_code", pnr);
        // options.append("amount", request.journey[0].itinerary[0].totalPrice.toString());
        url.search = options.toString();
        saveLogInFile("payment.req.json", url.toString());
        vendorRequest = url.toString();
        const response = await axios.get(url.toString());
        vendorResponse = response.data;
        saveLogInFile("payment.res.json", response.data);
        if (response.data.err_code != "0") return { error: { message: response.data.err_msg || "Error while processing payment" } }
        return response.data as AlliancePaymentResponse;
    } catch (error: any) {
        console.log({ paymentError: error });
        const errorResponse: IError = { error: { message: error.message, stack: error.stack } };
        vendorResponse = { ...(vendorResponse && { vendorResponse }), ...errorResponse };
        return errorResponse;
    } finally {
        saveVendorLog({
            uniqueKey: request.uniqueKey,
            traceId: request.traceId,
            serviceName: "air_booking",
            systemName: config.endpoints.payment || "",
            systemEntity: request?.systemEntity || "",
            vendorCode: "9I",
            vendorRequest,
            requestDateTimeStamp: new Date(),
            vendorResponse,
            responseDateTimeStamp: new Date(),
            status: vendorResponse?.error ? "failure" : "success",
        });
    }
}

export function getFlightNumbers(segments: AirSegment[]) {
    const flightNumbers = segments.map(segment => segment.fltNum);
    return flightNumbers.join(",");
}

export function getFareBasisCodes(segments: AirSegment[]) {
    const fareBasisCodes = segments.map(segment => segment.fareBasisCode);
    return fareBasisCodes.join(",");
}