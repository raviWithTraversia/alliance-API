import { Journey } from "./search.interface";

export type PaxType = ["ADT", "CHD", "INF"];
export interface BookingJourney extends Journey {
    travellerDetails: TravelerDetails[]
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