
export interface Config {
    BASE_URL: string;
    endpoints: {
        search: string;
        fare: string;
        book: string;
        payment: string;
        retrieve_booking: string;
        retrieve_pnr_fare: string;
    }
};

const testCreds: Config = {
    BASE_URL: "http://ws.demo.awan.sqiva.com",
    endpoints: {
        search: "get_schedule_v2",
        fare: "get_fare_v2_new",
        book: "booking_v2",
        payment: "payment",
        retrieve_booking: "get_all_book_info_2",
        retrieve_pnr_fare: "get_book_price_detail_info_2"

    }
};
const liveCreds: Config = {
    BASE_URL: "http://ws.demo.awan.sqiva.com",
    endpoints: {
        search: "get_schedule_v2",
        fare: "get_fare_v2_new",
        book: "booking_v2",
        payment: "payment",
        retrieve_booking: "get_all_book_info_2",
        retrieve_pnr_fare: "get_book_price_detail_info_2"

    }
};
export async function getConfig(ENV: string): Promise<Config> {
    switch (ENV) {
        case "TEST": return testCreds;
        case "LIVE": return liveCreds;
        default: return testCreds;
    }
}

export const DEFAULTS = {
    SUPPLIER_CODE: "9I",
    CABIN_CLASS: "Economy" as "Economy",
    CLASS_OF_SERVICE: "Y",
    NO_OF_SEATS: 9,
} as const;