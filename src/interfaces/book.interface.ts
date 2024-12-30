import { CredentialType, Journey, TravelType, TypeOfTrip, Vendor } from "./search.interface";

export type PaxType = ["ADT", "CHD", "INF"];
export interface BookingJourney extends Journey {
    travellerDetails: TravelerDetails[]
}
export interface BookingResponseJourney extends BookingJourney {
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
    journey: BookingJourney[];
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