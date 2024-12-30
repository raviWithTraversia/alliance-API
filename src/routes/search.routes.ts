import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { searchValidations } from '../utils/validations/search.validations';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/search', searchValidations, validateRequest, searchController);

export default router;