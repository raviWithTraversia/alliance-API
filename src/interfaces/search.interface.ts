export type TravelType = "DOM" | "INT";
export type TypeOfTrip = "ONEWAY" | "ROUNDTRIP";
export type CredentialType = "TEST" | "LIVE";
export type CabinClass = "" | "Economy" | "PremiumEconomy" | "Business" | "First";

export interface Sector {
    origin: string;
    destination: string;
    departureDate: string;
    departureTimeFrom: string;
    departureTimeTo: string;
    cabinClass: CabinClass;
}
export interface PaxDetail {
    adults: number;
    children: number;
    infants: number;
    youths: number;
    student: number;
    senior: number;
}

export interface Vendor {
    vendorCode: string;
    credential: Credential;
    corporatedealCode: CorporateDeal[];
    fareTypes: string[];
    productClass: string[] | null;
    includeAirlines: string[];
    excludeAirlines: string[];
}

export interface Credential {
    userId: string;
    password: string;
    pseudoCityCode: string;
    wSAP_TargetBranch: string;
    accountNumber: string;
}

export interface CorporateDeal {
    airlineCode: string;
    dealCode: string;
    dealCodeType: string;
}

export interface SearchRequest {
    typeOfTrip: TypeOfTrip;
    credentialType: CredentialType;
    travelType: TravelType;
    systemEntity: string;
    systemName: string;
    corpCode: string;
    requestorCode: string;
    empCode: string;
    uniqueKey: string;
    version: string;
    sectors: Sector[];
    paxDetail: PaxDetail;
    maxStops: number;
    maxResult: number;
    returnSpecialFare: boolean;
    refundableOnly: boolean;
    includeAirlines: string[];
    vendorList: Vendor[];
}

export interface SearchResponse {
    uniqueKey: string;
    traceId: string;
    journey: Journey[]
}

export interface AllianceSearchResponse {
    ws_access_id: number;
    access_time: string;
    elapsed_time: string;
    err_code: string;
    err_message?: string;
    org: string;
    des: string;
    flight_date: string;
    extra_days: number;
    schedule: [AllianceFlight[], AllianceFlight[][]];
    ret_flight_date: string;
    ret_schedule: any[];
}

export interface Journey {
    journeyKey: string;
    origin: string;
    destination: string;
    itinerary: Itinerary[]
}
export interface Itinerary {
    uid: string;
    indexNumber: number;
    baseFare: number;
    taxes: number;
    totalPrice: number;
    currency: string;
    provider: string;
    promoCodeType: string;
    valCarrier: string;
    fareFamily: string;
    airSegments: AirSegment[];
    priceBreakup: PriceBreakup[];
    freeSeat: boolean;
    freeMeal: boolean;
    carbonEmission: string;
    refundableFare: boolean;
    fareType: string;
    promotionalCode: string;
    key: string;
    hostTokens: any[];
    sessionKey: string;
    inPolicy: boolean;
    isRecommended: boolean;
}

export interface AirSegment {
    airlineCode: string;
    airlineName: string;
    fltNum: string;
    classofService: string;
    cabinClass: CabinClass;
    departure: AirportDetail;
    arrival: AirportDetail;
    operatingCarrier: OperatingCarrier;
    flyingTime: string;
    travelTime: string;
    equipType: string;
    group: string;
    baggageInfo: string;
    handBaggage: string;
    offerDetails: any;
    productClass: string;
    noSeats: number;
    fareBasisCode: string;
    availabilitySource: string;
    isConnect: boolean;
    key: string;
}

export interface AirportDetail {
    code: string;
    date: string;
    time: string;
    name: string;
    terminal: string;
    cityCode: string;
    cityName: string;
    countryCode: string;
    countryName: string;
}

export interface OperatingCarrier {
    code: string;
}

export interface PriceBreakup {
    passengerType: string;
    noOfPassenger: number;
    baseFare: number;
    tax: number;
    taxBreakup: TaxBreakup[];
    airPenalty: AirPenalty[];
    key: string;
}

export interface TaxBreakup {
    taxType: string;
    amount: number;
}

export interface AirPenalty {
    type: string;
    amount: string;
}

export type AllianceFlight = [
    string, // flightNumber
    string, // origin
    string, // destination
    string, // departureDate
    string, // arrivalDate
    string, // departureTime
    string, // arrivalTime
    string, // duration
    string, // aircraft
    string, // transit
    [string, string][], // availability
    string, // key
    string, // travelDetails
    string, // status
    string, // departureDate
    string // arrivalDate
];

export interface FareErrorResponse {
    ws_access_id: number;
    access_time: string;
    elapsed_time: string;
    err_code: "0";
    err_msg: string;
}
export interface FareSuccessResponse {
    ws_access_id: number;
    access_time: string;
    elapsed_time: string;
    err_code: string;
    fare_info_index: string;
    flight_date: string;
    flight_no: string;
    return_flight: number;
    ret_flight_date: string;
    ret_flight_no: string;
    ret_fare_info: any[];
    org: string;
    des: string;
    fare_info: FareInfoList[];
}

export type FareInfoList = [
    string, // fare_basis
    FareDetailsList, // fare_details adult
    FareDetailsList, // fare_details child
    FareDetailsList, // fare_details infant
    FareDetailsList, // fare_details adult return
    FareDetailsList, // fare_details child return
    FareDetailsList, // fare_details infant return
    string, // fare_notes
    string, // is_ibook
    string, // min_stay
    string, // max_stay
    string, // currency
    number, // total_fare_agent_adult
    number, // total_fare_agent_ret_adult
    number, // total_fare_agent_child
    number, // total_fare_agent_ret_child
    number, // incentive_adult
    number, // incentive_child
    string, // bg_allow_adult
    string, // bg_allow_child
    any[], // other_fees adult
    any[], // other_fees child
    any[], // other_fees infant
];

export type FareDetailsList = [
    number, //total_fare
    number, //basic_fare
    number, //insurance
    number, //airport_tax
    number, //surcharge
    number, //terminal_fee
    number, //booking_fee
    number, //vat
]

export interface FareInfo {
    fareBasis: string;
    fares: Fares;
    notes: string;
    isIbook: string;
    minStay: string;
    maxStay: string;
    currency: string;
    totalFareAgent: {
        adult: number;
        adultReturn: number;
        child: number;
        childReturn: number;
    };
    incentive: {
        adult: number;
        child: number;
    };
    baggageAllowance: {
        adult: string;
        child: string;
    };
    otherFees: {
        adult: any[];
        child: any[];
        infant: any[];
    };
}

export interface Fares {
    adult: FareBreakup;
    child: FareBreakup;
    infant: FareBreakup;
    adultReturn: FareBreakup;
    childReturn: FareBreakup;
    infantReturn: FareBreakup;
};

export interface FareBreakup {
    total_fare: number;
    basic_fare: number;
    insurance: number;
    airport_tax: number;
    surcharge: number;
    terminal_fee: number;
    booking_fee: number;
    vat: number;
}