export interface Place {
  placeId: string;
  name: string;
  address: string;
  category?: string;
  rating?: number;
  userRating?: number;
  location: {
    lat: number;
    lng: number;
  };
  tags?: string[];
  notes?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  lastVisited?: string;
  visitCount?: number;
}

export interface PlaceDetails extends Place {
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow: boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    weekdayText?: string[];
  };
  priceLevel?: number;
  photos?: Photo[];
  reviews?: Review[];
  activity?: PlaceActivity;
}

export interface PlaceActivity {
  visits: Visit[];
  reviews: Review[];
  photos: Photo[];
  insights?: {
    favoriteTime?: string;
    averageVisitDuration?: number;
    seasonalPattern?: string;
    companionPattern?: string;
  };
}

export interface Visit {
  date: string;
  duration?: number;
  companions?: string[];
  notes?: string;
  rating?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Review {
  id: string;
  date: string;
  rating: number;
  text?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Photo {
  id: string;
  url: string;
  date: string;
  caption?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface SearchParams {
  query?: string;
  category?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  limit?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface SentimentFilter {
  sentiment: 'positive' | 'negative' | 'neutral';
  minRating?: number;
  limit?: number;
}

export interface PreferenceAnalysis {
  topCategories: Array<{ category: string; count: number; avgRating: number }>;
  topLocations: Array<{ location: string; count: number; avgRating: number }>;
  ratingDistribution: { [key: number]: number };
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  patterns: {
    favoriteTimeOfDay?: string;
    favoriteDayOfWeek?: string;
    seasonalPreferences?: Array<{ season: string; count: number }>;
    pricePreference?: string;
  };
  trends: {
    recentFavorites: Place[];
    emergingCategories: string[];
    decliningInterest: Place[];
  };
}

export interface Recommendation {
  place: Place;
  confidence: number;
  reasons: string[];
  moodMatch?: string;
  categoryMatch?: string;
  locationMatch?: boolean;
}

export interface Insights {
  totalPlaces: number;
  totalVisits: number;
  averageRating: number;
  favoritePlaces: Place[];
  recentDiscoveries: Place[];
  trends: {
    mostVisitedCategory: string;
    trendingLocations: string[];
    ratingTrend: 'improving' | 'declining' | 'stable';
  };
  patterns: {
    visitFrequency: string;
    preferredPriceRange: string;
    timePreferences: string;
  };
  recommendations: Recommendation[];
}
