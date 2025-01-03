import { CommonRequest, IError } from "./common.interface";
import { Journey } from "./search.interface";

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
    pnrStatus: "Failed" | "Hold" | "Confirm";
    paymentStatus: "Unpaid" | "Paid";
}
export interface RecordLocator {
    type: string;
    pnr: string;
}
export interface BookingRequest extends CommonRequest {
    journey: BookingRequestJourney[];
    gstDetails?: GSTDetails | null;
    isHoldBooking: boolean;
}
export interface BookingResponse {
    uniqueKey: string;
    traceId: string;
    journey: BookingResponseJourney[];
    gstDetails?: GSTDetails | null;
}
export interface GSTDetails {
    fullName?: string | null;
    emailAddress?: string | null;
    homePhone?: string | null;
    workPhone?: string | null;
    gstNumber?: string | null;
    companyName?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    provinceState?: string | null;
    postalCode?: string | null;
    countryCode?: string | null;
}
export interface TravelerDetails {
    travellerId: string;
    type: string;
    title: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    dob: string;
    age: number;
    gender: string;
    seatPreferences: null,
    mealPreferences: null,
    baggagePreferences: null,
    ffwdPreferences: null,
    bofPreferences: null,
    priortyCheckinPreference: null,
    loungePreference: null,
    passportDetails: PassportDetails | null;
    contactDetails: ContactDetails | null;
    frequentFlyer: FrequentFlyer[] | null;
    nationality?: string;
    // department: string;
    // designation: string;
    eTicket: null | ETicket[],
    emd: null
}

export interface PassportDetails {
    number: string;
    issuingCountry: string;
    expiryDate: string;
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