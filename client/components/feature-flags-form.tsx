'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function FeatureFlagsForm() {
  const { status } = useSession();
  
  const [prSummariesEnabled, setPrSummariesEnabled] = useState(true);
  const [jiraTicketEnabled, setJiraTicketEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchFeatureFlags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings`);
      
      if (response.status === 401) {
        // API will redirect if unauthorized due to middleware
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setPrSummariesEnabled(data.prSummariesEnabled !== false); // Default to true if not set
        setJiraTicketEnabled(data.jiraTicketEnabled === true); // Default to false if not set
      }
    } catch (err) {
      console.error('Error fetching feature flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFeatureFlags();
    }
  }, [status, fetchFeatureFlags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prSummariesEnabled,
          jiraTicketEnabled
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setSuccess(true);
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="pr-summaries-switch" className="space-y-1">
            <span className="text-sm font-medium leading-none">PR Summaries</span>
            <p className="text-sm text-muted-foreground">
              Automatically generate summaries for pull requests.
            </p>
          </Label>
          <Switch 
            id="pr-summaries-switch" 
            checked={prSummariesEnabled}
            onCheckedChange={setPrSummariesEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="jira-ticket-switch" className="space-y-1">
            <span className="text-sm font-medium leading-none">Jira Ticket Integration</span>
            <p className="text-sm text-muted-foreground">
              Connect code changes with relevant Jira tickets.
            </p>
          </Label>
          <Switch 
            id="jira-ticket-switch" 
            checked={jiraTicketEnabled}
            onCheckedChange={setJiraTicketEnabled}
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
          <AlertDescription>Feature flags updated successfully!</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
} 