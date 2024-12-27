import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty())
        next();
    else res.status(400).json({
        success: false,
        status: 400,
        message: 'Validation error',
        reason: errors.array(),
    });
};
