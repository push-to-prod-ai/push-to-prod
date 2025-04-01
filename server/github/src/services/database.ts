import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { config } from '../config/index.js';
import { Logger } from '../utils/logger.js';

/**
 * Feature flags interface
 */
export interface FeatureFlags {
  prSummariesEnabled: boolean;
  jiraTicketEnabled: boolean;
}

/**
 * Interface for user-configurable prompt templates
 */
export interface PromptTemplates {
  systemInstructions?: string;
  prAnalysisPrompt?: string;
}

export class DatabaseService {
  private db: Firestore;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();

    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }

    // Initialize Firebase Admin SDK if not already initialized
    if (getApps().length === 0) {
      // Initialize with Application Default Credentials or service account
      initializeApp({
        // Deployed using an authenticated service account
        projectId: config.firebase.projectId,
      });
      this.logger.info(`Firebase initialized with project ID: ${config.firebase.projectId}`);
    }

    // Get Firestore instance
    this.db = getFirestore();
  }

  /**
   * Get the Firestore instance for direct access
   * @returns The Firestore instance
   */
  getFirestoreInstance(): Firestore {
    return this.db;
  }

  /**
   * Get Jira credentials for a user from Firestore
   * @param userId The ID of the user whose credentials to retrieve
   * @returns A promise resolving to the user's Jira credentials
   */
  async getJiraCredentials(userId: string) {
    const settingsDoc = await this.db
      .collection(config.firebase.collections.settings)
      .doc(userId)
      .get();
    
    if (!settingsDoc.exists) {
      this.logger.debug(`No Jira credentials found for user: ${userId}`);
      return {
        exists: false,
        jiraEmail: '',
        jiraDomain: '',
        jiraApiToken: ''
      };
    }
    
    const data = settingsDoc.data();
    this.logger.debug(`Retrieved Jira credentials for user: ${userId}`);
    
    return {
      exists: true,
      jiraEmail: data?.jiraEmail || '',
      jiraDomain: data?.jiraDomain || '',
      jiraApiToken: data?.jiraApiToken || ''
    };
  }

  /**
   * Get default feature flag values from Firestore
   * @returns Promise resolving to default feature flag values
   */
  private async getDefaultFeatureFlags(): Promise<FeatureFlags> {
    try {
      // Get default feature flags from config collection
      const defaultFlagsDoc = await this.db
        .collection('config')
        .doc('default_feature_flags')
        .get();
      
      if (!defaultFlagsDoc.exists) {
        this.logger.debug("No default feature flags found in Firestore, using hardcoded defaults");
        return {
          prSummariesEnabled: true,  // PR summaries enabled by default
          jiraTicketEnabled: false,  // Jira ticket integration disabled by default
        };
      }
      
      const data = defaultFlagsDoc.data();
      return {
        prSummariesEnabled: data?.prSummariesEnabled !== false, // Default to true if not set
        jiraTicketEnabled: data?.jiraTicketEnabled === true, // Default to false if not set
      };
    } catch (error) {
      this.logger.error("Error fetching default feature flags:", error);
      // Use hardcoded defaults in case of error
      return {
        prSummariesEnabled: true,
        jiraTicketEnabled: false,
      };
    }
  }

  /**
   * Get feature flag settings from Firestore for a specific user
   * @param userId The ID of the user whose feature flags to retrieve
   * @returns A promise resolving to the feature flag settings with defaults applied
   */
  async getFeatureFlags(userId: string): Promise<FeatureFlags> {
    try {
      // Get user-specific settings
      const userSettingsDoc = await this.db
        .collection(config.firebase.collections.settings)
        .doc(userId)
        .get();
      
      if (!userSettingsDoc.exists) {
        this.logger.debug(`No feature flags found for user: ${userId}, using defaults`);
        return this.getDefaultFeatureFlags();
      }
      
      const data = userSettingsDoc.data();
      this.logger.debug(`Retrieved feature flags for user: ${userId}`);
      
      // Get default flags to use as fallback
      const defaultFlags = await this.getDefaultFeatureFlags();
      
      // Apply user settings, falling back to defaults for any missing values
      return {
        prSummariesEnabled: data?.prSummariesEnabled !== false ? true : defaultFlags.prSummariesEnabled,
        jiraTicketEnabled: data?.jiraTicketEnabled === true ? true : defaultFlags.jiraTicketEnabled,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve feature flags for user: ${userId}`, { error });
      // Return defaults in case of error
      return this.getDefaultFeatureFlags();
    }
  }

  /**
   * Get custom prompt templates for a user, falling back to defaults if not set
   * @param userId The ID of the user whose templates to retrieve
   * @returns A promise resolving to the user's custom prompt templates or defaults
   */
  async getPromptTemplates(userId: string): Promise<PromptTemplates> {
    try {
      const userSettingsDoc = await this.db
        .collection(config.firebase.collections.settings)
        .doc(userId)
        .get();
      
      if (!userSettingsDoc.exists) {
        this.logger.debug(`No custom prompts found for user: ${userId}, using defaults`);
        return {}; // Return empty object to use defaults
      }
      
      const data = userSettingsDoc.data();
      const templates: PromptTemplates = {};
      
      // Only include fields if they exist in the database
      if (data?.systemInstructions) templates.systemInstructions = data.systemInstructions;
      if (data?.prAnalysisPrompt) templates.prAnalysisPrompt = data.prAnalysisPrompt;
      
      this.logger.debug(`Retrieved custom prompts for user: ${userId}`);
      return templates;
    } catch (error) {
      this.logger.error(`Failed to retrieve custom prompts for user: ${userId}`, { error });
      return {}; // Return empty object to use defaults
    }
  }
}
