import { Metadata } from 'next';
import Header from '@/components/Header';
import SettingsForm from '../components/SettingsForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Push to Prod - Configuration',
  description: 'Configure your Push to Prod app settings after installation',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Configure your Push to Prod Installation</h1>
          <p className="text-center mb-8 text-gray-600">
            Thank you for installing Push to Prod! To complete the setup, please provide your Jira credentials below.
          </p>
          <Suspense fallback={<div className="text-center p-4">Loading settings form...</div>}>
            <SettingsForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}