import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { config } from "../config/index.js";
export class BlastRadiusService {
    auth;
    constructor() {
        this.auth = new GoogleAuth();
    }
    async getAuthenticatedClient() {
        const client = await this.auth.getIdTokenClient(config.urls.blastRadius);
        const { Authorization } = await client.getRequestHeaders();
        return axios.create({
            headers: {
                "Content-Type": "application/json",
                "Authorization": Authorization,
            },
        });
    }
    async calculateBlastRadius(summary) {
        const client = await this.getAuthenticatedClient();
        const response = await client.post(`${config.urls.blastRadius}/blast-radius/calculation`, {
            summary,
            max_items: 1,
        });
        return response.data;
    }
}
//# sourceMappingURL=blast-radius.js.map