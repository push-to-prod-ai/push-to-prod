import { SettingsLayout } from "@/components/settings-layout"
import { JiraIntegrationForm } from "@/components/jira-integration-form"
import { FeatureFlagsForm } from "@/components/feature-flags-form"
import { PromptTemplatesForm } from "@/components/prompt-templates-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <SettingsLayout>
      
      <section id="features">
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Enable or disable application features.</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureFlagsForm />
          </CardContent>
        </Card>
      </section>

      <section id="prompts">
        <Card>
          <CardHeader>
            <CardTitle>AI Prompts</CardTitle>
            <CardDescription>Customize AI prompts for PR descriptions and Jira summaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <PromptTemplatesForm />
          </CardContent>
        </Card>
      </section>

      <section id="integrations">
        <Card>
          <CardHeader>
            <CardTitle>Jira Integration</CardTitle>
            <CardDescription>Configure your Jira account settings for integration.</CardDescription>
          </CardHeader>
          <CardContent>
            <JiraIntegrationForm />
          </CardContent>
        </Card>
      </section>
    </SettingsLayout>
  )
}