import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import DigitalBusinessCardPage from '@/lib/features/digital-cards/DigitalBusinessCardPage';
import { getPublicFirebaseApp } from '@/lib/firebase/serverApp';
import professionalsServerService from '@/lib/pages/for-professionals/server/professionalsServerService';
import type { PageConfig } from '@/lib/config/pageVisibility';

interface ProfessionalPageProps {
  params: Promise<{ id: string }>;
}

async function checkPageVisibility(db: any): Promise<boolean> {
  try {
    const visibilityDoc = await getDoc(doc(db, 'settings', 'pageVisibility'));

    if (visibilityDoc.exists()) {
      const pages = visibilityDoc.data()?.pages as PageConfig[] | undefined;

      if (pages) {
        const pageConfig = pages.find(p => p.path === '/[id]');

        // If config exists, return its visibility status
        if (pageConfig) {
          console.log(`ProfessionalPage: Page visibility status: ${pageConfig.isVisible ? 'VISIBLE' : 'HIDDEN'}`);
          return pageConfig.isVisible;
        }
      }
    }
    // If no visibility settings exist, default to visible
    console.log(`ProfessionalPage: No visibility settings found, defaulting to VISIBLE`);
    return true;
  } catch (error) {
    console.error('ProfessionalPage: Error checking visibility settings:', error);
    // On error, default to visible
    return true;
  }
}

export default async function ProfessionalPage({ params }: ProfessionalPageProps) {
  const { id } = await params;
  console.log(`ProfessionalPage: Loading professional with ID or cardUrl: ${id}`);

  // Fetch database connection
  const { db } = await getPublicFirebaseApp();

  if (!db) {
    console.error('ProfessionalPage: Database unavailable');
    return notFound();
  }

  // Check page visibility settings FIRST
  const isVisible = await checkPageVisibility(db);

  if (!isVisible) {
    console.log(`ProfessionalPage: Route is HIDDEN, returning 404`);
    return notFound();
  }

  console.log(`ProfessionalPage: Route is VISIBLE, continuing...`);

  // Fetch professional data - first try cardUrl, then fall back to ID
  const professional = await professionalsServerService.getProfessionalByIdOrCardUrl(
    db,
    id,
    false // checkVisibility = false (show all professionals)
  );

  console.log(`ProfessionalPage: Professional found: ${professional ? 'YES' : 'NO'}`);
  if (professional) {
    console.log(`ProfessionalPage: Professional name: ${professional.name}, cardUrl: ${professional.cardUrl || 'none'}`);
  }

  if (!professional || !professional.hasDigitalCard) {
    console.error(`ProfessionalPage: Professional not found or no digital card: ${id}`);
    return notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        <DigitalBusinessCardPage
          professional={professional}
        />
      </div>
    </div>
  );
}

// SEO metadata generation
export async function generateMetadata({ params }: ProfessionalPageProps) {
  const { id } = await params;

  try {
    const { db } = await getPublicFirebaseApp();

    if (!db) {
      return {
        title: 'Beauty Professional | Glamlink',
        description: 'Find and book with certified beauty professionals on Glamlink.',
      };
    }

    // Use same lookup method - cardUrl first, then ID
    const professional = await professionalsServerService.getProfessionalByIdOrCardUrl(
      db,
      id,
      false // checkVisibility = false (show all professionals)
    );

    if (professional) {
      return {
        title: `Digital Card - ${professional.name} | Glamlink`,
        description: professional.bio || `View the digital card for ${professional.name}, a ${professional.specialty || 'beauty professional'} in ${professional.location || 'your area'}.`,
        openGraph: {
          title: `Digital Card - ${professional.name}`,
          description: professional.bio || `Professional beauty services by ${professional.name}`,
          images: professional.profileImage ? [professional.profileImage] : [],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Beauty Professional | Glamlink',
    description: 'Find and book with certified beauty professionals on Glamlink.',
  };
}
