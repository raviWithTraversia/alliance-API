
export interface Config {
    BASE_URL: string;
    endpoints: {
        search: string;
        fare: string;
    }
};

const testCreds: Config = {
    BASE_URL: "http://ws.demo.awan.sqiva.com",
    endpoints: {
        search: "get_schedule_v2",
        fare: "get_fare_v2_new"
    }
};
const liveCreds: Config = {
    BASE_URL: "http://ws.demo.awan.sqiva.com",
    endpoints: {
        search: "get_schedule_v2",
        fare: "get_fare_v2_new"
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
    SUPPLIER_CODE: "9I"
}