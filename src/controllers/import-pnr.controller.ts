import { Request, Response } from "express";
import { handleBooking } from "../core/air-book.core";
import { handleImportPNR } from "../core/import-pnr.core";

export async function importPNRController(req: Request, res: Response) {
    try {
        const result: any = await handleImportPNR(req.body, req.body.journey[0].itinerary[0].recordLocator);
        if (result.error)
            res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: result.error.stack, reason: result.error.message, data: result.response });
        else res.status(200).json({ success: true, status: 200, message: "PNR results retrieved successfully", data: result });
    } catch (PNRRetrieveError: any) {
        console.log({ PNRRetrieveError });
        res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: PNRRetrieveError.stack, reason: PNRRetrieveError.message });
    }
}