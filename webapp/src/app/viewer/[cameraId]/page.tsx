import { AuthGate } from '@/components/layout/auth-gate';
import { MainLayout } from '@/components/layout/main-layout';
import { ViewerClient } from '@/components/viewer-client';

/**
 * Camera viewer page component
 * Displays individual camera stream with controls
 */
interface ViewerPageProps {
  params: Promise<{
    cameraId: string;
  }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { cameraId } = await params;

  return (
    <AuthGate>
      <MainLayout
        title="Camera Viewer"
        showBackButton={true}
        backHref="/"
      >
        <ViewerClient cameraId={cameraId} />
      </MainLayout>
    </AuthGate>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata() {
  return {
    title: 'Camera Viewer - Camera Suite',
    description: 'Live camera stream using WebRTC WHEP protocol',
  };
}
