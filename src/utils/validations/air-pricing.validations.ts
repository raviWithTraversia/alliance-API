import { check, isValidDate } from './validations.utils';

export const airPricingValidations = [
    check('typeOfTrip').isIn(['ONEWAY', 'ROUNDTRIP', 'MULTICITY']).withMessage('typeOfTrip must be ONEWAY, ROUNDTRIP or MULTICITY'),
    check('credentialType').isIn(['TEST', 'LIVE']).withMessage('credentialType must be TEST or LIVE'),
    check('travelType').isIn(['DOM', 'INT']).withMessage('travelType must be DOM or INT'),
    check('uniqueKey').notEmpty().withMessage('uniqueKey is required'),
    check('traceId').notEmpty().withMessage('traceId is required'),

    check('vendorList').isArray({ min: 1 }).withMessage('vendorList must be an array with at least one element'),
    check('vendorList.*.vendorCode').notEmpty().withMessage('vendorCode is required for each vendor'),
    check('vendorList.*.corporatedealCode').isArray().withMessage('corporatedealCode must be an array for each vendor'),
    check('vendorList.*.corporatedealCode.*.airlineCode').notEmpty().withMessage('airlineCode is required for each deal'),
    check('vendorList.*.corporatedealCode.*.dealCode').notEmpty().withMessage('dealCode is required for each deal'),
    check('vendorList.*.corporatedealCode.*.dealCodeType').isIn(['TMC', 'Corporate', 'Agent']).withMessage('dealCodeType must be TMC, Corporate, or Agent'),
    check('vendorList.*.fareTypes').isArray().withMessage('fareTypes must be an array for each vendor'),
    check('vendorList.*.includeAirlines').isArray().withMessage('includeAirlines must be an array for each vendor'),
    check('vendorList.*.excludeAirlines').isArray().withMessage('excludeAirlines must be an array for each vendor'),

    check('journey')
        .notEmpty().withMessage("journey is required")
        .isArray({ min: 1 }).withMessage('journey must be an array containing journey details'),
    check("journey.*.journeyKey")
        .notEmpty().withMessage("journeyKey required in journey"),
    check("journey.*.origin")
        .notEmpty().withMessage("origin required in journey"),
    check("journey.*.destination")
        .notEmpty().withMessage("destination required in journey"),

    check("journey.*.itinerary")
        .notEmpty().withMessage("itinerary required in journey")
        .isArray({ min: 1 }).withMessage("itinerary should be an array containing itinerary details"),
    check("journey.*.itinerary.*.uid")
        .notEmpty().withMessage("uid required in itinerary"),
    check("journey.*.itinerary.*.indexNumber")
        .notEmpty().withMessage("indexNumber required in itinerary")
        .isNumeric().withMessage("indexNumber must be a number"),
    check("journey.*.itinerary.*.baseFare")
        .notEmpty().withMessage("baseFare required in itinerary")
        .isNumeric().withMessage("baseFare must be a number"),
    check("journey.*.itinerary.*.taxes")
        .notEmpty().withMessage("taxes required in itinerary")
        .isNumeric().withMessage("taxes must be a number"),
    check("journey.*.itinerary.*.totalPrice")
        .notEmpty().withMessage("totalPrice required in itinerary")
        .isNumeric().withMessage("totalPrice must be a number"),
    check("journey.*.itinerary.*.currency")
        .notEmpty().withMessage("currency required in itinerary"),
    // airSegments validations
    check("journey.*.itinerary.*.airSegments")
        .notEmpty().withMessage("airSegments required in itinerary")
        .isArray({ min: 1 }).withMessage("airSegments must be array containing segment details"),
    // priceBreakup validations
    check("journey.*.itinerary.*.priceBreakup")
        .notEmpty().withMessage("priceBreakup required in itinerary")
        .isArray({ min: 1 }).withMessage("priceBreakup must be array containing segment details")
]