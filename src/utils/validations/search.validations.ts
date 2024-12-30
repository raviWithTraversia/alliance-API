import { vendorListValidations } from './common.validations';
import { check, isValidDate } from './validations.utils';

export const searchValidations = [
    check('typeOfTrip').isIn(['ONEWAY', 'ROUNDTRIP', 'MULTICITY']).withMessage('typeOfTrip must be ONEWAY, ROUNDTRIP or MULTICITY'),
    check('credentialType').isIn(['TEST', 'LIVE']).withMessage('credentialType must be TEST or LIVE'),
    check('travelType').isIn(['DOM', 'INT']).withMessage('travelType must be DOM or INT'),
    check('uniqueKey').notEmpty().withMessage('uniqueKey is required'),
    check('sectors').isArray({ min: 1 }).withMessage('sectors must be an array with at least one element'),
    check('sectors.*.origin').notEmpty().withMessage('origin is required for each sector'),
    check('sectors.*.destination').notEmpty().withMessage('destination is required for each sector'),
    check('sectors.*.departureDate').custom((value) => isValidDate(value)).withMessage('Valid departureDate is required for each sector in DD-MM-YYYY format'),
    check('sectors.*.departureTimeFrom').notEmpty().withMessage('departureTimeFrom is required for each sector'),
    check('sectors.*.departureTimeTo').notEmpty().withMessage('departureTimeTo is required for each sector'),
    check('sectors.*.cabinClass').isIn(['Economy', 'Business', 'First', 'PremiumEconomy']).notEmpty().withMessage('cabinClass is required for each sector'),
    check('paxDetail.adults').isInt({ min: 1 }).withMessage('At least one adult is required'),
    check('paxDetail.children').isInt({ min: 0 }).withMessage('children must be a non-negative integer'),
    check('paxDetail.infants').isInt({ min: 0 }).withMessage('infants must be a non-negative integer'),
    check('paxDetail.student').optional().isInt({ min: 0 }).withMessage('student must be a non-negative integer'),
    check('paxDetail.senior').optional().isInt({ min: 0 }).withMessage('senior must be a non-negative integer'),
    check('paxDetail.youths').isInt({ min: 0 }).withMessage('youths must be a non-negative integer'),
    check('maxStops').isInt({ min: 0 }).withMessage('maxStops must be a non-negative integer'),
    ...vendorListValidations,
]