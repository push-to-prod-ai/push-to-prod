'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PromptTemplatesForm() {
  const { status } = useSession();
  
  const [systemInstructions, setSystemInstructions] = useState('');
  const [prAnalysisPrompt, setPrAnalysisPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [setHasCustomPrompts] = useState(false);

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
        if (data.systemInstructions) {
          setSystemInstructions(data.systemInstructions);
          setHasCustomPrompts(true);
        }
        if (data.prAnalysisPrompt) {
          setPrAnalysisPrompt(data.prAnalysisPrompt);
          setHasCustomPrompts(true);
        }
      }
    } catch (err) {
      console.error('Error fetching prompt templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExistingTemplates();
    }
  }, [status, fetchExistingTemplates]);

  // Fetch default templates for the Reset button
  const fetchDefaultTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings/default-templates`);
      const data = await response.json();
      
      if (data.success) {
        setSystemInstructions(data.systemInstructions || '');
        setPrAnalysisPrompt(data.prAnalysisPrompt || '');
      }
    } catch (err) {
      console.error('Error fetching default templates:', err);
      setError('Failed to load default templates');
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

  const handleReset = () => {
    fetchDefaultTemplates();
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
              placeholder="Enter custom system instructions for the AI..."
            />
          </div>
        </TabsContent>
        
        <TabsContent value="pr" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="prAnalysisPrompt">PR Analysis Prompt Template</Label>
              <span className="text-xs text-muted-foreground">(Template with variables like {{title}}, {{diffs}}, etc.)</span>
            </div>
            <Textarea
              id="prAnalysisPrompt"
              value={prAnalysisPrompt}
              onChange={(e) => setPrAnalysisPrompt(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Enter custom PR analysis prompt template..."
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
          <AlertDescription>Prompt templates saved successfully!</AlertDescription>
        </Alert>
      )}
      
      <div className="flex space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Templates'}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </form>
  );
} 