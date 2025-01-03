export type TravelType = "DOM" | "INT";
export type TypeOfTrip = "ONEWAY" | "ROUNDTRIP";
export type CredentialType = "TEST" | "LIVE";
export type CabinClass = "" | "Economy" | "PremiumEconomy" | "Business" | "First";

export interface IError {
    error: {
        message: string,
        stack?: string
    }
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

export interface CommonRequest {
    typeOfTrip: TypeOfTrip,
    credentialType: CredentialType,
    travelType: TravelType,
    systemEntity?: string,
    systemName?: string,
    corpCode?: string,
    requestorCode?: string,
    empCode?: string,
    uniqueKey: string,
    traceId?: string,
    vendorList: Vendor[],
}