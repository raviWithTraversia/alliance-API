import { IError } from "./common.interface";
import { CredentialType, Journey, TravelType, TypeOfTrip, Vendor } from "./search.interface";

export type PaxType = ["ADT", "CHD", "INF"];

export interface BookingRequestJourney extends Journey {
    travellerDetails: TravelerDetails[]
}
export interface BookingResponseJourney extends BookingRequestJourney {
    status: BookingStatus;
    recLocInfo: null | RecordLocator[];
}
export interface ETicket {
    eTicketNumber: string
}
export interface BookingResponse {
    uniqueKey: string;
    traceId: string;
    journey: BookingResponseJourney[];
}
export interface BookingStatus {
    pnrStatus: "Failed" | "Pending" | "Confirmed";
    paymentStatus: "Unpaid" | "Paid";
}
export interface RecordLocator {
    type: string;
    pnr: string;
}
export interface BookingRequest {
    typeOfTrip: TypeOfTrip;
    credentialType: CredentialType;
    travelType: TravelType;
    uniqueKey: string;
    traceId: string;
    vendorList: Vendor[];
    journey: BookingRequestJourney[];
}
export interface BookingResponse {
    uniqueKey: string;
    traceId: string;
    journey: BookingResponseJourney[];
}
export interface TravelerDetails {
    travellerId: string;
    type: string;
    title: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dob: string;
    gender: string;
    seatPreferences: [] | null;
    baggagePreferences: [] | null;
    mealPreferences: [] | null;
    passportDetails: PassportDetails | null;
    contactDetails: ContactDetails | null;
    frequentFlyer: FrequentFlyer[] | null;
    nationality: string;
    department: string;
    designation: string;
    eTicket: null | ETicket[]
}

export interface PassportDetails {
    number: string;
    issuingCountry: string;
    expiry: string;
}

export interface ContactDetails {
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string | null;
    countryCode: string;
    email: string;
    phone: string;
    mobile: string;
    postalCode: string;
    isdCode: string | null;
}

export interface FrequentFlyer {
    ffNumber: string;
    carrier: string;
}

export interface AllianceBookResponse {
    ws_access_id: number;
    access_time: string;
    elapsed_time: string;
    err_code: string;
    org: string;
    des: string;
    round_trip: number;
    book_code: string;
    dep_date: string;
    dep_flight_no: string;
    pax_num: [number, number, number];
    pax_name: string[];
    normal_sales: number;
    book_balance: number;
    pay_limit: string;
    status: string;
    additional_message: string;
    book_ccy: string;
}

export interface AlliancePaymentResponse {
    ws_access_id: number;
    access_time: string;
    elapsed_time: string;
    err_code: string;
    err_msg?: string;
    book_code: string;
    book_balance: number;
    ccy: string;
    ticket_unit: [string, string][];
}

export interface BookingErrorResponse extends IError {
    response: BookingResponse
}