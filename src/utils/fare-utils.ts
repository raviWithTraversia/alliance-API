// INTERFACE IMPORTS
import { FareBreakup, FareDetailsList, FareInfo, FareSuccessResponse } from "../interfaces/search.interface";

export type TaxKeys = [
    "insurance",
    "airport_tax",
    "surcharge",
    "terminal_fee",
    "booking_fee",
    "vat",
];
export type DefaultFareKeys = ["total_fare", "basic_fare", ...TaxKeys]
export const TAX_KEYS: TaxKeys = [
    "insurance",
    "airport_tax",
    "surcharge",
    "terminal_fee",
    "booking_fee",
    "vat",
] as const;

export const DEFAULT_FARE_KEYS: DefaultFareKeys = [
    "total_fare",
    "basic_fare",
    ...TAX_KEYS
] as const;

// export function getFareKeys(indexes: string) {
//     try {
//         const index = indexes.indexOf("[", 3);
//         const lastIndex = indexes.indexOf("]", 0);
//         return indexes.substring(index + 1, lastIndex).split(",").map((key: string) => key.trim());
//     } catch (error: any) {
//         console.log({ error });
//     }
//     return DEFAULT_FARE_KEYS;
// }

/**
 * Generates a fare breakup object from a list of fare details.
 *
 * @param fare - An array of fare details.
 * @returns An object representing the fare breakup, where keys are derived from `DEFAULT_FARE_KEYS` and values are the corresponding fare amounts.
 *
 * @example
 * ```typescript
 * const fareDetails = [100, 200, 300];
 * const fareBreakup = getFareBreakup(fareDetails);
 * // fareBreakup might be { baseFare: 100, tax: 200, total: 300 }
 * ```
 *
 * @remarks
 * This function assumes that the length of the `fare` array matches the length of `DEFAULT_FARE_KEYS`.
 *
 * @see DEFAULT_FARE_KEYS
 */
export function getFareBreakup(fare: FareDetailsList): FareBreakup {
    return fare?.reduce?.((acc: any, fare: number, idx: number) => {
        const key = DEFAULT_FARE_KEYS[idx];
        acc[key] = fare;
        return acc;
    }, {});
}

/**
 * Retrieves fare information from the provided fare details.
 *
 * @param fare_details - The fare details object containing fare information.
 * @returns An array of FareInfo objects.
 *
 * @remarks
 * This function processes the fare details and maps them to an array of FareInfo objects.
 * It also logs the fare details to a file named "fare-info.json".
 *
 * @example
 * ```typescript
 * const fareDetails: FareSuccessResponse = {
 *   fare_info: [
 *     // fare data here
 *   ],
 *   fare_info_index: 0
 * };
 * const fareInfo = getFareInfo(fareDetails);
 * console.log(fareInfo);
 * ```
 *
 * @see saveLogInFile
 * @see getFareBreakup
 *
 * @param fare_details - The fare details object containing fare information.
 * @returns An array of FareInfo objects.
 */
export function getFareInfo(fare_details: FareSuccessResponse): FareInfo[] {
    return fare_details.fare_info.map((fare) => {
        return {
            fareBasis: fare[0],
            fares: {
                adult: getFareBreakup(fare[1]),
                child: getFareBreakup(fare[2]),
                infant: getFareBreakup(fare[3]),
                adultReturn: getFareBreakup(fare[4]),
                childReturn: getFareBreakup(fare[5]),
                infantReturn: getFareBreakup(fare[6]),
            },
            notes: fare[7],
            isIbook: fare[8],
            minStay: fare[9],
            maxStay: fare[10],
            currency: fare[11],
            totalFareAgent: {
                adult: fare[12],
                adultReturn: fare[13],
                child: fare[14],
                childReturn: fare[15],
            },
            incentive: {
                adult: fare[16],
                child: fare[17],
            },
            baggageAllowance: {
                adult: fare[18],
                child: fare[19],
            },
            otherFees: {
                adult: fare[20],
                child: fare[21],
                infant: fare[22],
            },
        };
    });
}
