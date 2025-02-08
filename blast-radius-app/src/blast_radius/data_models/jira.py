import os
import json
import requests
from requests.auth import HTTPBasicAuth
from pydantic import BaseModel, model_validator


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

        self.JIRA_URL = "https://push-to-prod.atlassian.net"  # TODO: change to config
        self.JIRA_API_TOKEN = os.getenv('JIRA_API_TOKEN')
        self.JIRA_EMAIL = os.getenv('JIRA_EMAIL')
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
        response.raise_for_status()  # Raise error for 4xx/5xx responses

        issues = response.json().get("issues", [])

        # Extract relevant fields
        return [
            self.JiraIssue(issue_id=issue["id"],
                           key=issue["key"],
                           summary=issue["fields"]["summary"],
                           description=issue["fields"].get("description", ""),
                           issue_type=issue["fields"]["issuetype"]["name"],
                           URL=f"{self.JIRA_URL}/browse/{issue['key']}"  # Construct Jira link
                           )
            for issue in issues
        ]


# Fetch and display Jira issues with links
# jira_issues = JiraIssues().get_all()

# print(json.dumps([j.textual_representation for j in jira_issues], indent=4))

