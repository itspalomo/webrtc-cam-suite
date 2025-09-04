'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Camera,
  Settings as SettingsIcon,
  Play,
  Volume2,
  Wifi,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { AppConfig, Camera as CameraType, ValidationResult } from '@/types';
import { loadConfig, saveConfig, testServerConnection, validateServerUrl } from '@/config';

/**
 * SettingsForm provides comprehensive configuration management
 * Handles server settings, camera management, and playback preferences
 */
interface SettingsFormProps {
  onSave?: (config: AppConfig) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function SettingsForm({
  onSave,
  onCancel,
  className = ''
}: SettingsFormProps) {
  // Form state
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionTest, setConnectionTest] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load initial config
  useEffect(() => {
    const loadedConfig = loadConfig();
    setConfig(loadedConfig);
    setIsLoading(false);
  }, []);

  // Update config field
  const updateConfig = (field: keyof AppConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    setValidationErrors([]); // Clear errors when user makes changes
  };

  // Update camera field
  const updateCamera = (cameraId: string, field: keyof CameraType, value: any) => {
    if (!config) return;
    const updatedCameras = config.cameras.map(cam =>
      cam.id === cameraId ? { ...cam, [field]: value } : cam
    );
    setConfig({ ...config, cameras: updatedCameras });
  };

  // Update camera-specific credentials
  const updateCameraCredentials = (cameraId: string, field: 'username' | 'password', value: string) => {
    if (!config) return;
    const updatedCameras = config.cameras.map(cam => {
      if (cam.id === cameraId) {
        const currentCredentials = cam.credentials || { username: '', password: '' };
        const updatedCredentials = { ...currentCredentials, [field]: value };
        
        // If both username and password are empty, remove credentials entirely
        if (!updatedCredentials.username && !updatedCredentials.password) {
          const { credentials, ...camWithoutCredentials } = cam;
          return camWithoutCredentials;
        }
        
        return { ...cam, credentials: updatedCredentials };
      }
      return cam;
    });
    setConfig({ ...config, cameras: updatedCameras });
  };

  // Add new camera
  const addCamera = () => {
    if (!config) return;
    const newCamera: CameraType = {
      id: `camera-${Date.now()}`,
      name: `Camera ${config.cameras.length + 1}`,
      path: `camera${config.cameras.length + 1}`,
      status: 'unknown',
    };
    setConfig({
      ...config,
      cameras: [...config.cameras, newCamera]
    });
  };

