import { Probot } from "probot";
import { Request, Response } from 'express';
export declare function setupConfigPage(app: Probot): {
    getSetupPage: (_req: Request, res: Response) => Promise<void>;
    handleSetupSave: (req: Request, res: Response) => Promise<void>;
};
