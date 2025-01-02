// INTERFACE IMPORTS
import { FareInfo, PriceBreakup } from "../interfaces/search.interface";

// UTILITY IMPORTS
import { TAX_KEYS } from "./fare-utils";

export interface Pax {
    type: "ADT" | "CHD" | "INF",
    count: number,
    key: "adult" | "child" | "infant"
};

/**
 * Calculates the price breakup for a given fare and list of passengers.
 *
 * @param fare - The fare information containing fare details for different passenger types.
 * @param paxList - The list of passengers with their types and counts.
 * @returns An object containing the detailed price breakup, total price, total taxes, and total base fare.
 *
 * @throws Will throw an error if the fare for a passenger type is not found.
 */

export interface PriceBreakupResult {
    priceBreakup: PriceBreakup[];
    totalPrice: number;
    taxes: number;
    baseFare: number;
}
export function getPriceBreakup(fare: FareInfo, paxList: Pax[]): PriceBreakupResult {
    let totalPrice = 0;
    let baseFare = 0;
    let taxes = 0;
    const priceBreakup: PriceBreakup[] = [];

    paxList.forEach((pax) => {
        if (pax.count) {
            const targetFare = fare.fares[pax.key];

            let total = Number(targetFare.total_fare) || 0;
            let base = Number(targetFare.basic_fare) || 0;
            if (!total || !base) throw new Error(`Fare not found for ${pax.key}`);

            let tax = total - base;

            baseFare += base * pax.count;
            taxes += tax * pax.count;
            totalPrice += total * pax.count;

            priceBreakup.push({
                "passengerType": pax.type,
                "noOfPassenger": pax.count,
                "baseFare": base,
                "tax": tax,
                "taxBreakup": TAX_KEYS.map((key) => ({
                    taxType: key,
                    amount: Number(targetFare[key]) || 0
                })),
                "airPenalty": [],
                "key": ""
            })
        }
    });
    return { priceBreakup, totalPrice, taxes, baseFare };
}