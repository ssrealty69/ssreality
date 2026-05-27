'use client';

import { useEffect } from 'react';
import { useTracking } from './TrackingProvider';

interface ViewPropertyTrackerProps {
  property: {
    _id: string;
    title: string;
    price: number;
    propertyType: string;
    priceType?: string;
    location?: {
      city?: string;
    };
  };
}

export default function ViewPropertyTracker({ property }: ViewPropertyTrackerProps) {
  const { fireEvent } = useTracking();

  useEffect(() => {
    if (property) {
      fireEvent('ViewProperty', {
        content_type: 'product',
        content_ids: [property._id],
        content_name: property.title,
        value: property.price,
        currency: 'INR',
        property_type: property.propertyType,
        city: property.location?.city || '',
        listing_category: property.priceType === 'rent' ? 'Rent' : 'Sale'
      });
    }
  }, [property, fireEvent]);

  return null;
}
