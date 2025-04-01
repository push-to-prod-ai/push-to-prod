import Link from "next/link"
import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { JiraIntegrationForm } from "@/components/jira-integration-form"
import { FeatureFlagsForm } from "@/components/feature-flags-form"
import { PromptTemplatesForm } from "@/components/prompt-templates-form"

export default function Component() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Navbar />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] bg-gray-100/40 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 dark:bg-gray-800/40">
        <div className="max-w-6xl w-full mx-auto grid gap-2">
          <h1 className="font-semibold text-3xl">Settings</h1>
        </div>
        <div className="grid md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr] items-start gap-6 max-w-6xl w-full mx-auto">
          <nav className="text-sm text-gray-500 grid gap-4 dark:text-gray-400">
            <Link href="#integrations" className="font-semibold text-gray-900 dark:text-gray-50" prefetch={false}>
              Integrations
            </Link>
            <Link href="#features" prefetch={false}>
              Features
            </Link>
            <Link href="#prompts" prefetch={false}>
              Prompt Templates
            </Link>
          </nav>
          <div className="grid gap-6">
            <Card id="integrations">
              <CardHeader>
                <CardTitle>Jira Integration</CardTitle>
                <CardDescription>Configure your Jira account settings for integration.</CardDescription>
              </CardHeader>
              <CardContent>
                <JiraIntegrationForm />
              </CardContent>
            </Card>
            <Card id="features">
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable application features.</CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagsForm />
              </CardContent>
            </Card>
            <Card id="prompts">
              <CardHeader>
                <CardTitle>AI Prompts</CardTitle>
                <CardDescription>Customize AI prompts for PR descriptions and Jira summaries.</CardDescription>
              </CardHeader>
              <CardContent>
                <PromptTemplatesForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}