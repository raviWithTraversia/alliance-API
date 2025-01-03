import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { importPNRValidations } from '../utils/validations/import-pnr.validations';
import { ticketController } from '../controllers/ticket.controller';

const router = Router();

router.post('/ticket', importPNRValidations, validateRequest, ticketController);

export default router;