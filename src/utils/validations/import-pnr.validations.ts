import { vendorListValidations } from "./common.validations";
import { check } from "./validations.utils";
export const journeyValidations = [
    check("journey")
        .notEmpty().withMessage("journey required")
        .isArray({ min: 1 }).withMessage("journey must be an array with journey details"),
    check("journey.*.origin").notEmpty().withMessage("journey origin required"),
    check("journey.*.destination").notEmpty().withMessage("journey destination required"),
    check("journey.*.itinerary")
        .notEmpty().withMessage("journey itinerary required")
        .isArray({ min: 1 }).withMessage("journey itinerary must be an array with itinerary details"),
    check("journey.*.itinerary.*.recordLocator").notEmpty().withMessage("recordLocator required in itinerary")
];

export const importPNRValidations = [
    check('typeOfTrip').isIn(['ONEWAY', 'ROUNDTRIP', 'MULTICITY']).withMessage('typeOfTrip must be ONEWAY, ROUNDTRIP or MULTICITY'),
    check('credentialType').isIn(['TEST', 'LIVE']).withMessage('credentialType must be TEST or LIVE'),
    check('travelType').isIn(['DOM', 'INT']).withMessage('travelType must be DOM or INT'),
    check('uniqueKey').notEmpty().withMessage('uniqueKey is required'),
    check('traceId').notEmpty().withMessage('traceId is required'),
    ...vendorListValidations,
    ...journeyValidations
];
