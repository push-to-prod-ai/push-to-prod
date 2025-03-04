import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import type { JiraCredentials, ServiceResponse } from '../types/index.js';
import { config } from '../config/index.js';
import { Logger } from '../utils/logger.js';

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
  async getJiraCredentials(userId: string): ServiceResponse<JiraCredentials> {
    try {
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
    } catch (error) {
      this.logger.error(`Error retrieving Jira credentials: ${error}`);
      throw new Error('Failed to retrieve Jira credentials from database');
    }
  }
} 