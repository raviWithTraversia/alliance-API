import { CommonRequest } from "./common.interface";

export interface ImportPNRRequest extends CommonRequest {
    journey: ImportPNRJourney[]
};

export interface ImportPNRJourney {
    uid: string;
    origin: string;
    destination: string;
    itinerary: ImportPNRItinerary[];
};
export interface ImportPNRItinerary {
    recordLocator: string;
};

export interface PNRRetrieveResponse {
    ws_access_id: number;
    access_time: string;
    elapsed_time: string;
    err_code: string;
    err_msg?: string;
    book_code: string;
    num_code: number;
    caller: string;
    normal_sales: number;
    book_balance: number;
    pax_list: PNRPax[];
    route_info: PNRRouteInfo[];
    route_detail: PNRRouteDetail[];
    ssr_detail: any[];
    book_ancillary_fee: PNRAuxiliaryFee[];
    payment_history: PNRPaymentHistory[];
    contact: string;
    contact2: string;
    contact_email: string;
    book_by: string;
    book_office_by: string;
    book_ccy: string;
    org_des: string;
    pay_limit: string;
    create_time: string;
};
export interface PNRFareRetrieveResponse {
    ws_access_id: number;
    access_time: string;
    elapsed_time: string;
    err_code: string;
    book_code: string;
    book_ccy: string;
    book_balance: string;
    normal_sales: string;
    detail_price: PNRFareDetail[];
}

export type PNRFareDetail = [
    string, //book_code
    string, //passenger_name
    string, //origin
    string, //destination
    string, //fare_type
    number, //amount
];

export type AlliancePaxType = ['A', 'C', "I"];

export type PNRPax = [
    string, // firstName
    string, // lastName
    string, // phone
    string, // passport.number
    string, // nationality
    string, // type [A | C | I]
    string, // ticket no.
    string, // seat no.
    string, // dob
    string, // farePrice
    string, // title
    string, // paxId
];

export type PNRRouteInfo = [
    string, // origin
    string, // destination
    string, // departureDate
    string, // arrivalDate
    string, // departureTime
    string, // arrivalTime
    string, // subclass
    string, // flightNumber
    string, // additionalInfo
    string, // status
    string, // cabinClass
    string, // ticketNumber
    string, // fareBasis
];

export type PNRRouteDetail = [
    string, // firstName
    string, // lastName
    string, // passengerType
    string, // title
    string, // nationality
    string, // dateOfBirth
    string, // origin
    string, // destination
    string, // departureDate
    string, // arrivalDate
    string, // departureTime
    string, // arrivalTime
    string, // flightNumber
    string, // bookingClass
    string, // cabinClass
    string, // seatNumber
    string, // additionalInfo
    string, // ticketNumber
    string, // contactNumber
    string, // fareBasis
    string, // status
    string, // flightStatus
];

export type PNRAuxiliaryFee = [
    string, // feeType
    number, // amount
];

export type PNRPaymentHistory = [
    string, //paymentDate
    string, //paymentMethod
    string, //paymentDescription
    number, //amount
];
