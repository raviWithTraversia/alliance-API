import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { validateRequest } from '../middleware/validateRequest';
import { airPricingValidations } from '../utils/validations/air-pricing.validations';

const router = Router();

router.post('/ticket', airPricingValidations, validateRequest, searchController);

export default router;