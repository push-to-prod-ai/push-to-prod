'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraApiToken, setJiraApiToken] = useState('');
  const [jiraDomain, setJiraDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExistingSettings();
    }
  }, [status]);

  const fetchExistingSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings`);
      
      if (response.status === 401) {
        // Handle unauthorized access
        router.push('/auth/signin');
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
  };

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
          jiraEmail,
          jiraApiToken,
          jiraDomain,
        }),
      });

      if (response.status === 401) {
        // Handle unauthorized access
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setSuccess(true);
      setHasExistingSettings(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {hasExistingSettings ? 'Update Jira Settings' : 'Configure Jira Integration'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="jiraEmail">
            Jira Email
          </label>
          <input
            id="jiraEmail"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={jiraEmail}
            onChange={(e) => setJiraEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="jiraApiToken">
            Jira API Token {hasExistingSettings && <span className="text-xs text-gray-500">(Leave blank to keep current token)</span>}
          </label>
          <input
            id="jiraApiToken"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={jiraApiToken}
            onChange={(e) => setJiraApiToken(e.target.value)}
            required={!hasExistingSettings}
          />
          <p className="text-xs mt-1 text-gray-500">
            <a href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/" 
               target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Learn how to create a Jira API token
            </a>
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="jiraDomain">
            Jira Domain
          </label>
          <div className="flex items-center">
            <span className="bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md">
              https://
            </span>
            <input
              id="jiraDomain"
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md"
              placeholder="company.atlassian.net"
              value={jiraDomain}
              onChange={(e) => setJiraDomain(e.target.value)}
              required
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Settings saved successfully!
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
} 