'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { formatRemainingTime } from '@/lib/site-auth/rate-limit';

/**
 * LoginForm component for site authentication
 * Note: This is for WEBSITE access, not camera credentials
 */
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/' }: LoginFormProps) {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDefaultWarning, setShowDefaultWarning] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ isLocked: boolean; remainingTime?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowDefaultWarning(false);
    setLockoutInfo(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!result.success) {
        // Handle failed login
        if (result.isLocked) {
          setLockoutInfo({ isLocked: true, remainingTime: result.remainingTime });
          setError(`Too many failed attempts (${result.attempts}/${5}). Account locked for ${formatRemainingTime(result.remainingTime || 0)}.`);
        } else if (result.attempts !== undefined) {
          const remainingAttempts = 5 - result.attempts;
          setError(`${result.message || 'Invalid credentials'}. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
        } else {
          setError(result.message || 'Invalid credentials');
        }
        
        setIsLoading(false);
        return;
      }

      // Success - show warning if using default credentials
      if (result.isDefaultCredentials) {
        setShowDefaultWarning(true);
      }

      // Redirect after brief delay to show warning if needed
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      }, result.isDefaultCredentials ? 1500 : 0);

    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-blue-600" />
            Website Login
          </CardTitle>
          <CardDescription>
            Enter credentials to access the web interface
            <br />
            <span className="text-xs text-gray-500 mt-1 block">
              (Camera credentials are configured separately in Settings)
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                <User className="h-4 w-4 inline mr-2" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="h-4 w-4 inline mr-2" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Default Credentials Warning */}
            {showDefaultWarning && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <strong>Security Warning:</strong> You&apos;re using default credentials.
                  Please change your password in Settings → Account Security.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || lockoutInfo?.isLocked}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Website'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
