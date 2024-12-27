import { Router } from 'express';
import { searchFlights } from '../controllers/search.controller';
import { searchValidations } from '../utils/validations/search.validations';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/search', searchValidations, validateRequest, searchFlights);

export default router;