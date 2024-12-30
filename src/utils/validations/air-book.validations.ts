import { journeyListValidations, travelerDetailsValidations, vendorListValidations } from "./common.validations";
import { check } from "./validations.utils";

export const airBookingValidations = [
    check('typeOfTrip').isIn(['ONEWAY', 'ROUNDTRIP', 'MULTICITY']).withMessage('typeOfTrip must be ONEWAY, ROUNDTRIP or MULTICITY'),
    check('credentialType').isIn(['TEST', 'LIVE']).withMessage('credentialType must be TEST or LIVE'),
    check('travelType').isIn(['DOM', 'INT']).withMessage('travelType must be DOM or INT'),
    check('uniqueKey').notEmpty().withMessage('uniqueKey is required'),
    check('traceId').notEmpty().withMessage('traceId is required'),
    ...vendorListValidations,
    ...journeyListValidations,
    ...travelerDetailsValidations
]