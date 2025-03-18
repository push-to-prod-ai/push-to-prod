import { Probot } from "probot";
/**
 * AppService class that handles all GitHub app functionality
 */
export declare class AppService {
    private logger;
    private aiService;
    private blastRadiusService;
    private ticketService;
    private ticketFeatureFlag;
    constructor();
    /**
     * Initialize the app with Probot
     * @param app Probot instance
     */
    initialize(app: Probot): void;
}
/**
 * Create the app with Probot
 * @param app Probot instance
 */
export declare const createApp: (app: Probot) => void;
export default createApp;
