// External imports
import { Request, Response } from "express";

// Internal imports
import { handleFlightSearch } from "../core/search.core";
import { SearchRequest } from "../interfaces/search.interface";

export async function searchController(req: Request, res: Response) {
    try {
        const result = await handleFlightSearch(req.body as SearchRequest);
        if ('error' in result)
            res.status(500).json({ success: false, status: 500, message: result.error.message || "Something went wrong", stack: result.error.stack });
        else res.status(200).json({ success: true, status: 200, message: "Search results retrieved successfully", data: result });
    } catch (searchError: any) {
        console.log({ searchError });
        res.status(500).json({ success: false, status: 500, message: "Something went wrong", stack: searchError.stack, reason: searchError.message });
    }
}