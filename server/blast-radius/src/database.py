import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin import initialize_app
import os
import logging
from typing import Dict, Optional

# Initialize logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


# Configuration
class Config:
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')
    FIREBASE_COLLECTIONS = {
        'organizations': 'organizations',
        'settings': 'settings',
        'users': 'users'
    }


# Feature Flags
class FeatureFlags:
    def __init__(self, pr_summaries_enabled: bool, jira_ticket_enabled: bool):
        self.pr_summaries_enabled = pr_summaries_enabled
        self.jira_ticket_enabled = jira_ticket_enabled


# Prompt Templates
class PromptTemplates:
    def __init__(self, system_instructions: Optional[str] = None, pr_analysis_prompt: Optional[str] = None):
        self.system_instructions = system_instructions
        self.pr_analysis_prompt = pr_analysis_prompt


class DatabaseService:
    def __init__(self):
        # Ensure Firebase credentials and project are set up
        if not Config.FIREBASE_PROJECT_ID:
            raise ValueError('FIREBASE_PROJECT_ID environment variable is required')

        # Initialize Firebase Admin SDK
        try:
            # Initialize Firebase Admin SDK if it's not already initialized
            firebase_admin.get_app()
        except ValueError:
            # If no app has been initialized, initialize a new one
            cred = credentials.ApplicationDefault()  # Or use a service account key if needed
            initialize_app(cred, {
                'projectId': Config.FIREBASE_PROJECT_ID,
            })
            logger.info(f"Firebase initialized with project ID: {Config.FIREBASE_PROJECT_ID}")

        # Firestore instance
        self.db = firestore.client()

    def get_firestore_instance(self) -> firestore.Client:
        return self.db

    async def get_jira_credentials(self, user_id: str=None) -> Dict:

        doc_ref = self.db.collection(Config.FIREBASE_COLLECTIONS['settings']).document(user_id)
        settings_doc = doc_ref.get()

        if not settings_doc.exists:
            logger.debug(f"No Jira credentials found for user: {user_id}")
            return {
                'exists': False,
                'jira_email': '',
                'jira_domain': '',
                'jira_api_token': ''
            }

        data = settings_doc.to_dict()
        logger.debug(f"Retrieved Jira credentials for user: {user_id}")

        return {
            'exists': True,
            'jira_email': data.get('jiraEmail', ''),
            'jira_domain': data.get('jiraDomain', ''),
            'jira_api_token': data.get('jiraApiToken', '')
        }

    async def get_default_feature_flags(self) -> FeatureFlags:
        try:
            doc_ref = self.db.collection('config').document('default_feature_flags')
            doc = doc_ref.get()

            if not doc.exists:
                logger.debug("No default feature flags found in Firestore, using hardcoded defaults")
                return FeatureFlags(True, False)

            data = doc.to_dict()
            return FeatureFlags(
                pr_summaries_enabled=data.get('prSummariesEnabled', True),
                jira_ticket_enabled=data.get('jiraTicketEnabled', False)
            )
        except Exception as e:
            logger.error(f"Error fetching default feature flags: {e}")
            return FeatureFlags(True, False)

    async def get_feature_flags(self, user_id: str) -> FeatureFlags:
        try:
            doc_ref = self.db.collection(Config.FIREBASE_COLLECTIONS['settings']).document(user_id)
            user_settings_doc = doc_ref.get()

            if not user_settings_doc.exists:
                logger.debug(f"No feature flags found for user: {user_id}, using defaults")
                return await self.get_default_feature_flags()

            data = user_settings_doc.to_dict()
            logger.debug(f"Retrieved feature flags for user: {user_id}")

            default_flags = await self.get_default_feature_flags()

            return FeatureFlags(
                pr_summaries_enabled=data.get('prSummariesEnabled', default_flags.pr_summaries_enabled),
                jira_ticket_enabled=data.get('jiraTicketEnabled', default_flags.jira_ticket_enabled)
            )
        except Exception as e:
            logger.error(f"Failed to retrieve feature flags for user: {user_id}, {e}")
            return await self.get_default_feature_flags()

    async def get_prompt_templates(self, user_id: str) -> PromptTemplates:
        try:
            doc_ref = self.db.collection(Config.FIREBASE_COLLECTIONS['settings']).document(user_id)
            user_settings_doc = doc_ref.get()

            if not user_settings_doc.exists:
                logger.debug(f"No custom prompts found for user: {user_id}, using defaults")
                return PromptTemplates()  # Return default empty templates

            data = user_settings_doc.to_dict()
            templates = PromptTemplates(
                system_instructions=data.get('systemInstructions'),
                pr_analysis_prompt=data.get('prAnalysisPrompt')
            )

            logger.debug(f"Retrieved custom prompts for user: {user_id}")
            return templates
        except Exception as e:
            logger.error(f"Failed to retrieve custom prompts for user: {user_id}, {e}")
            return PromptTemplates()


# Validate required environment variables
required_env_vars = ['FIREBASE_PROJECT_ID']

for env_var in required_env_vars:
    if not os.getenv(env_var):
        raise ValueError(f"{env_var} environment variable is required")
