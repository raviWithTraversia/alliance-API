// External imports
import { Request, Response } from "express";

// Internal imports
import { handleTicketing } from "../core/ticket.core";
import { AirPricingRequest } from "../interfaces/air-pricing.interface";
import { TicketRequest } from "../interfaces/ticket.interface";

export async function ticketController(req: Request, res: Response) {
    try {
        const result = await handleTicketing(req.body as TicketRequest);
        if ('error' in result)
            res.status(500).json({ success: false, status: 500, message: result.error.message || "Something went wrong", stack: result.error.stack });
        else res.status(200).json({ success: true, status: 200, message: "Ticketing results retrieved successfully", data: result });
    } catch (searchError: any) {
        console.log({ searchError });
        res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: searchError.stack, reason: searchError.message });
    }
}