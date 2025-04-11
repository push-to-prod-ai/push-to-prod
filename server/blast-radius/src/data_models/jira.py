import os
import asyncio
import requests
from requests.auth import HTTPBasicAuth
from pydantic import BaseModel, model_validator
import structlog

from src.database import DatabaseService

logger = structlog.getLogger(__name__)

class JiraIssues:
    class JiraIssue(BaseModel):
        issue_id: int
        key: str
        summary: str
        description: str
        issue_type: str
        URL: str

        @model_validator(mode='before')
        @classmethod
        def process_description(cls, data):
            def traverse_content(content):
                raw_text = ""
                for item in content:
                    if item['type'] == 'text':
                        raw_text += item['text'] + ' '
                    if 'content' in item:
                        raw_text += traverse_content(item['content'])
                return raw_text

            raw_description = data['description']
            if isinstance(raw_description, dict):
                # Convert rich-text description to plain text
                data['description'] = traverse_content(raw_description['content']).strip()

            elif raw_description is None:
                data['description'] = ''

            return data

        @property
        def textual_representation(self):
            return f'KEY: {self.key} \n SUMMARY: {self.summary} \n DESCRIPTION: {self.description}'

    def __init__(self):
        try:
            self.dbs = DatabaseService()
            creds = asyncio.run(self.dbs.get_jira_credentials())

        except Exception as e:
            logger.info("Error with Firebase connection", error=e)
            creds = {
                "exists": False,
                "jira_domain": "",
                "jira_api_token": "",
                "jira_email": ""
            }

        if not creds['exists']:
            self.JIRA_URL = os.getenv("JIRA_URL", "https://push-to-prod.atlassian.net")
            self.JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")
            self.JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
        else:
            self.JIRA_URL = creds['jira_domain']
            self.JIRA_API_TOKEN = creds['jira_api_token']
            self.JIRA_EMAIL = creds['jira_email']

        self.issues = []

    def get_all(self):
        url = f"{self.JIRA_URL}/rest/api/3/search"
        headers = {
            "Authorization": f"Bearer {self.JIRA_API_TOKEN}",
            "Content-Type": "application/json"
        }
        params = {"fields": "summary,description,issuetype"}

        auth = HTTPBasicAuth(self.JIRA_EMAIL, self.JIRA_API_TOKEN)

        response = requests.get(url, headers=headers, params=params, auth=auth)
        response.raise_for_status()

        issues = response.json().get("issues", [])

        # Extract relevant fields
        return [
            self.JiraIssue(
                issue_id=issue["id"],
                key=issue["key"],
                summary=issue["fields"]["summary"],
                description=issue["fields"].get("description", ""),
                issue_type=issue["fields"]["issuetype"]["name"],
                URL=f"{self.JIRA_URL}/browse/{issue['key']}"  # Construct Jira link
            )
            for issue in issues
        ]

    def add_comment(self, comment_content: str, issue_key: str):
        url = f"{self.JIRA_URL}/rest/api/3/issue/{issue_key}/comment"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        auth = HTTPBasicAuth(self.JIRA_EMAIL, self.JIRA_API_TOKEN)
        # Atlassian Document Format (ADF) body
        # Use Atlassian Document Format (ADF) for Jira Cloud
        payload = {
            "body": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": comment_content
                            }
                        ]
                    }
                ]
            }
        }

        response = requests.post(url, headers=headers, auth=auth, json=payload)

        if response.status_code == 201:
            logger.info(
                "Comment added successfully",
                comment=comment_content,
                url=url
            )
        else:
            logger.info("Failed to add comment", status_code=response.status_code,response_text=response.text)

'''
Test Code:
# Initialize connection:
dbs = JiraIssues()
# Get issues:
test_key = dbs.get_all()[0].key
# Add comment:
dbs.add_comment(comment_content="test comment", issue_key=test_key)
'''
