import { AirPricingRequest } from "../interfaces/air-pricing.interface";
import { IError } from "../interfaces/common.interface";

export async function handleTicketing(request: AirPricingRequest): Promise<any | IError> {
    try {

    } catch (error: any) {
        console.log({ ticketError: error });
        const errorResponse = { error: { message: error.message, stack: error.stack } };
        return errorResponse;
    }
}
