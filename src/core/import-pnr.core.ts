import axios from "axios";
import { DEFAULTS, getConfig } from "../configs/config";

export async function handleImportPNR(request: any, pnr: string) {
    try {
        const config = await getConfig(request.credentialType);
        const credentials = request.vendorList[0].credential;

        const url = new URL(config.BASE_URL);
        const options = new URLSearchParams();

        options.append("rqid", credentials.userId);
        options.append("airline_code", DEFAULTS.SUPPLIER_CODE);
        options.append("action", config.endpoints.retrieve_booking);
        options.append("app", "information");
        options.append("book_code", pnr);

        url.search = options.toString();
        const response = await axios.get(url.toString());
        return response.data;
    } catch (error: any) {
        console.log({ importPNRError: error });
        return { error: { message: error.message, stack: error.stack } }
    }
}