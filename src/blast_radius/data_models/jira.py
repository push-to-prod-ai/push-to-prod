import os
import json
import requests
from requests.auth import HTTPBasicAuth

from pydantic.dataclasses import dataclass

class JiraIssues:
    """
    issue_id - issue id
    key - the name of the issue key
    fields.summary – Main title of the issue
    fields.description – Detailed description
    fields.comment.comments – Past discussions (if relevant)
    fields.issuetype.name – Helps filter out irrelevant types (e.g., only Bugs & Stories)
    """

    JIRA_URL = "https://push-to-prod.atlassian.net"
    JIRA_API_TOKEN = os.getenv('JIRA_API_TOKEN')
    JIRA_EMAIL = os.getenv('JIRA_EMAIL')

    @dataclass
    class JiraIssue:

        def __init__(self,
                     issue_id: int,
                     key: str,
                     summary: str,
                     description: str,
                     issue_type: str):
        pass


    def get_jira_issues(self):
        url = f"{self.JIRA_URL}/rest/api/3/search"
        headers = {
            "Authorization": f"Bearer {self.JIRA_API_TOKEN}",
            "Content-Type": "application/json"
        }
        params = {"fields": "summary,description"}

        auth = HTTPBasicAuth(self.JIRA_EMAIL, self.JIRA_API_TOKEN)

        response = requests.get(url, headers=headers, params=params, auth=auth)
        response.raise_for_status()  # Raise error for 4xx/5xx responses

        issues = response.json().get("issues", [])

        # Extract relevant fields
        return [
            {
                "id": issue["id"],
                "key": issue["key"],
                "summary": issue["fields"]["summary"],
                "description": issue["fields"].get("description", ""),
                "url": f"{self.JIRA_URL}/browse/{issue['key']}"  # Construct Jira link
            }
            for issue in issues
        ]


    # Fetch and display Jira issues with links
    jira_issues = get_jira_issues()

    print(json.dumps(jira_issues, indent=4))

