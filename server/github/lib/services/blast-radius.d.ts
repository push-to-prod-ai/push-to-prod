import type { BlastRadiusResult, ServiceResponse } from "../types/index.js";
export declare class BlastRadiusService {
    private auth;
    constructor();
    private getAuthenticatedClient;
    calculateBlastRadius(summary: string): ServiceResponse<BlastRadiusResult>;
}
