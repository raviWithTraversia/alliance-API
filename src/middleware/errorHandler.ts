// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/CustomError';
import { saveLogInFile } from '../utils/save-log';

const errorHandler = (err: CustomError | any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    const status = err.status || 500;
    const response: any = {
        success: false,
        status,
        message: err.message || 'Internal Server Error',
        reason: err.reason || null,
    };
    saveLogInFile("error-response.json", response);
    res.status(status).json(response);
};

export default errorHandler;
