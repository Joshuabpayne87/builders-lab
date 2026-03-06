'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Track the view
    const trackView = async () => {
      try {
        await fetch(`/api/funnels/track-view/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        // Silently fail - view tracking is non-critical
        console.error('View tracking failed:', error);
      }
    };

    // Track view after a short delay to avoid race conditions
    const timeout = setTimeout(trackView, 500);

    return () => clearTimeout(timeout);
  }, [slug]);

  return null; // This component doesn't render anything
}
