'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Type definitions for better type safety
interface JiraSettings {
  jiraEmail: string;
  jiraApiToken: string;
  jiraDomain: string;
}

interface FormStatus {
  loading: boolean;
  success: boolean;
  error: string;
  hasExistingSettings: boolean;
}

// Custom hook to manage Jira settings
function useJiraSettings() {
  const router = useRouter();
  const [formData, setFormData] = useState<JiraSettings>({
    jiraEmail: '',
    jiraApiToken: '',
    jiraDomain: '',
  });
  
  const [status, setStatus] = useState<FormStatus>({
    loading: false,
    success: false,
    error: '',
    hasExistingSettings: false,
  });

  // Fetch existing settings
  const fetchSettings = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const response = await fetch('/api/settings');
      
      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setFormData(prev => ({
          ...prev,
          jiraEmail: data.jiraEmail || '',
          jiraDomain: data.jiraDomain || '',
        }));
        setStatus(prev => ({ ...prev, hasExistingSettings: true }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Save settings
  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(prev => ({ 
      ...prev, 
      loading: true,
      error: '',
      success: false
    }));

    try {
      const payload: Partial<JiraSettings> = {
        jiraEmail: formData.jiraEmail,
        jiraDomain: formData.jiraDomain,
      };
      
      // Only include API token if provided (for updates)
      if (formData.jiraApiToken) {
        payload.jiraApiToken = formData.jiraApiToken;
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.push('/auth/signin');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setStatus(prev => ({ 
        ...prev, 
        success: true,
        hasExistingSettings: true
      }));
    } catch (err) {
      setStatus(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'An unknown error occurred'
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return {
    formData,
    status,
    fetchSettings,
    saveSettings,
    handleInputChange
  };
}

export default function SettingsForm() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { 
    formData, 
    status, 
    fetchSettings, 
    saveSettings, 
    handleInputChange 
  } = useJiraSettings();
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [authStatus, router]);

  // Fetch existing settings when authenticated
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchSettings();
    }
  }, [authStatus]);

  // Show loading state while checking authentication
  if (authStatus === 'loading') {
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
        Configure Jira Integration
      </h2>
      
      <form onSubmit={saveSettings}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="jiraEmail">
            Jira Email
          </label>
          <input
            id="jiraEmail"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.jiraEmail}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="jiraApiToken">
            Jira API Token {status.hasExistingSettings && <span className="text-xs text-gray-500">(Leave blank to keep current token)</span>}
          </label>
          <input
            id="jiraApiToken"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.jiraApiToken}
            onChange={handleInputChange}
            required={!status.hasExistingSettings}
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
              value={formData.jiraDomain}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        {status.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {status.error}
          </div>
        )}
        
        {status.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Settings saved successfully!
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={status.loading}
        >
          {status.loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
} 