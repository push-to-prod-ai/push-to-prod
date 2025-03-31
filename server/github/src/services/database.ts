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
      
      // Apply defaults for any missing values
      return {
        prSummariesEnabled: data?.prSummariesEnabled !== false, // Default to true if not set
        jiraTicketEnabled: data?.jiraTicketEnabled === true, // Default to false if not set
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve feature flags for user: ${userId}`, { error });
      // Return defaults in case of error
      return this.getDefaultFeatureFlags();
    }
  }
  
  /**
   * Get default feature flag values
   * @returns The default feature flag values
   */
  private getDefaultFeatureFlags(): FeatureFlags {
    return {
      prSummariesEnabled: true,  // PR summaries enabled by default
      jiraTicketEnabled: false,  // Jira ticket integration disabled by default
    };
  }
}
