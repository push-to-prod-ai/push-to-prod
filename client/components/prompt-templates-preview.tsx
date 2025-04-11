'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export function PromptTemplatesPreview() {
  const [systemInstructions, setSystemInstructions] = useState('');
  const [prAnalysisPrompt, setPrAnalysisPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const templateVariablesText = "Template variables available: {{repository}}, {{title}}, {{existingDescription}}, {{baseBranch}}, {{commitSha}}, {{diffs}}";

  // Fetch default templates
  useEffect(() => {
    const fetchDefaultTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/settings?defaults=true`);
        const data = await response.json();
        
        if (data.success) {
          setSystemInstructions(data.systemInstructions || '');
          setPrAnalysisPrompt(data.prAnalysisPrompt || '');
          setError(false);
        } else {
          console.error('Error loading default templates:', data.error);
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching default templates:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultTemplates();
  }, []);

  // Show loading state while fetching templates
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if templates couldn't be loaded
  if (error) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Unable to load templates. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Own Your Documentation</h3>
        <p className="text-sm text-muted-foreground">
          <a href="https://github.com/apps/pushtoprod-ai" className="text-primary hover:underline">Install the app</a> and visit the{' '}
          <Link href="/settings" className="text-primary hover:underline">settings page</Link> to control how Gemini summarizes your code.
        </p>
      </div>
      
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
              readOnly
              className="min-h-[300px] font-mono text-sm"
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
              readOnly
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 