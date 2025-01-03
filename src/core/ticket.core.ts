import { getConfig } from "../configs/config";
import { BookingResponse } from "../interfaces/book.interface";
import { IError } from "../interfaces/common.interface";
import { TicketRequest } from "../interfaces/ticket.interface";
import { processPayment } from "./air-book.core";
import { handleImportPNR } from "./import-pnr.core";

export async function handleTicketing(request: TicketRequest): Promise<BookingResponse | IError> {
    try {
        const pnr = request.journey[0].itinerary[0].recordLocator;
        const config = await getConfig(request.credentialType);

        const paymentResponse = await processPayment(request, config, pnr);
        if ('error' in paymentResponse) return paymentResponse;
        return handleImportPNR(request, pnr);
    } catch (error: any) {
        console.log({ ticketError: error });
        const errorResponse: IError = { error: { message: error.message, stack: error.stack } };
        return errorResponse;
    }
}
