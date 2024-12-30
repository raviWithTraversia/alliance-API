// External imports
import { Request, Response } from "express";

// Internal imports
import { handleBooking } from "../core/air-book.core";

export async function airBookController(req: Request, res: Response) {
    try {
        const result: any = await handleBooking(req.body);
        if (result.error)
            res.status(500).json({ success: false, status: 500, message: "Something went wrong", reason: result.error.message, data: result.response });
        else res.status(200).json({ success: true, status: 200, message: "Air booking results retrieved successfully", data: result });
    } catch (airBookingError: any) {
        console.log({ airBookingError });
        res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: airBookingError.stack, reason: airBookingError.message });
    }
}