import dayjs from "dayjs";
import { body, param, query } from "express-validator";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export function check(key: string) {
    const [target, ...name] = key.split('');
    switch (target) {
        case '?': return query(name);
        case ':': return param(name);
        default: return body(key);
    }
}

export function isValidDate(value: string, format?: string) {
    return dayjs(value, format || 'DD-MM-YYYY', true).isValid();
};
