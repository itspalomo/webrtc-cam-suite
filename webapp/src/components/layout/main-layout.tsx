'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Settings,
  Shield,
  LogOut,
  Camera,
  ChevronLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { clearSiteAuth } from '@/lib/site-auth';

/**
 * Main layout component for authenticated pages
 * Provides navigation and consistent structure
 */
interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

const navigationItems = [
  {
    href: '/',
    label: 'Cameras',
    icon: Home,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
  {
    href: '/privacy',
    label: 'Privacy',
    icon: Shield,
  },
];

export function MainLayout({
  children,
  title,
  showBackButton = false,
  backHref = '/'
}: MainLayoutProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await clearSiteAuth();
    // Clear session and redirect to login
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button or logo */}
            <div className="flex items-center">
              {showBackButton ? (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="mr-4"
                >
                  <Link href={backHref}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>
              ) : (
                <Link href="/" className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">WebRTC Cam Suite</span>
                </Link>
              )}
            </div>

            {/* Center - Page title */}
            {title && (
              <div className="flex-1 text-center">
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              </div>
            )}

            {/* Right side - Logout button */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-8 py-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2024 WebRTC Cam Suite</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Secure WHEP Streaming</span>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>MediaMTX Compatible</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
