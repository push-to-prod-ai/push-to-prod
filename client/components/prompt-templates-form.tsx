'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RotateCcw, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PromptTemplatesForm() {
  const { status } = useSession();
  
  const [systemInstructions, setSystemInstructions] = useState('');
  const [prAnalysisPrompt, setPrAnalysisPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasCustomPrompts, setHasCustomPrompts] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const templateVariablesText = "Template variables available: {{repository}}, {{title}}, {{existingDescription}}, {{baseBranch}}, {{commitSha}}, {{diffs}}";

  // Fetch default templates
  const fetchDefaultTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/settings?defaults=true`);
      const data = await response.json();
      
      if (data.success) {
        setSystemInstructions(data.systemInstructions || '');
        setPrAnalysisPrompt(data.prAnalysisPrompt || '');
        return true;
      } else {
        console.error('Error loading default templates:', data.error);
        return false;
      }
    } catch (err) {
      console.error('Error fetching default templates:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing prompt templates
  const fetchExistingTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings`);
      
      if (response.status === 401) {
        // API will redirect if unauthorized due to middleware
        return;
      }
      
      const data = await response.json();
      
      if (data.exists) {
        let hasCustom = false;
        
        // Check if user has custom prompts set
        if (data.systemInstructions) {
          setSystemInstructions(data.systemInstructions);
          hasCustom = true;
        }
        
        if (data.prAnalysisPrompt) {
          setPrAnalysisPrompt(data.prAnalysisPrompt);
          hasCustom = true;
        }
        
        setHasCustomPrompts(hasCustom);
        
        // If no custom prompts, fetch default ones
        if (!hasCustom) {
          await fetchDefaultTemplates();
        }
      } else {
        // No user settings exist at all, fetch defaults
        await fetchDefaultTemplates();
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Error fetching prompt templates:', err);
      // If error occurs, still try to load defaults
      await fetchDefaultTemplates();
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExistingTemplates();
    }
  }, [status, fetchExistingTemplates]);

  // Reset to default templates
  const handleReset = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setResetSuccess(false);
      
      // Fetch the default templates first
      const success = await fetchDefaultTemplates();
      
      if (success) {
        // Remove custom templates from user settings
        const saveResponse = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstructions: null, // Explicitly set to null to remove custom setting
            prAnalysisPrompt: null    // Explicitly set to null to remove custom setting
          }),
        });
        
        if (saveResponse.ok) {
          setHasCustomPrompts(false);
          setResetSuccess(true);
        } else {
          throw new Error('Failed to save default templates');
        }
      } else {
        throw new Error('Failed to load default templates');
      }
    } catch (err) {
      console.error('Error resetting to default templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset to default templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setResetSuccess(false);

    try {
      const payload = {
        systemInstructions,
        prAnalysisPrompt
      };
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save templates');
      }

      setSuccess(true);
      setHasCustomPrompts(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication or initializing prompts
  if (status === 'loading' || !isInitialized) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasCustomPrompts ? (
        <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You are currently using custom prompt templates.</AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900">
          <Info className="h-4 w-4" />
          <AlertDescription>You are using the default prompt templates.</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="system">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">System Instructions</TabsTrigger>
          <TabsTrigger value="pr">PR Analysis Prompt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="systemInstructions">System Instructions</Label>
              <span className="text-xs text-muted-foreground">(How the AI should behave)</span>
            </div>
            <Textarea
              id="systemInstructions"
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Loading system instructions..."
            />
          </div>
        </TabsContent>
        
        <TabsContent value="pr" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="prAnalysisPrompt">Prompt</Label>
              <span className="text-xs text-muted-foreground">
                {templateVariablesText}
              </span>
            </div>
            <Textarea
              id="prAnalysisPrompt"
              value={prAnalysisPrompt}
              onChange={(e) => setPrAnalysisPrompt(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Loading PR analysis prompt template..."
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Custom prompt templates saved successfully!</AlertDescription>
        </Alert>
      )}
      
      {resetSuccess && (
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Reset to default templates successful!</AlertDescription>
        </Alert>
      )}
      
      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Custom Templates'}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleReset} 
          disabled={loading || !hasCustomPrompts}
          title={!hasCustomPrompts ? "You're already using the default templates" : "Restore default templates"}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </form>
  );
} 