  // Remove camera
  const removeCamera = (cameraId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      cameras: config.cameras.filter(cam => cam.id !== cameraId)
    });
  };

  // Test server connection
  const testConnection = async () => {
    if (!config) return;

    setConnectionTest({ status: 'testing' });

    try {
      const isValidUrl = validateServerUrl(config.serverUrl);
      if (!isValidUrl) {
        setConnectionTest({
          status: 'error',
          message: 'Invalid server URL format'
        });
        return;
      }

      const isReachable = await testServerConnection(config.serverUrl);
      setConnectionTest({
        status: isReachable ? 'success' : 'error',
        message: isReachable
          ? 'Server is reachable'
          : 'Cannot connect to server. Check URL and network.'
      });
    } catch (error) {
      setConnectionTest({
        status: 'error',
        message: 'Connection test failed'
      });
    }
  };

  // Validate form
  const validateForm = (): ValidationResult => {
    if (!config) return { isValid: false, errors: ['Configuration not loaded'] };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Server URL validation
    if (!config.serverUrl.trim()) {
      errors.push('Server URL is required');
    } else if (!validateServerUrl(config.serverUrl)) {
      errors.push('Invalid server URL format');
    }

    // Camera validation
    if (config.cameras.length === 0) {
      warnings.push('No cameras configured');
    } else {
      config.cameras.forEach((cam, index) => {
        if (!cam.name.trim()) {
          errors.push(`Camera ${index + 1}: Name is required`);
        }
        if (!cam.path.trim()) {
          errors.push(`Camera ${index + 1}: Path is required`);
        }
        // Check for duplicate paths
        const duplicatePath = config.cameras.find(
          (otherCam, otherIndex) =>
            otherIndex !== index && otherCam.path === cam.path
        );
        if (duplicatePath) {
          errors.push(`Camera ${index + 1}: Duplicate path "${cam.path}"`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  // Save configuration
  const handleSave = async () => {
    if (!config) return;

    const validation = validateForm();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    try {
      await saveConfig(config);
      onSave?.(config);
    } catch (error) {
      setValidationErrors(['Failed to save configuration']);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    const defaultConfig = loadConfig(); // This will load defaults if nothing saved
    setConfig(defaultConfig);
    setValidationErrors([]);
    setConnectionTest({ status: 'idle' });
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  const validation = validateForm();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <div className="space-y-6">
        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {validation.warnings && validation.warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="server" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="server">Server</TabsTrigger>
            <TabsTrigger value="cameras">Cameras</TabsTrigger>
            <TabsTrigger value="playback">Playback</TabsTrigger>
          </TabsList>

          {/* Server Settings */}
          <TabsContent value="server" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  MediaMTX Server
                </CardTitle>
                <CardDescription>
                  Configure your MediaMTX server connection details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serverUrl">Server URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="serverUrl"
                      placeholder="http://192.168.1.100:8889"
                      value={config.serverUrl}
                      onChange={(e) => updateConfig('serverUrl', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={testConnection}
                      disabled={connectionTest.status === 'testing'}
                    >
                      {connectionTest.status === 'testing' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wifi className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {connectionTest.status !== 'idle' && (
                    <div className="flex items-center gap-2 text-sm">
                      {connectionTest.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : connectionTest.status === 'error' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : null}
                      <span className={
                        connectionTest.status === 'success' ? 'text-green-600' :
                        connectionTest.status === 'error' ? 'text-red-600' :
                        'text-gray-600'
                      }>
                        {connectionTest.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iceServers">ICE Servers (Optional)</Label>
                  <Textarea
                    id="iceServers"
                    placeholder="stun:stun.l.google.com:19302&#10;stun:stun1.l.google.com:19302"
                    value={config.iceServers?.map(server => server.urls).join('\n') || ''}
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').filter(url => url.trim());
                      const iceServers = urls.map(url => ({ urls: url.trim() }));
                      updateConfig('iceServers', iceServers);
                    }}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    One ICE server URL per line. Leave empty to use defaults.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Camera Management */}
          <TabsContent value="cameras" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Camera Configuration
                    </CardTitle>
                    <CardDescription>
                      Manage your camera streams and settings
                    </CardDescription>
                  </div>
                  <Button onClick={addCamera} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Camera
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {config.cameras.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cameras configured</p>
                    <p className="text-sm">Add your first camera to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.cameras.map((camera, index) => (
                      <div key={camera.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Camera {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCamera(camera.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Camera Name</Label>
                            <Input
                              placeholder="e.g., Nursery"
                              value={camera.name}
                              onChange={(e) => updateCamera(camera.id, 'name', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Stream Path</Label>
                            <Input
                              placeholder="e.g., nursery"
                              value={camera.path}
                              onChange={(e) => updateCamera(camera.id, 'path', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label className="text-sm font-medium">Camera-Specific Credentials (Optional)</Label>
                          <p className="text-xs text-gray-500 mb-3">
                            Leave empty to use global credentials. Set these to use different credentials for this camera.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Username</Label>
                              <Input
                                placeholder="Camera username"
                                value={camera.credentials?.username || ''}
                                onChange={(e) => updateCameraCredentials(camera.id, 'username', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Password</Label>
                              <Input
                                type="password"
                                placeholder="Camera password"
                                value={camera.credentials?.password || ''}
                                onChange={(e) => updateCameraCredentials(camera.id, 'password', e.target.value)}
                              />
                            </div>
                          </div>

                          {camera.credentials?.username && camera.credentials?.password && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600">Custom credentials configured</span>
                            </div>
                          )}
                        </div>

                        <Separator className="my-4" />

                        <div className="text-xs text-gray-500">
                          <p>WHEP URL: {config.serverUrl.replace(/\/$/, '')}/{camera.path}/whep</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playback Settings */}
          <TabsContent value="playback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Playback Preferences
                </CardTitle>
                <CardDescription>
                  Configure default playback behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-play streams</Label>
                    <p className="text-sm text-gray-500">
                      Automatically start playing when opening a camera
                    </p>
                  </div>
                  <Switch
                    checked={config.autoPlay}
                    onCheckedChange={(checked) => updateConfig('autoPlay', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Start muted</Label>
                    <p className="text-sm text-gray-500">
                      Mute streams by default to avoid unexpected audio
                    </p>
                  </div>
                  <Switch
                    checked={config.startMuted}
                    onCheckedChange={(checked) => updateConfig('startMuted', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Remember credentials</Label>
                    <p className="text-sm text-gray-500">
                      Store login credentials for future sessions
                    </p>
                  </div>
                  <Switch
                    checked={config.rememberCredentials}
                    onCheckedChange={(checked) => updateConfig('rememberCredentials', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          <div className="flex space-x-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
