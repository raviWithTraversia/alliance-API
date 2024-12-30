import { Router } from 'express';
import { airPricingValidations } from '../utils/validations/air-pricing.validations';
import { validateRequest } from '../middleware/validateRequest';
import { airPricingController } from '../controllers/air-pricing.controller';

const router = Router();

router.post('/airpricing', airPricingValidations, validateRequest, airPricingController);

export default router;