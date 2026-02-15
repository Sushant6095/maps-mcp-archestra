import type { Place, Recommendation } from './types.js';

export interface RecommendationParams {
  mood?: string;
  category?: string;
  location?: { lat: number; lng: number; radius?: number };
  limit?: number;
}

export class RecommendationEngine {
  private places: Place[];

  constructor(places: Place[]) {
    this.places = places;
  }

  getRecommendations(params: RecommendationParams): Recommendation[] {
    let candidates = [...this.places];

    // Filter by category
    if (params.category) {
      candidates = candidates.filter((p) => p.category === params.category);
    }

    // Filter by location
    if (params.location) {
      const { lat, lng, radius = 5000 } = params.location;
      candidates = candidates.filter((place) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          place.location.lat,
          place.location.lng
        );
        return distance <= radius;
      });
    }

    // Score and rank candidates
    const scored = candidates.map((place) => {
      const score = this.scorePlace(place, params);
      return {
        place,
        score,
      };
    });

    // Sort by score and take top results
    scored.sort((a, b) => b.score.total - a.score.total);

    const limit = params.limit || 10;
    const topCandidates = scored.slice(0, limit);

    // Generate recommendations with reasons
    return topCandidates.map(({ place, score }) => {
      const reasons: string[] = [];
      let moodMatch: string | undefined;
      let categoryMatch: string | undefined;
      let locationMatch = false;

      if (score.moodScore > 0) {
        reasons.push(`Matches your ${params.mood} mood preferences`);
        moodMatch = params.mood;
      }

      if (score.ratingScore > 0) {
        const rating = place.userRating || place.rating || 0;
        reasons.push(`Highly rated (${rating.toFixed(1)}/5)`);
      }

      if (score.visitScore > 0) {
        if (place.visitCount && place.visitCount > 1) {
          reasons.push(`You've visited ${place.visitCount} times`);
        } else if (place.visitCount === 1) {
          reasons.push('Recently discovered');
        }
      }

      if (score.sentimentScore > 0) {
        reasons.push(`Positive past experience`);
      }

      if (params.category && place.category === params.category) {
        reasons.push(`Matches your interest in ${params.category}`);
        categoryMatch = params.category;
      }

      if (params.location) {
        const distance = this.calculateDistance(
          params.location.lat,
          params.location.lng,
          place.location.lat,
          place.location.lng
        );
        if (distance <= (params.location.radius || 5000)) {
          reasons.push(`Close to your location (${Math.round(distance / 1000)}km away)`);
          locationMatch = true;
        }
      }

      // Calculate confidence (0-1 scale)
      const confidence = Math.min(score.total / 100, 1);

      return {
        place,
        confidence: Math.round(confidence * 100) / 100,
        reasons,
        moodMatch,
        categoryMatch,
        locationMatch,
      };
    });
  }

  private scorePlace(place: Place, params: RecommendationParams): {
    total: number;
    moodScore: number;
    ratingScore: number;
    visitScore: number;
    sentimentScore: number;
  } {
    let moodScore = 0;
    let ratingScore = 0;
    let visitScore = 0;
    let sentimentScore = 0;

    // Mood matching
    if (params.mood) {
      moodScore = this.matchMood(place, params.mood);
    }

    // Rating score (0-30 points)
    const rating = place.userRating || place.rating || 0;
    ratingScore = rating * 6; // Max 30 points for 5-star rating

    // Visit score (0-25 points)
    if (place.visitCount) {
      if (place.visitCount > 3) {
        visitScore = 25; // Frequent visits
      } else if (place.visitCount > 1) {
        visitScore = 15; // Multiple visits
      } else {
        visitScore = 5; // Single visit
      }
    }

    // Sentiment score (0-20 points)
    if (place.sentiment === 'positive') {
      sentimentScore = 20;
    } else if (place.sentiment === 'neutral') {
      sentimentScore = 10;
    } else if (place.sentiment === 'negative') {
      sentimentScore = 0;
    }

    // Recency bonus (0-25 points)
    let recencyScore = 0;
    if (place.lastVisited) {
      const daysSinceVisit =
        (Date.now() - new Date(place.lastVisited).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceVisit < 30) {
        recencyScore = 25;
      } else if (daysSinceVisit < 90) {
        recencyScore = 15;
      } else if (daysSinceVisit < 180) {
        recencyScore = 5;
      }
    }

    const total = moodScore + ratingScore + visitScore + sentimentScore + recencyScore;

    return {
      total,
      moodScore,
      ratingScore,
      visitScore,
      sentimentScore,
    };
  }

  private matchMood(place: Place, mood: string): number {
    const moodLower = mood.toLowerCase();
    let score = 0;

    // Mood-to-category mapping
    const moodMappings: { [key: string]: string[] } = {
      relaxed: ['beach', 'park', 'spa', 'cafe', 'library'],
      adventurous: ['hiking', 'outdoor', 'sports', 'adventure'],
      social: ['restaurant', 'bar', 'cafe', 'entertainment', 'nightlife'],
      cultural: ['museum', 'gallery', 'theater', 'landmark', 'historic'],
      romantic: ['restaurant', 'park', 'beach', 'viewpoint', 'cafe'],
      active: ['gym', 'sports', 'hiking', 'outdoor', 'fitness'],
      quiet: ['library', 'park', 'cafe', 'museum', 'gallery'],
      energetic: ['nightlife', 'sports', 'entertainment', 'festival'],
    };

    const relevantCategories = moodMappings[moodLower] || [];

    // Check category match
    if (place.category && relevantCategories.includes(place.category.toLowerCase())) {
      score += 30;
    }

    // Check tag match
    if (place.tags) {
      const matchingTags = place.tags.filter((tag) =>
        relevantCategories.some((cat) => tag.toLowerCase().includes(cat))
      );
      score += matchingTags.length * 5;
    }

    // Check sentiment match
    if (moodLower.includes('positive') || moodLower.includes('happy')) {
      if (place.sentiment === 'positive') {
        score += 10;
      }
    }

    // Default score for mood-based recommendations
    if (score === 0 && moodLower) {
      score = 5; // Small base score
    }

    return Math.min(score, 50); // Cap at 50 points
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}
