'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Camera,
  Play,
  Wifi,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  AlertCircle,
  Key,
  Shield,
  Lock,
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { AppConfig, Camera as CameraType, ValidationResult, Credentials } from '@/types';
import { loadConfig, saveConfig, testServerConnection, validateServerUrl } from '@/config';
import { 
  getDefaultCameraCredentials, 
  setDefaultCameraCredentials, 
  validateCameraCredentials 
} from '@/lib/camera-auth';
import { 
  getSiteAuthConfig, 
  setSiteCredentials, 
  shouldPromptPasswordChange 
} from '@/lib/site-auth';
import { toast } from 'sonner';
import { CredentialSecurityWarning } from '@/components/credential-security-warning';

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

  // Camera auth state
  const [defaultCameraUsername, setDefaultCameraUsername] = useState('');
  const [defaultCameraPassword, setDefaultCameraPassword] = useState('');
  const [cameraTestResult, setCameraTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Account security state
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usingDefaultCredentials, setUsingDefaultCredentials] = useState(false);

  // Load initial config and auth state
  useEffect(() => {
    const loadedConfig = loadConfig();
    setConfig(loadedConfig);

    // Load camera credentials
    const camCreds = getDefaultCameraCredentials();
    if (camCreds) {
      setDefaultCameraUsername(camCreds.username);
      setDefaultCameraPassword(camCreds.password);
    }

    // Load site credentials info
    const siteConfig = getSiteAuthConfig();
    if (siteConfig.credentials) {
      setCurrentUsername(siteConfig.credentials.username);
      setNewUsername(siteConfig.credentials.username);
    }
    setUsingDefaultCredentials(shouldPromptPasswordChange());

    setIsLoading(false);
  }, []);

  // Update config field
  const updateConfig = (field: keyof AppConfig, value: unknown) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    setValidationErrors([]); // Clear errors when user makes changes
  };

  // Update camera field
  const updateCamera = (cameraId: string, field: keyof CameraType, value: unknown) => {
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Test default camera credentials
  const testDefaultCameraCredentials = async () => {
    if (!config) return;

    if (!defaultCameraUsername || !defaultCameraPassword) {
      setCameraTestResult({
        success: false,
        message: 'Please enter both username and password'
      });
      return;
    }

    setCameraTestResult(null);

    try {
      const credentials: Credentials = {
        username: defaultCameraUsername,
        password: defaultCameraPassword
      };

      // Use first camera path for testing, or 'test' if no cameras
      const testPath = config.cameras.length > 0 ? config.cameras[0].path : 'test';
      
      const result = await validateCameraCredentials(
        config.serverUrl,
        testPath,
        credentials
      );

      setCameraTestResult({
        success: result.success,
        message: result.success 
          ? 'Credentials validated successfully!' 
          : result.error || 'Validation failed'
      });

      // Save credentials if successful
      if (result.success) {
        setDefaultCameraCredentials(credentials);
        toast.success('Default camera credentials saved');
      }
    } catch (err) {
      console.error('Failed to test credentials:', err);
      setCameraTestResult({
        success: false,
        message: 'Failed to test credentials'
      });
    }
  };

  // Handle password change
  const handleChangePassword = () => {
    if (!newUsername || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Save new credentials
    setSiteCredentials({
      username: newUsername,
      password: newPassword
    });

    setCurrentUsername(newUsername);
    setUsingDefaultCredentials(false);
    setNewPassword('');
    setConfirmPassword('');

    toast.success('Website credentials updated successfully!');
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
      // Save camera credentials
      if (defaultCameraUsername && defaultCameraPassword) {
        setDefaultCameraCredentials({
          username: defaultCameraUsername,
          password: defaultCameraPassword
        });
      }

      await saveConfig(config);
      onSave?.(config);
      toast.success('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save configuration:', err);
      setValidationErrors(['Failed to save configuration']);
      toast.error('Failed to save settings');
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="server">Server</TabsTrigger>
            <TabsTrigger value="cameras">Cameras</TabsTrigger>
            <TabsTrigger value="camera-auth">Camera Auth</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
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

          {/* Camera Authentication Tab */}
          <TabsContent value="camera-auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Camera Authentication
                </CardTitle>
                <CardDescription>
                  Configure default credentials for accessing camera streams via MediaMTX.
                  These are separate from your website login.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Security Warning */}
                <CredentialSecurityWarning />

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-900">
                    <strong>What are camera credentials?</strong>
                    <br />
                    These username/password are sent to your MediaMTX server when connecting
                    to camera streams. They are NOT the same as your website login.
                    <br /><br />
                    You can set:
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li><strong>Global defaults</strong> - used for all cameras unless overridden</li>
                      <li><strong>Per-camera credentials</strong> - specific to each camera (set in Cameras tab)</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Default Camera Credentials</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    These credentials will be used for all cameras that don&apos;t have specific credentials configured.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="camera-username">MediaMTX Username</Label>
                      <Input
                        id="camera-username"
                        placeholder="e.g., camuser"
                        value={defaultCameraUsername}
                        onChange={(e) => setDefaultCameraUsername(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="camera-password">MediaMTX Password</Label>
                      <Input
                        id="camera-password"
                        type="password"
                        placeholder="MediaMTX password"
                        value={defaultCameraPassword}
                        onChange={(e) => setDefaultCameraPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={testDefaultCameraCredentials}
                      variant="outline"
                      className="w-full"
                    >
                      <Wifi className="h-4 w-4 mr-2" />
                      Test Credentials Against Server
                    </Button>

                    {cameraTestResult && (
                      <Alert variant={cameraTestResult.success ? "default" : "destructive"}>
                        {cameraTestResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                          {cameraTestResult.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-medium text-gray-900">Security Best Practices:</p>
                  <ul className="list-disc ml-5 space-y-1 text-gray-600">
                    <li>Use different credentials for website login vs. camera access</li>
                    <li>Set per-camera credentials for cameras requiring different access levels</li>
                    <li>Rotate camera credentials regularly on your MediaMTX server</li>
                    <li>Never share camera credentials publicly or in screenshots</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Security Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Change your website login credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {usingDefaultCredentials && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Action Required:</strong> You are using the default credentials (admin/changeme).
                      Please change your password immediately to secure your installation.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Username</Label>
                    <Input
                      value={currentUsername}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="new-username">New Username</Label>
                    <Input
                      id="new-username"
                      placeholder="Enter new username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password (min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    className="w-full"
                    disabled={!newUsername || !newPassword || newPassword !== confirmPassword}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Update Website Credentials
                  </Button>
                </div>

                <Separator />

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-medium text-yellow-900">⚠️ Important</p>
                  <ul className="list-disc ml-5 space-y-1 text-yellow-800">
                    <li>Changing these credentials will log you out</li>
                    <li>Make sure to remember your new credentials</li>
                    <li>These credentials are stored locally in your browser</li>
                  </ul>
                </div>
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
