import { NextFunction, Request, Response, Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { airBookController } from '../controllers/air-book.controller';
import { airBookingValidations } from '../utils/validations/air-book.validations';
import { saveLogInFile } from '../utils/save-log';

const router = Router();

router.post('/airbooking',
    airBookingValidations, validateRequest, airBookController);

export default router;