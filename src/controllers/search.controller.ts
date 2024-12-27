import { Request, Response } from "express";
import { handleFlightSearch } from "../core/search.core";
import { SearchRequest } from "../interfaces/search.interface";

export async function searchFlights(req: Request, res: Response) {
    try {
        const result: any = await handleFlightSearch(req.body as SearchRequest);
        if (result.error)
            res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: result.error.stack, reason: result.error.message });
        else res.status(200).json({ success: true, status: 200, message: "Search results retrieved successfully", data: result });
    } catch (searchError: any) {
        console.log({ searchError });
        res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: searchError.stack, reason: searchError.message });
    }
}