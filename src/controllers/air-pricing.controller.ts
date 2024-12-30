// External imports
import { Request, Response } from "express";

// Internal imports
import { handleAirPricing } from "../core/air-pricing.core";

export async function airPricingController(req: Request, res: Response) {
    try {
        const result: any = await handleAirPricing(req.body);
        if (result.error)
            res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: result.error.stack, reason: result.error.message });
        else res.status(200).json({ success: true, status: 200, message: "Air pricing results retrieved successfully", data: result });
    } catch (airPricingError: any) {
        console.log({ airPricingError });
        res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: airPricingError.stack, reason: airPricingError.message });
    }
}