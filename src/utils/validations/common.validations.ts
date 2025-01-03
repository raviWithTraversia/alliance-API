import dayjs from "dayjs";
import { check, isValidDate } from "./validations.utils";

export const vendorListValidations = [
    check('vendorList').isArray({ min: 1 }).withMessage('vendorList must be an array with at least one element'),
    check('vendorList.*.vendorCode').notEmpty().withMessage('vendorCode is required for each vendor'),
    check('vendorList.*.corporatedealCode').isArray().withMessage('corporatedealCode must be an array for each vendor'),
    check('vendorList.*.corporatedealCode.*.airlineCode').notEmpty().withMessage('airlineCode is required for each deal'),
    check('vendorList.*.corporatedealCode.*.dealCode').notEmpty().withMessage('dealCode is required for each deal'),
    check('vendorList.*.corporatedealCode.*.dealCodeType').isIn(['TMC', 'Corporate', 'Agent']).withMessage('dealCodeType must be TMC, Corporate, or Agent'),
    check('vendorList.*.fareTypes').isArray().withMessage('fareTypes must be an array for each vendor'),
    check('vendorList.*.includeAirlines').isArray().withMessage('includeAirlines must be an array for each vendor'),
    check('vendorList.*.excludeAirlines').isArray().withMessage('excludeAirlines must be an array for each vendor')
];

export const itineraryListValidations = [
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
];

export const journeyListValidations = [
    check('journey')
        .notEmpty().withMessage("journey is required")
        .isArray({ min: 1 }).withMessage('journey must be an array containing journey details'),
    check("journey.*.journeyKey")
        .notEmpty().withMessage("journeyKey required in journey"),
    check("journey.*.origin")
        .notEmpty().withMessage("origin required in journey"),
    check("journey.*.destination")
        .notEmpty().withMessage("destination required in journey"),
    ...itineraryListValidations,
];

const travelerDetailsPath = 'journey.*.travellerDetails.*.';

export const passportValidations = [
    check(travelerDetailsPath + "passportDetails").custom((value) => {
        if (value && !value.number) throw new Error("missing traveller's passport number")
        return true;
    }),
    check(travelerDetailsPath + "passportDetails").custom((value) => {
        if (value && !value.issuingCountry) throw new Error("missing traveller's passport issuingCountry")
        return true;
    }),
    check(travelerDetailsPath + "passportDetails").custom((value) => {
        if (!value) return true;
        if (!value.expiryDate) throw new Error("missing traveller's passport expiry date");
        if (!dayjs(value.expiryDate, "YYYY-MM-DD", true).isValid())
            throw new Error(`invalid traveller's passport expiry date format, valid format is 'YYYY-MM-DD'`);
        if (dayjs(value.expiryDate).isBefore(dayjs()))
            throw new Error("traveller's passport expired, according to passport expiry date");
        return true;
    }),
]
export const frequentFlyerValidations = [
    check(travelerDetailsPath + "frequentFlyer.*").custom((value) => {
        if (value && !value.ffNumber) throw new Error("missing traveller's frequest flyer Number")
        return true;
    }),
    check(travelerDetailsPath + "frequentFlyer.*").custom((value) => {
        if (value && !value.carrier) throw new Error("missing traveller's frequent flyer carrier")
        return true;
    }),
]
const paxTypeList = ["ADT", "CHD", "INF"];
export const travelerDetailsValidations = [
    check(travelerDetailsPath + 'type')
        .notEmpty().withMessage("type is required").isIn(paxTypeList).withMessage(`invalid type valid values includes ${paxTypeList.join(", ")}`),
    check(travelerDetailsPath + 'title')
        .notEmpty().withMessage("title is required"),
    check(travelerDetailsPath + 'firstName')
        .notEmpty().withMessage("firstName is required"),
    check(travelerDetailsPath + 'lastName')
        .notEmpty().withMessage("lastName is required"),
    check(travelerDetailsPath + 'dob')
        .custom((value) => {
            if (!value) return true;
            return isValidDate(value, "YYYY-MM-DD");
        }).withMessage("invalid date format, accepted format is YYYY-MM-DD"),
    check(travelerDetailsPath + 'gender')
        .notEmpty().withMessage("gender is required"),
    ...passportValidations,
    ...frequentFlyerValidations,
    // check(travelerDetailsPath + "contactDetails")
    // .notEmpty().withMessage("contact details required for traveller"),
    // check(travelerDetailsPath + "address1").notEmpty().withMessage("address1 required for traveller"),
    // check(travelerDetailsPath + "city").notEmpty().withMessage("city required for traveller"),
    // check(travelerDetailsPath + "state").notEmpty().withMessage("state required for traveller"),
    // check(travelerDetailsPath + "country").notEmpty().withMessage("country required for traveller"),
    // check(travelerDetailsPath + "countryCode").notEmpty().withMessage("countryCode required for traveller"),
    // check(travelerDetailsPath + "email").notEmpty().withMessage("email required for traveller"),
    // check(travelerDetailsPath + "phone").notEmpty().withMessage("phone required for traveller"),
];