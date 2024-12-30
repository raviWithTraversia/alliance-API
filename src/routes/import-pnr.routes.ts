import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { importPNRValidations } from '../utils/validations/import-pnr.validations';
import { importPNRController } from '../controllers/import-pnr.controller';

const router = Router();

router.post('/importPNR', importPNRValidations, validateRequest, importPNRController);

export default router;