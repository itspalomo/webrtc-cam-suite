'use client';

import { Suspense } from 'react';
import { AuthGate } from '@/components/layout/auth-gate';
import { MainLayout } from '@/components/layout/main-layout';
import { SettingsForm } from '@/components/forms/settings-form';
import { saveConfig } from '@/config';
import { AppConfig } from '@/types';
import { toast } from 'sonner';

/**
 * Settings page component
 * Allows users to configure server settings, cameras, and preferences
 */
export default function SettingsPage() {
  return (
    <AuthGate>
      <MainLayout title="Settings">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">
                Configure your MediaMTX server connection, camera streams, and playback preferences
              </p>
            </div>

            {/* Settings Form */}
            <Suspense fallback={
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            }>
              <SettingsContent />
            </Suspense>
          </div>
        </div>
      </MainLayout>
    </AuthGate>
  );
}

/**
 * SettingsContent component that loads and manages settings
 * Separated to allow for Suspense boundary
 */
function SettingsContent() {
  const handleSaveSettings = async (config: AppConfig) => {
    try {
      await saveConfig(config);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <SettingsForm
      onSave={handleSaveSettings}
      onCancel={handleCancel}
    />
  );
}
