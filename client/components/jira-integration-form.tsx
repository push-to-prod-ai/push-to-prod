'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function JiraIntegrationForm() {
  const { status } = useSession();
  
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraApiToken, setJiraApiToken] = useState('');
  const [jiraDomain, setJiraDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  // Use useCallback to memoize the function
  const fetchExistingSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings`);
      
      if (response.status === 401) {
        // API will redirect if unauthorized due to middleware
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setJiraEmail(data.jiraEmail || '');
        setJiraDomain(data.jiraDomain || '');
        setHasExistingSettings(true);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies since we removed router

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExistingSettings();
    }
  }, [status, fetchExistingSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      interface SettingsPayload {
        jiraEmail: string;
        jiraDomain: string;
        jiraApiToken?: string;
      }
      
      const payload: SettingsPayload = {
        jiraEmail,
        jiraDomain,
      };
      
      if (jiraApiToken) {
        payload.jiraApiToken = jiraApiToken;
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setSuccess(true);
      setHasExistingSettings(true);
      
      // Clear API token field after successful save
      setJiraApiToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="jiraEmail">Jira Email</Label>
        <Input
          id="jiraEmail"
          type="email"
          value={jiraEmail}
          onChange={(e) => setJiraEmail(e.target.value)}
          required
          placeholder="your-email@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="jiraApiToken">
          Jira API Token
          {hasExistingSettings && (
            <span className="ml-2 text-xs text-muted-foreground">(Leave blank to keep current token)</span>
          )}
        </Label>
        <Input
          id="jiraApiToken"
          type="password"
          value={jiraApiToken}
          onChange={(e) => setJiraApiToken(e.target.value)}
          required={!hasExistingSettings}
          placeholder="Your Jira API token"
        />
        <p className="text-xs text-muted-foreground">
          <a 
            href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-primary"
          >
            Learn how to create a Jira API token
          </a>
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="jiraDomain">Jira Domain</Label>
        <div className="flex">
          <div className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted border-input">
            https://
          </div>
          <Input
            id="jiraDomain"
            type="text"
            className="rounded-l-none"
            placeholder="company.atlassian.net"
            value={jiraDomain}
            onChange={(e) => setJiraDomain(e.target.value)}
            required
          />
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
} 